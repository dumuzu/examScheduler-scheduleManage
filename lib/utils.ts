import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Robust Date Normalizer
// Unifies Date objects, Excel serials, and various string formats (YYYY/M/D, YYYY-MM-DD)
// into a strict "YYYY-MM-DD" string.
export function normalizeDate(dateStr: string | number | Date | any): string {
  if (!dateStr) return '';

  try {
    // 1. Handle Date Object (Common when cellDates: true is used in XLSX)
    if (dateStr instanceof Date) {
        // format uses local timezone.
        return format(dateStr, 'yyyy-MM-dd');
    }

    // 2. Handle Excel Serial Number (Fallback)
    if (typeof dateStr === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        // CAUTION: This creates a UTC-derived date.
        // format() will output in Local Time.
        const date = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
        return format(date, 'yyyy-MM-dd');
    }

    // 3. Handle Strings
    const cleanStr = String(dateStr).trim();
    if (!cleanStr) return '';

    // Remove Time part (ISO format like 2025-01-28T00:00:00)
    const isoDate = cleanStr.split('T')[0];

    // Unify separators: Replace '/' and '.' with '-'
    const unifiedStr = isoDate.replace(/[\/\.]/g, '-');

    // Split and Pad Zeros
    const parts = unifiedStr.split('-');
    
    if (parts.length === 3) {
        const p0 = parts[0];
        const p1 = parts[1];
        const p2 = parts[2];
        
        let y, m, d;
        
        // Detect Year position (simple heuristic)
        if (p0.length === 4) {
            // YYYY-MM-DD
            y = p0; m = p1; d = p2;
        } else if (p2.length === 4) {
             // MM-DD-YYYY or DD-MM-YYYY (Ambiguous, but assume US-like if encountered)
             // But for Japanese/Chinese context, YYYY-MM-DD is standard.
             // We stick to the user's logic order but handle year at end just in case.
            y = p2; m = p0; d = p1;
        } else {
             // Fallback to standard order
             y = p0; m = p1; d = p2;
        }

        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    
    return cleanStr;
  } catch (e) {
    console.error("Date normalization error:", e);
    return String(dateStr);
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Normalize first to ensure we are dealing with a valid date string
  const normalized = normalizeDate(dateString);
  const date = new Date(normalized);
  
  // Invalid date check
  if (isNaN(date.getTime())) return dateString;

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  // If year is different from current year, show full date.
  if (dateYear !== currentYear) {
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      return formatter.format(date);
  }
  
  // Default short format: "12/15"
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
  
  return formatter.format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}