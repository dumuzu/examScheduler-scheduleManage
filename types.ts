export type ScheduleType = 'exam' | 'makeup';

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  courseName: string;
  period: string; // "1" or "1,2"
  studentsKyoto: number;
  studentsTokyo: number;
  room: string;
}

export type ScheduleState = {
  exams: ScheduleItem[];
  makeups: ScheduleItem[];
  isLoading: boolean;
};

// Excel Mapping Helpers - Updated for better matching
export const EXCEL_HEADERS = {
  date: ["日期", "Date", "date", "年月日", "考试日期"],
  courseName: ["科目名", "Course", "Subject", "科目", "名称", "课程名称"],
  period: ["时限", "Period", "Time", "时数", "节次", "限", "时间"],
  studentsKyoto: ["人数：京都", "人数:京都", "人数(京都)", "京都人数", "Kyoto", "京都", "在籍:京都", "人数(京)"],
  studentsTokyo: ["人数：东京", "人数:东京", "人数(东京)", "东京人数", "Tokyo", "东京", "在籍:东京", "人数(东)"],
  room: ["教室", "Room", "Location", "地点", "考场", "使用教室"],
};