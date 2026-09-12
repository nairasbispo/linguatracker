/**
 * Robust Local Date Utilities
 * Ensures all dates (logging, streak calculations, calendar rendering)
 * consistently use the user's local timezone instead of UTC offsets.
 */

// Format a Date object to YYYY-MM-DD in the local timezone
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD into a local Date at noon to avoid daylight saving shifts
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || !dateStr.includes('-')) {
    return new Date();
  }
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day, 12, 0, 0);
}

// Check if a YYYY-MM-DD string is today in local time
export function isTodayLocal(dateStr: string): boolean {
  return dateStr === getLocalDateString(new Date());
}

// Check if a YYYY-MM-DD string was yesterday in local time
export function isYesterdayLocal(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === getLocalDateString(yesterday);
}

// Format date for user display
export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Check if date is in the current Monday-Sunday week
export function isDateInCurrentWeekLocal(dateStr: string): boolean {
  const d = parseLocalDate(dateStr);
  const now = new Date();
  
  // Calculate Monday of current week
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return d >= monday && d <= sunday;
}

export interface CalendarDayCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
}

/**
 * Returns a complete 7-column calendar grid for a given month and year.
 * Starts on Sunday (0) or Monday (1). Default: Sunday first.
 */
export function getMonthCalendarGrid(year: number, month: number, startOnMonday: boolean = false): CalendarDayCell[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  let startDay = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
  if (startOnMonday) {
    startDay = (startDay === 0 ? 6 : startDay - 1);
  }

  const todayStr = getLocalDateString(new Date());
  const cells: CalendarDayCell[] = [];

  // Previous month trailing padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = getLocalDateString(prevMonthDate);
    cells.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: prevMonthDate.getDay(),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = getLocalDateString(currentDate);
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayOfWeek: currentDate.getDay(),
    });
  }

  // Next month leading padding to complete full 7-day weeks (up to 35 or 42 cells)
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dateStr = getLocalDateString(nextMonthDate);
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      dayOfWeek: nextMonthDate.getDay(),
    });
  }

  // Chunk into 7-day rows (weeks)
  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}
