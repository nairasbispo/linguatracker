import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getMonthCalendarGrid,
  getLocalDateString,
  formatDisplayDate,
  parseLocalDate,
} from '../lib/dateUtils';
import type { PracticeSession } from '../types';

export const ConsistencyCalendar: React.FC = () => {
  const { sessions, languages, setModal, setSelectedLanguageForModal } = useApp();

  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getLocalDateString(today));
  const [startOnMonday, setStartOnMonday] = useState<boolean>(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(getLocalDateString(now));
  };

  // Map of dateStr -> sessions
  const sessionsByDate = useMemo(() => {
    const map: Record<string, { sessions: PracticeSession[]; totalMinutes: number; languages: Set<string> }> = {};
    sessions.forEach((s) => {
      if (!s.date) return;
      if (!map[s.date]) {
        map[s.date] = { sessions: [], totalMinutes: 0, languages: new Set() };
      }
      map[s.date].sessions.push(s);
      map[s.date].totalMinutes += s.totalMinutes || 0;
      if (s.languageId) {
        map[s.date].languages.add(s.languageId);
      }
    });
    return map;
  }, [sessions]);

  // Calendar grid matrix
  const calendarWeeks = useMemo(() => {
    return getMonthCalendarGrid(currentYear, currentMonth, startOnMonday);
  }, [currentYear, currentMonth, startOnMonday]);

  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  const weekdayLabels = startOnMonday
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Details of selected day
  const selectedDayData = sessionsByDate[selectedDateStr];
  const selectedDaySessions = selectedDayData?.sessions || [];
  const selectedDayTotalMinutes = selectedDayData?.totalMinutes || 0;

  // Monthly stats
  const monthTotalMinutes = useMemo(() => {
    let total = 0;
    sessions.forEach((s) => {
      if (!s.date) return;
      const d = parseLocalDate(s.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        total += s.totalMinutes || 0;
      }
    });
    return total;
  }, [sessions, currentYear, currentMonth]);

  const monthActiveDays = useMemo(() => {
    const activeDays = new Set<string>();
    sessions.forEach((s) => {
      if (!s.date) return;
      const d = parseLocalDate(s.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && (s.totalMinutes || 0) > 0) {
        activeDays.add(s.date);
      }
    });
    return activeDays.size;
  }, [sessions, currentYear, currentMonth]);

  const handleOpenLogForDay = (dateStr: string) => {
    setSelectedLanguageForModal(languages[0]?.id || 'en');
    setModal('logSession');
  };

  return (
    <div id="consistency-calendar-container" className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E4D9] shadow-2xs space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#1E5E44]" />
              <span>PRACTICE CALENDAR</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 capitalize tracking-tight">
              {monthName}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {monthActiveDays} active {monthActiveDays === 1 ? 'day' : 'days'} • {monthTotalMinutes} min
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStartOnMonday((prev) => !prev)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-[#FAF8F3] hover:bg-[#F3EFE6] rounded-xl border border-[#E5E0D5] transition-colors"
            title="Toggle first day of week"
          >
            {startOnMonday ? 'Mon-first' : 'Sun-first'}
          </button>
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#1E5E44] hover:text-white hover:bg-[#1E5E44] bg-[#FAF8F3] rounded-xl border border-[#E5E0D5] transition-all"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Column Headers (7-Column Format) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {weekdayLabels.map((day, idx) => (
          <div
            key={day}
            className={`py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid (Strict 7 Days Per Row) */}
      <div className="space-y-1 sm:space-y-2">
        {calendarWeeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week.map((cell) => {
              const dayData = sessionsByDate[cell.dateStr];
              const minutes = dayData?.totalMinutes || 0;
              const isSelected = cell.dateStr === selectedDateStr;

              // Shading based on deliberate practice volume
              let cellBg = 'bg-[#FAF8F3] text-slate-700 hover:bg-[#F3EEE3]';
              let ringClass = '';

              if (minutes > 60) {
                cellBg = 'bg-[#1E5E44] text-white font-bold hover:bg-[#184E38] shadow-xs';
              } else if (minutes >= 30) {
                cellBg = 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-xs';
              } else if (minutes > 0) {
                cellBg = 'bg-emerald-100 text-emerald-950 font-semibold hover:bg-emerald-200';
              }

              if (cell.isToday) {
                ringClass = 'ring-2 ring-purple-500 ring-offset-1';
              } else if (isSelected) {
                ringClass = 'ring-2 ring-slate-800 ring-offset-1';
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`relative min-h-[50px] sm:min-h-[68px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-start transition-all cursor-pointer border ${
                    cell.isCurrentMonth
                      ? 'border-[#EAE5DA]'
                      : 'opacity-40 border-slate-100 bg-slate-50/50'
                  } ${cellBg} ${ringClass}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm ${
                        cell.isToday
                          ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs'
                          : 'font-medium'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {minutes > 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded-md ${
                          minutes >= 30 ? 'bg-white/25 text-white' : 'bg-emerald-200/80 text-emerald-900'
                        }`}
                      >
                        {minutes}m
                      </span>
                    )}
                  </div>

                  {/* Language indicators (colored dots for distinct languages practiced) */}
                  {dayData && dayData.languages.size > 0 && (
                    <div className="flex items-center gap-1 mt-auto pt-1 w-full overflow-hidden">
                      {Array.from(dayData.languages).map((langId) => {
                        const lang = languages.find((l) => l.id === langId);
                        const dotColor = langId === 'fr' ? '#A855F7' : langId === 'en' ? '#3B82F6' : '#10B981';
                        return (
                          <span
                            key={langId}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: dotColor }}
                            title={lang?.name || langId}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0ECE1] text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#FAF8F3] border border-[#EAE5DA]"></span>
            <span>0m</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-100"></span>
            <span>1-29m</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
            <span>30-59m</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#1E5E44]"></span>
            <span>60m+</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-purple-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Today</span>
          </span>
        </div>
      </div>

      {/* Day Details Card for Selected Date */}
      <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SELECTED DAY DETAILS
            </div>
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>{formatDisplayDate(selectedDateStr)}</span>
              {selectedDateStr === getLocalDateString(today) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  Today
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenLogForDay(selectedDateStr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log practice for this day</span>
            </button>
          </div>
        </div>

        {selectedDaySessions.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
            <Clock className="w-5 h-5 text-slate-300 mb-1" />
            <span>No practice sessions logged on this date.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-700">
              Total practice: <span className="font-bold text-[#1E5E44]">{selectedDayTotalMinutes} minutes</span> across {selectedDaySessions.length} {selectedDaySessions.length === 1 ? 'session' : 'sessions'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {selectedDaySessions.map((session) => {
                const lang = languages.find((l) => l.id === session.languageId);
                return (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-white border border-[#E8E3D7] shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {lang?.name || session.languageId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {session.totalMinutes} min
                      </span>
                    </div>

                    {/* Breakdown pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                      {session.listening > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/50 flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          <span>{session.listening}m</span>
                        </span>
                      )}
                      {session.speaking > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50 flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          <span>{session.speaking}m</span>
                        </span>
                      )}
                      {session.reading > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/50 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{session.reading}m</span>
                        </span>
                      )}
                      {session.writing > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/50 flex items-center gap-1">
                          <PenTool className="w-3 h-3" />
                          <span>{session.writing}m</span>
                        </span>
                      )}
                      {(session.grammar || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/50 flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          <span>{session.grammar}m</span>
                        </span>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-[#FAF8F3] p-1.5 rounded-md border border-[#EDE8DC] mt-1">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
