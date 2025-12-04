import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, parseISO } from 'date-fns';
import { formatTime12Hour } from '../utils/time';

// --- Event Component ---
const EventCard = ({ event, top, height, onClick }) => {
    const style = {
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: event.type === 'habit' ? '#1E1E1E' : '#27272a',
        borderColor: event.color || (event.type === 'habit' ? '#8b5cf6' : '#ffffff20'),
        borderLeftColor: event.color || (event.type === 'habit' ? '#8b5cf6' : '#14b8a6'),
        position: 'absolute',
        left: '4px',
        right: '4px',
        zIndex: 20,
    };

    return (
        <div
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onClick(event);
            }}
            className={`rounded-md border shadow-sm cursor-pointer hover:brightness-110 transition-all group/event overflow-hidden flex flex-col justify-start ${event.type === 'habit' ? 'border-l-4' : 'border-l-2'}`}
        >
            <div className="p-1.5 h-full flex flex-col justify-start pointer-events-none">
                <h4 className="text-[10px] font-bold text-white/90 leading-tight whitespace-normal break-words">{event.subject}</h4>
                {height > 40 && (
                    <p className="text-[9px] text-white/50 mt-0.5">
                        {formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}
                    </p>
                )}
            </div>
        </div>
    );
};

// --- Day Column ---
const DayColumn = ({ day, dateStr, isToday, timeSlots, startHour, dayEvents, onEventClick }) => {
    return (
        <div className="flex flex-col border-r border-white/5 min-h-full relative group">
            {/* Day Header */}
            <div className={`sticky top-0 z-20 h-[60px] p-2 text-center border-b border-white/5 backdrop-blur-md transition-colors ${isToday ? 'bg-accent/5' : 'bg-[#09090b]/95'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isToday ? 'text-accent' : 'text-white/30'}`}>
                    {format(day, 'EEE')}
                </span>
                <span className={`text-lg font-black block ${isToday ? 'text-white' : 'text-white/60'}`}>
                    {format(day, 'd')}
                </span>
            </div>

            {/* Time Slots */}
            <div className="relative flex-1">
                {/* Background Grid Lines */}
                {timeSlots.map(hour => (
                    <div
                        key={hour}
                        className="h-[60px] border-b border-white/[0.03] w-full absolute z-10"
                        style={{ top: (hour - startHour) * 60 }}
                    />
                ))}

                {/* Events */}
                {dayEvents.map((event, i) => {
                    const start = parseInt(event.startTime.split(':')[0]);
                    const minutes = parseInt(event.startTime.split(':')[1]);
                    const top = (start - startHour) * 60 + minutes;

                    const endH = parseInt(event.endTime.split(':')[0]);
                    const endM = parseInt(event.endTime.split(':')[1]);
                    const durationMinutes = (endH * 60 + endM) - (start * 60 + minutes);
                    const height = Math.max(durationMinutes, 30);

                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            top={top}
                            height={height}
                            onClick={onEventClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const WeeklyView = ({ events, habits, currentDate, onDateChange, onEventClick, onUpdateTask }) => {
    // --- State ---
    const [localEvents, setLocalEvents] = useState(events);

    // Sync local state with props
    useEffect(() => {
        setLocalEvents(events);
    }, [events]);

    // --- Constants ---
    const startHour = 6; // 6 AM
    const endHour = 24; // 12 AM (Midnight)
    const timeSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i));

    // --- Helpers ---
    const getEventsForDay = (day) => {
        const dayName = format(day, 'EEEE');

        // 1. Regular Events
        const dailyEvents = localEvents.filter(event => {
            if (event.repeat === 'Weekly' && event.repeatDay === dayName) return true;
            if (event.repeat === 'Daily') return true;
            if (event.repeat === 'Weekdays' && !['Saturday', 'Sunday'].includes(dayName)) return true;
            if (event.repeat === 'Weekends' && ['Saturday', 'Sunday'].includes(dayName)) return true;
            if (!event.repeat && event.date && isSameDay(parseISO(event.date), day)) return true;
            return false;
        });

        // 2. Habits (mapped to event structure)
        const dailyHabits = (habits || []).filter(habit => {
            if (habit.frequency && habit.frequency.includes(dayName)) return true;
            if (!habit.frequency || habit.frequency.length === 0) return true;
            return false;
        }).map(habit => ({
            ...habit,
            id: `habit-${habit.id}`,
            subject: habit.name,
            startTime: habit.time || '09:00',
            endTime: habit.time ? format(setHours(setMinutes(new Date(), parseInt(habit.time.split(':')[1]) + 30), parseInt(habit.time.split(':')[0])), 'HH:mm') : '09:30',
            color: habit.color || '#ab47bc',
            type: 'habit'
        }));

        return [...dailyEvents, ...dailyHabits].sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white overflow-hidden font-sans">
            {/* --- Main Canvas --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#09090b]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#09090b] z-20 shadow-sm sticky top-0">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-white/90">
                            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
                        </h2>
                        <p className="text-xs text-white/40 font-medium">Weekly Overview</p>
                    </div>
                </div>

                <div className="flex min-w-[800px]">
                    {/* Time Labels */}
                    <div className="w-14 flex-shrink-0 border-r border-white/5 bg-[#09090b] sticky left-0 z-30 flex flex-col">
                        <div className="h-[60px] border-b border-white/5 bg-[#09090b] sticky top-0 z-40" />
                        <div className="relative">
                            {timeSlots.map(hour => (
                                <div key={hour} className="h-[60px] text-[10px] text-white/20 text-right pr-3 font-medium">
                                    {format(setHours(new Date(), hour), 'h a')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 7-Day Grid */}
                    <div className="flex-1 grid grid-cols-7 h-full">
                        {weekDays.map((day, dayIndex) => {
                            const isToday = isSameDay(day, new Date());
                            const dayEvents = getEventsForDay(day);
                            const dateStr = format(day, 'yyyy-MM-dd');

                            return (
                                <DayColumn
                                    key={dayIndex}
                                    day={day}
                                    dateStr={dateStr}
                                    isToday={isToday}
                                    timeSlots={timeSlots}
                                    startHour={startHour}
                                    dayEvents={dayEvents}
                                    onEventClick={onEventClick}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyView;
