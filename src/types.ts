export interface TimeEntry {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  type: 'work' | 'break';
  notes: string;
  userId?: string;
}

export interface AppSettings {
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  notifications: boolean;
  darkMode: boolean;
  userId?: string;
}

export interface DailyStats {
  date: string;
  totalWorkTime: number;
  totalBreakTime: number;
  sessions: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWorkTime: number;
  totalBreakTime: number;
  dailyStats: DailyStats[];
}