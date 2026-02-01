import { format, isValid, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isBefore, isAfter, addDays } from 'date-fns';

// Format a date for display
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

// Format date to YYYY-MM-DD (for API)
export const formatDateForAPI = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'yyyy-MM-dd');
};

// Format time for display
export const formatTime = (date, formatString = 'h:mm a') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

// Format datetime for display
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'MMM d, yyyy \'at\' h:mm a');
};

// Format relative time (e.g., "2 minutes ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateObj);
};

// Get all days in a month for calendar display
export const getMonthDays = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

// Check if two dates are the same day
export const areSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

// Get next month
export const getNextMonth = (date) => addMonths(date, 1);

// Get previous month
export const getPreviousMonth = (date) => subMonths(date, 1);

// Check if date is today
export const checkIsToday = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

// Check if date is in the past
export const isPastDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isBefore(dateObj, today);
};

// Check if date is in the future
export const isFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isAfter(dateObj, today) || isToday(dateObj);
};

// Get next N days
export const getNextDays = (days = 14) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => addDays(today, i));
};

// Format time slot for display (12-hour format)
export const formatTimeSlot = (timeSlot) => {
  if (!timeSlot) return '';
  
  // If already in 12-hour format, return as is
  if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
    return timeSlot;
  }
  
  // Convert from 24-hour to 12-hour format
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
};

// Get day name
export const getDayName = (date, short = false) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, short ? 'EEE' : 'EEEE');
};

// Get month name
export const getMonthName = (date, short = false) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, short ? 'MMM' : 'MMMM');
};
