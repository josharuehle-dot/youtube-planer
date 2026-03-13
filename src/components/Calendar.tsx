import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Video } from '../types';
import { STATUS_COLORS } from '../types';
import './Calendar.css';

interface CalendarProps {
  videos: Video[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onVideoClick: (video: Video) => void;
  onDayClick: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  videos, 
  currentDate, 
  onDateChange,
  onVideoClick,
  onDayClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => onDateChange(subMonths(currentDate, 1));
  const nextMonth = () => onDateChange(addMonths(currentDate, 1));

  // Weekday headers
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-container glass-panel">
      <div className="calendar-header">
        <h3 className="calendar-title">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="calendar-nav">
          <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <button className="btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          
          // Find videos scheduled for this day
          const dayVideos = videos.filter(v => v.uploadDate && isSameDay(new Date(v.uploadDate), day));

          return (
            <div 
              key={idx} 
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onDayClick(day)}
            >
              <div className="day-number">{format(day, 'd')}</div>
              <div className="day-events">
                {dayVideos.map(video => (
                  <div 
                    key={video.id} 
                    className="event-badge"
                    style={{ 
                      backgroundColor: `${STATUS_COLORS[video.status]}20`, 
                      color: STATUS_COLORS[video.status],
                      borderLeftColor: STATUS_COLORS[video.status]
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoClick(video);
                    }}
                  >
                    {video.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
