/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  CalendarDays, 
  Search, 
  X, 
  BookOpen, 
  Palmtree, 
  Printer, 
  AlertCircle,
  FileText,
  Clock,
  User,
  Sparkles,
  Info
} from 'lucide-react';
import { CalendarEvent, CalendarEventType, UserRole } from '../types';

interface AcademicCalendarProps {
  currentRole: UserRole;
  events: CalendarEvent[];
  onCreateEvent: (evt: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  userName?: string;
}

export default function AcademicCalendar({
  currentRole,
  events,
  onCreateEvent,
  onDeleteEvent,
  userName = 'Staff Member'
}: AcademicCalendarProps) {
  // Current visible month/year state
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Current is June 2026 based on metadata
    return new Date(2026, 5, 1); // June 1st, 2026
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return '2026-06-12'; // Default select current date
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CalendarEventType>('all');

  // Form states for creating a new event
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<CalendarEventType>('event');
  const [newDate, setNewDate] = useState('2026-06-12');
  const [newClassId, setNewClassId] = useState('all');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const canManage = currentRole === 'admin' || currentRole === 'teacher';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToCurrent = () => {
    setCurrentDate(new Date(2026, 5, 1)); // Back to June 2026
    setSelectedDate('2026-06-12');
  };

  // Compute days in the grid
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    return new Date(year, month, 1).getDay(); // 0 indicates Sunday
  }, [year, month]);

  const daysOfPrevMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Construct actual day blocks for grid
  const calendarCells = useMemo(() => {
    const cells = [];
    
    // Previous Month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysOfPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, dayNum);
      const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      
      cells.push({
        day: dayNum,
        isCurrentMonth: false,
        dateString: dateStr,
        dateObj: prevMonthDate
      });
    }

    // Active Month cells
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const activeDate = new Date(year, month, i);
      
      cells.push({
        day: i,
        isCurrentMonth: true,
        dateString: dateStr,
        dateObj: activeDate
      });
    }

    // Next Month padding cells (fill up 42 cells grid if needed)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      cells.push({
        day: i,
        isCurrentMonth: false,
        dateString: dateStr,
        dateObj: nextMonthDate
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayIndex, daysOfPrevMonth]);

  // Map events of each date for rendering
  const dateEventsMap = useMemo(() => {
    const map: { [key: string]: CalendarEvent[] } = {};
    events.forEach(evt => {
      // Handle single or multi-day
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [events]);

  // Handle Event submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setFormLoading(true);
    try {
      await onCreateEvent({
        title: newTitle,
        description: newDesc,
        date: newDate,
        type: newType,
        createdBy: userName,
        classId: newClassId
      });
      
      setFormSuccess(true);
      setNewTitle('');
      setNewDesc('');
      
      // Update selected date focus to view the newly added event
      setSelectedDate(newDate);
      
      // Sync visible month to event date
      const eventDateObj = new Date(newDate);
      if (!isNaN(eventDateObj.getTime())) {
        setCurrentDate(new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), 1));
      }
      
      setTimeout(() => {
        setFormSuccess(false);
        setShowAddForm(false);
      }, 1500);

    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const selectedEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDate);
  }, [events, selectedDate]);

  // Chronological upcoming events list
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => {
        // Search query check
        const matchesSearch = 
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Type filter check
        const matchesType = typeFilter === 'all' || e.type === typeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, searchQuery, typeFilter]);

  // Styling helper based on event type
  const getTypeStyling = (type: CalendarEventType) => {
    switch (type) {
      case 'holiday':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-600',
          hover: 'hover:bg-rose-100',
          border: 'border-rose-400'
        };
      case 'exam':
        return {
          bg: 'bg-violet-50 border-violet-200 text-violet-700',
          badge: 'bg-violet-600 text-white',
          dot: 'bg-violet-600',
          hover: 'hover:bg-violet-100',
          border: 'border-violet-400'
        };
      case 'event':
      default:
        return {
          bg: 'bg-amber-50 border-amber-250 text-[#0B2545]',
          badge: 'bg-[#EEB902] text-[#0B2545]',
          dot: 'bg-amber-500',
          hover: 'hover:bg-amber-100/80',
          border: 'border-amber-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper banner section */}
      <div className="bg-white rounded-xl p-6 border border-slate-205 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0B2545] flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-[#EEB902]" />
            Academic Calendar Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying term-wise holidays, examination dates, and major student activities for Academic Session 2026-2027.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end no-print">
          <button
            type="button"
            onClick={handleGoToCurrent}
            className="p-2 py-1.5 border hover:bg-slate-50 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer bg-white text-slate-700"
          >
            Today Focus (June 2026)
          </button>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 py-1.5 bg-[#0B2545] text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#EEB902]" /> Print Agenda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Calendar layout grid (Col span 7/12) */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          
          {/* Calendar top controls */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-1.5">
              <span className="p-1 px-2 bg-[#0B2545]/10 text-[#0B2545] rounded-md font-sans text-xs font-black uppercase">
                {year} Academic Sheet
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              
              <h3 className="text-md sm:text-lg font-extrabold text-[#0B2545] min-w-[140px] text-center">
                {monthNames[month]} {year}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Grid Layout Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-slate-500 uppercase font-mono tracking-wider py-2 bg-slate-50/60 rounded-lg mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Actual grid slots */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const dateEvts = dateEventsMap[cell.dateString] || [];
              const isSelected = selectedDate === cell.dateString;
              const isToday = cell.dateString === '2026-06-12';

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateString)}
                  className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-white border-slate-200 text-[#0B2545]'
                      : 'bg-slate-50/55 border-slate-100/70 text-slate-400'
                  } ${
                    isSelected 
                      ? 'ring-2 ring-[#0B2545] border-transparent shadow' 
                      : 'hover:border-slate-300'
                  } ${
                    isToday ? 'bg-indigo-50/40 border-indigo-300' : ''
                  }`}
                >
                  {/* Top bar cell: date number & today indicator */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-black font-mono flex items-center justify-center p-0.5 w-6 h-6 rounded-full ${
                      isToday 
                        ? 'bg-[#EEB902] text-[#0B2545] shadow-xs' 
                        : isSelected 
                          ? 'bg-[#0B2545] text-white' 
                          : ''
                    }`}>
                      {cell.day}
                    </span>
                    
                    {isToday && (
                      <span className="text-[7.5px] uppercase font-black text-indigo-700 font-mono tracking-tighter sm:inline hidden">TODAY</span>
                    )}
                  </div>

                  {/* Indicators / Events pills */}
                  <div className="space-y-1 mt-1.5">
                    {dateEvts.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {dateEvts.slice(0, 2).map((evt) => {
                          const style = getTypeStyling(evt.type);
                          return (
                            <div
                              key={evt.id}
                              className={`text-[8.5px] sm:text-[9.5px] font-black truncate px-1 rounded border leading-relaxed ${style.bg} ${style.border}`}
                              title={evt.title}
                            >
                              {evt.title}
                            </div>
                          );
                        })}
                        {dateEvts.length > 2 && (
                          <div className="text-[7.5px] sm:text-[8px] font-black text-[#0B2545] font-mono text-center">
                            + {dateEvts.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color legend guide status */}
          <div className="border-t pt-4 mt-5 flex flex-wrap gap-4 text-[11px] font-bold text-slate-600 justify-center font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-rose-300 bg-rose-50 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              </span>
              <span>School Holidays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-violet-305 bg-violet-50 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
              </span>
              <span>Examination Dates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-amber-302 bg-amber-50 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </span>
              <span>Major School Events</span>
            </div>
          </div>

        </div>

        {/* Right column: Selected Date details & Schedule Agenda list (Col span 4/12) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* 1. Date details panel */}
          <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-xl text-white p-5 shadow-md border-b-4 border-[#EEB902]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#EEB902]" />
                <span className="text-[10px] tracking-wider uppercase font-mono font-bold">DATE AGENDA PROFILE</span>
              </div>
              <span className="bg-[#EEB902] text-[#0B2545] text-[9.5px] font-black px-2 py-0.5 rounded font-mono">
                {selectedDate}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="text-base font-extrabold text-[#EEB902]">
                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>

              {selectedEvents.length === 0 ? (
                <div className="py-6 text-center text-slate-300 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No academic items or plans logged on this date slot.</p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewDate(selectedDate);
                        setShowAddForm(true);
                      }}
                      className="mt-3 text-xs text-[#EEB902] font-black hover:underline cursor-pointer"
                    >
                      + Add calendar milestone
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {selectedEvents.map((evt) => {
                    const style = getTypeStyling(evt.type);
                    return (
                      <div key={evt.id} className="bg-white/10 rounded-lg p-3 border border-white/5 space-y-1.5 relative group">
                        
                        {/* Title & Type tag */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-extrabold text-white tracking-snug pr-6 leading-normal">
                            {evt.title}
                          </h4>
                          <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 font-mono font-extrabold ${style.badge}`}>
                            {evt.type}
                          </span>
                        </div>

                        {/* Description text */}
                        <p className="text-[11px] text-slate-300 antialiased leading-relaxed">
                          {evt.description}
                        </p>

                        {/* Author line / delete controls */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-white/5 pt-2 mt-1">
                          <span className="flex items-center gap-0.5">
                            <User className="w-3 h-3 text-[#EEB902]" /> By: {evt.createdBy}
                          </span>
                          
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(evt.id)}
                              className="text-red-400 hover:text-red-100 transition p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. Admin/Teacher creator panel widget */}
          {canManage && (
            <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 text-[#0B2545] font-black py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition value-all"
              >
                {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-[#EEB902]" />}
                {showAddForm ? 'Close Milestone Studio' : 'Publish Calendar Milestone'}
              </button>

              {showAddForm && (
                <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 border-t pt-4 animate-fade-in text-slate-700">
                  <h4 className="text-xs font-black text-[#0B2545] uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EEB902]" /> Add New Announcement
                  </h4>

                  {formSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-lg font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Milestone published to academic portal successfully!
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Milestone Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Short Label / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Autumn Term Board Exams Begin"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Milestone Details</label>
                    <textarea
                      placeholder="Enter circular details, instructions, or specific notes regarding schedules or syllabus guidelines."
                      rows={3}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Classification</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as CalendarEventType)}
                        className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                      >
                        <option value="event">Major Event</option>
                        <option value="exam">Examination Date</option>
                        <option value="holiday">School Holiday</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider">Target Class</label>
                      <select
                        value={newClassId}
                        onChange={(e) => setNewClassId(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                      >
                        <option value="all">Entire Campuses</option>
                        <option value="Class 10A">Class 10A</option>
                        <option value="Class 10B">Class 10B</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-[#0B2545] hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center shadow"
                  >
                    {formLoading ? 'Publishing...' : '💾 Publish Event Milestone'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. Filterable Agenda list of all forthcoming items */}
          <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col gap-2 border-b pb-3.5">
              <h4 className="text-xs font-black text-[#0B2545] uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#EEB902]" />
                Browse Calendar Index
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Chronological index of mapped events and dates.</p>
            </div>

            {/* Quick search & Filters */}
            <div className="space-y-2 text-slate-705">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-1.5 pl-8 text-xs bg-slate-50 border rounded-lg focus:ring-1 focus:ring-[#0B2545]"
                />
              </div>

              {/* Categorization tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-[9.5px] uppercase font-mono font-black border-b pb-2">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-2 py-1 rounded transition whitespace-nowrap ${
                    typeFilter === 'all' 
                      ? 'bg-[#0B2545] text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('event')}
                  className={`px-2 py-1 rounded transition whitespace-nowrap ${
                    typeFilter === 'event' 
                      ? 'bg-amber-100 border border-amber-300 text-amber-800' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Events
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('exam')}
                  className={`px-2 py-1 rounded transition whitespace-nowrap ${
                    typeFilter === 'exam' 
                      ? 'bg-violet-100 border border-violet-300 text-violet-800' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Exams
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('holiday')}
                  className={`px-2 py-1 rounded transition whitespace-nowrap ${
                    typeFilter === 'holiday' 
                      ? 'bg-rose-100 border border-rose-300 text-rose-800' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Holidays
                </button>
              </div>
            </div>

            {/* List container */}
            <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs text-justify">
                  No forthcoming educational items match your active filters.
                </div>
              ) : (
                upcomingEvents.map((e) => {
                  const style = getTypeStyling(e.type);
                  const isSelected = selectedDate === e.date;
                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedDate(e.date)}
                      className={`p-2.5 border rounded-lg transition cursor-pointer flex gap-3 text-left items-start ${
                        isSelected 
                          ? 'bg-slate-100 border-[#0B2545] scale-[1.01]' 
                          : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {/* Left side Date block */}
                      <div className="text-center shrink-0 w-11 p-1 bg-[#0B2545]/5 hover:bg-[#0B2545]/10 rounded border border-[#0B2545]/10">
                        <span className="block text-[8px] font-mono font-black uppercase text-[#0B2545]">
                          {new Date(e.date).toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className="block text-sm font-black font-mono text-[#0B2545] leading-none mt-0.5">
                          {new Date(e.date).getDate()}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">
                            {e.title}
                          </h5>
                          <span className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 rounded shrink-0 font-mono ${style.badge}`}>
                            {e.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-sans leading-relaxed">
                          {e.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
