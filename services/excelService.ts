import * as XLSX from 'xlsx';
import { ScheduleItem, ScheduleType, EXCEL_HEADERS } from '../types';
import { generateId, normalizeDate } from '../lib/utils'; // Import shared normalizer

// Helper to normalize strings for header comparison
const normalizeHeader = (str: string) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/：/g, ':')
    .replace(/（/g, '(')
    .replace(/）/g, ')');
};

// Helper to find a key in a row object based on possible header names
const findValue = (row: any, keys: string[]) => {
  const rowKeys = Object.keys(row);
  
  for (const k of keys) {
    const normalizedKey = normalizeHeader(k);
    const foundKey = rowKeys.find(rk => {
      const nrk = normalizeHeader(rk);
      return nrk.includes(normalizedKey) || normalizedKey.includes(nrk);
    });
    
    if (foundKey) {
        const val = row[foundKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') return val;
    }
  }
  return undefined;
};

// Safely parse number
const parseNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  const str = String(val).trim();
  if (!str) return 0;

  // Extract first number found in string (e.g., "1限" -> 1, "30名" -> 30)
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// Parse period as string, preserving commas for multiple periods
const parsePeriod = (val: any): string => {
  if (val === undefined || val === null) return "1";
  const str = String(val).trim();
  return str.replace(/限/g, '');
};

export const parseExcelFile = async (file: File): Promise<{ exams: ScheduleItem[], makeups: ScheduleItem[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Critical: cellDates: true ensures dates are parsed as JS Date objects when possible.
        // This handles Excel's date formatting and serial numbers automatically.
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const parseSheet = (sheetName: string): ScheduleItem[] => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return [];

          // 1. Read raw data
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
          if (rawRows.length === 0) return [];

          // 2. Smart Header Detection
          let headerRowIndex = 0;
          let maxMatches = 0;
          const allKeywords = Object.values(EXCEL_HEADERS).flat();

          for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
            const row = rawRows[i];
            let matches = 0;
            row.forEach((cell: any) => {
               const cellStr = String(cell);
               if (allKeywords.some(k => normalizeHeader(cellStr).includes(normalizeHeader(k)))) {
                 matches++;
               }
            });
            
            if (matches > maxMatches) {
              maxMatches = matches;
              headerRowIndex = i;
            }
          }

          const headers = rawRows[headerRowIndex].map(String);
          const dataRows = rawRows.slice(headerRowIndex + 1);

          const items: ScheduleItem[] = [];

          dataRows.forEach((rowArray) => {
             const rowObj: any = {};
             let hasContent = false;
             rowArray.forEach((cell: any, idx: number) => {
                if (headers[idx]) {
                   rowObj[headers[idx]] = cell;
                   if (cell && String(cell).trim() !== "") hasContent = true;
                }
             });

             if (!hasContent) return; 

             const dateVal = findValue(rowObj, EXCEL_HEADERS.date);
             const courseVal = findValue(rowObj, EXCEL_HEADERS.courseName);
             
             if (!dateVal && !courseVal) return;

             // Use the shared normalizeDate to ensure Format consistency (YYYY-MM-DD)
             const normalizedDate = normalizeDate(dateVal);

             items.push({
                id: generateId(),
                date: normalizedDate,
                courseName: String(courseVal || '未知科目'),
                period: parsePeriod(findValue(rowObj, EXCEL_HEADERS.period)),
                studentsKyoto: parseNumber(findValue(rowObj, EXCEL_HEADERS.studentsKyoto)),
                studentsTokyo: parseNumber(findValue(rowObj, EXCEL_HEADERS.studentsTokyo)),
                room: String(findValue(rowObj, EXCEL_HEADERS.room) || '待定'),
             });
          });

          return items;
        };

        const sheetNames = workbook.SheetNames;
        const exams = sheetNames.length > 0 ? parseSheet(sheetNames[0]) : [];
        const makeups = sheetNames.length > 1 ? parseSheet(sheetNames[1]) : [];

        resolve({ exams, makeups });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const exportExcelFile = (exams: ScheduleItem[], makeups: ScheduleItem[]) => {
  const workbook = XLSX.utils.book_new();

  const toRow = (item: ScheduleItem) => ({
    "日期": item.date,
    "科目名": item.courseName,
    "时限": item.period,
    "人数：京都": item.studentsKyoto,
    "人数：东京": item.studentsTokyo,
    "教室": item.room
  });

  const examRows = exams.map(toRow);
  const makeupRows = makeups.map(toRow);

  const examSheet = XLSX.utils.json_to_sheet(examRows);
  const makeupSheet = XLSX.utils.json_to_sheet(makeupRows);

  XLSX.utils.book_append_sheet(workbook, examSheet, "期末考试");
  XLSX.utils.book_append_sheet(workbook, makeupSheet, "补讲");

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `学期日程表_${timestamp}.xlsx`);
};