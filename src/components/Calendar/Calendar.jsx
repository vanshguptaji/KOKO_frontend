import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone,
  PawPrint,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Mail,
  FileText,
  Tag,
  Hash,
  Timer
} from 'lucide-react';
import { useAppointment, APPOINTMENT_STATUS } from '../../hooks/useAppointment';
import { 
  formatDate, 
  formatDateForAPI, 
  getMonthDays, 
  getNextMonth, 
  getPreviousMonth, 
  areSameDay,
  checkIsToday,
  isPastDate,
  getMonthName
} from '../../utils/dateUtils';
import './Calendar.css';

// Helper function to extract time from preferredDateTime or scheduledTimeSlot
const getDisplayTime = (appointment) => {
  // First try to get time from preferredDateTime (e.g., "february 7,2026 at 5:00 PM")
  if (appointment.preferredDateTime) {
    const atMatch = appointment.preferredDateTime.match(/at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (atMatch) {
      return atMatch[1].trim();
    }
  }
  
  // Fallback to scheduledTimeSlot and format it
  if (appointment.scheduledTimeSlot) {
    const timeSlot = appointment.scheduledTimeSlot;
    // If already has AM/PM, return as is
    if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
      return timeSlot;
    }
    // Convert 24-hour format to 12-hour
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  
  return 'TBD';
};

// Helper function to format the scheduled date properly
const getDisplayDate = (appointment) => {
  if (appointment.scheduledDate) {
    const date = new Date(appointment.scheduledDate);
    return formatDate(date, 'EEEE, MMMM d, yyyy');
  }
  return 'Not scheduled';
};

// Helper to get service display name
const getServiceName = (serviceId) => {
  const services = {
    'checkup': 'General Checkup',
    'vaccination': 'Vaccination',
    'grooming': 'Grooming',
    'dental': 'Dental Care',
    'surgery': 'Surgery',
    'emergency': 'Emergency',
    'consultation': 'Consultation',
    'other': 'Other'
  };
  return services[serviceId] || serviceId;
};

// Helper to get pet type display name
const getPetTypeName = (petType) => {
  if (!petType || petType === 'other') return 'Pet';
  return petType.charAt(0).toUpperCase() + petType.slice(1);
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentsByDate, setAppointmentsByDate] = useState({});

  const {
    isLoading,
    fetchAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    fetchStats,
  } = useAppointment();

  const [stats, setStats] = useState(null);

  // Fetch appointments for the current month
  const loadAppointments = useCallback(async () => {
    const startDate = formatDateForAPI(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const endDate = formatDateForAPI(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
    
    const result = await fetchAppointments({ startDate, endDate, limit: 100 });
    
    // Group appointments by date
    if (result?.appointments) {
      const grouped = {};
      result.appointments.forEach(apt => {
        // Parse the scheduledDate and format it as YYYY-MM-DD for grouping
        const date = new Date(apt.scheduledDate);
        const dateKey = formatDateForAPI(date);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(apt);
      });
      setAppointmentsByDate(grouped);
    }
  }, [currentMonth, fetchAppointments]);

  // Fetch stats
  const loadStats = useCallback(async () => {
    const result = await fetchStats();
    if (result) {
      setStats(result);
    }
  }, [fetchStats]);

  useEffect(() => {
    loadAppointments();
    loadStats();
  }, [loadAppointments, loadStats]);

  // Get appointments for selected date
  const selectedDateAppointments = appointmentsByDate[formatDateForAPI(selectedDate)] || [];

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentMonth(getPreviousMonth(currentMonth));
  const goToNextMonth = () => setCurrentMonth(getNextMonth(currentMonth));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
  };

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    const result = await updateAppointmentStatus(appointmentId, newStatus);
    if (result?.success) {
      loadAppointments();
    }
  };

  // Handle appointment cancellation
  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const result = await cancelAppointment(appointmentId);
      if (result?.success) {
        loadAppointments();
        setSelectedAppointment(null);
      }
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return 'status-confirmed';
      case APPOINTMENT_STATUS.PENDING:
        return 'status-pending';
      case APPOINTMENT_STATUS.CANCELLED:
        return 'status-cancelled';
      case APPOINTMENT_STATUS.COMPLETED:
        return 'status-completed';
      case APPOINTMENT_STATUS.NO_SHOW:
        return 'status-no-show';
      default:
        return 'status-pending';
    }
  };

  // Get days for calendar grid
  const calendarDays = getMonthDays(currentMonth);

  return (
    <div className="calendar-dashboard">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <h1 className="calendar-title">
            <CalendarIcon size={28} />
            Appointments Dashboard
          </h1>
          <p className="calendar-subtitle">Manage your veterinary appointments</p>
        </div>
        <div className="calendar-header-right">
          <button className="btn btn-secondary" onClick={loadAppointments} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon"><CalendarIcon size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.total || 0}</span>
              <span className="stat-label">Total Appointments</span>
            </div>
          </div>
          <div className="stat-card stat-today">
            <div className="stat-icon"><Clock size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.today || 0}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon"><AlertCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.pending || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card stat-confirmed">
            <div className="stat-icon"><Check size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.confirmed || 0}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-content">
        {/* Calendar Section */}
        <div className="calendar-section">
          {/* Month Navigation */}
          <div className="calendar-nav">
            <button className="nav-btn" onClick={goToPreviousMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="month-title">
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </h2>
            <button className="nav-btn" onClick={goToNextMonth}>
              <ChevronRight size={20} />
            </button>
            <button className="btn btn-small btn-today" onClick={goToToday}>
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              const dateKey = formatDateForAPI(date);
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = areSameDay(date, selectedDate);
              const isToday = checkIsToday(date);
              const isPast = isPastDate(date) && !isToday;

              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {dayAppointments.length > 0 && (
                    <div className="day-appointments">
                      {dayAppointments.slice(0, 3).map((apt, i) => (
                        <div 
                          key={apt._id || i} 
                          className={`day-appointment-dot ${getStatusColor(apt.status)}`}
                          title={`${apt.petName} - ${getDisplayTime(apt)}`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="more-appointments">+{dayAppointments.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="appointments-section">
          <div className="appointments-header">
            <h3>
              {checkIsToday(selectedDate) ? "Today's Appointments" : formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <span className="appointments-count">{selectedDateAppointments.length} appointments</span>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="spinning" size={24} />
              <span>Loading appointments...</span>
            </div>
          ) : selectedDateAppointments.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <p>No appointments for this date</p>
            </div>
          ) : (
            <div className="appointments-list">
              {selectedDateAppointments
                .sort((a, b) => {
                  // Sort by time extracted from preferredDateTime or scheduledTimeSlot
                  const timeA = getDisplayTime(a);
                  const timeB = getDisplayTime(b);
                  return timeA.localeCompare(timeB);
                })
                .map((appointment) => (
                  <div 
                    key={appointment._id} 
                    className={`appointment-card ${selectedAppointment?._id === appointment._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{getDisplayTime(appointment)}</span>
                    </div>
                    <div className="appointment-info">
                      <div className="appointment-pet">
                        <PawPrint size={16} />
                        <span>{appointment.petName}</span>
                        <span className="pet-type">({getPetTypeName(appointment.petType)})</span>
                      </div>
                      <div className="appointment-owner">
                        <User size={14} />
                        <span>{appointment.ownerName}</span>
                      </div>
                      <div className="appointment-service">
                        <Tag size={12} />
                        {getServiceName(appointment.service)}
                      </div>
                    </div>
                    <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="appointment-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button className="modal-close" onClick={() => setSelectedAppointment(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              {/* Appointment ID */}
              <div className="detail-row">
                <Hash size={18} />
                <div>
                  <label>Appointment ID</label>
                  <span className="appointment-id">{selectedAppointment._id}</span>
                </div>
              </div>

              {/* Pet Information */}
              <div className="detail-row">
                <PawPrint size={18} />
                <div>
                  <label>Pet Name</label>
                  <span>{selectedAppointment.petName}</span>
                </div>
              </div>

              <div className="detail-row">
                <Tag size={18} />
                <div>
                  <label>Pet Type</label>
                  <span>{getPetTypeName(selectedAppointment.petType)}</span>
                </div>
              </div>

              {/* Owner Information */}
              <div className="detail-row">
                <User size={18} />
                <div>
                  <label>Owner Name</label>
                  <span>{selectedAppointment.ownerName}</span>
                </div>
              </div>

              <div className="detail-row">
                <Phone size={18} />
                <div>
                  <label>Phone Number</label>
                  <span>{selectedAppointment.phone}</span>
                </div>
              </div>

              {selectedAppointment.email && (
                <div className="detail-row">
                  <Mail size={18} />
                  <div>
                    <label>Email</label>
                    <span>{selectedAppointment.email}</span>
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div className="detail-row">
                <CalendarIcon size={18} />
                <div>
                  <label>Scheduled Date</label>
                  <span>{getDisplayDate(selectedAppointment)}</span>
                </div>
              </div>

              <div className="detail-row">
                <Clock size={18} />
                <div>
                  <label>Scheduled Time</label>
                  <span>{getDisplayTime(selectedAppointment)}</span>
                </div>
              </div>

              {selectedAppointment.preferredDateTime && (
                <div className="detail-row">
                  <FileText size={18} />
                  <div>
                    <label>Preferred Date/Time (as entered)</label>
                    <span>{selectedAppointment.preferredDateTime}</span>
                  </div>
                </div>
              )}

              <div className="detail-row">
                <Tag size={18} />
                <div>
                  <label>Service Type</label>
                  <span>{getServiceName(selectedAppointment.service)}</span>
                </div>
              </div>

              <div className="detail-row">
                <Timer size={18} />
                <div>
                  <label>Duration</label>
                  <span>{selectedAppointment.duration} minutes</span>
                </div>
              </div>

              {/* Reason & Notes */}
              {selectedAppointment.reason && (
                <div className="detail-row full-width">
                  <FileText size={18} />
                  <div>
                    <label>Reason for Visit</label>
                    <p>{selectedAppointment.reason}</p>
                  </div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="detail-row full-width">
                  <FileText size={18} />
                  <div>
                    <label>Additional Notes</label>
                    <p>{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="detail-row">
                <AlertCircle size={18} />
                <div>
                  <label>Status</label>
                  <span className={`status-badge ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              {/* Session Info */}
              {selectedAppointment.sessionId && (
                <div className="detail-row">
                  <Hash size={18} />
                  <div>
                    <label>Session ID</label>
                    <span className="session-id">{selectedAppointment.sessionId}</span>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="detail-row">
                <Clock size={18} />
                <div>
                  <label>Created At</label>
                  <span>{new Date(selectedAppointment.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedAppointment.updatedAt && selectedAppointment.updatedAt !== selectedAppointment.createdAt && (
                <div className="detail-row">
                  <Clock size={18} />
                  <div>
                    <label>Last Updated</label>
                    <span>{new Date(selectedAppointment.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Source */}
              {selectedAppointment.context?.source && (
                <div className="detail-row">
                  <Tag size={18} />
                  <div>
                    <label>Source</label>
                    <span>{selectedAppointment.context.source}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              {selectedAppointment.status === APPOINTMENT_STATUS.PENDING && (
                <button 
                  className="btn btn-confirm"
                  onClick={() => handleStatusUpdate(selectedAppointment._id, APPOINTMENT_STATUS.CONFIRMED)}
                >
                  <Check size={16} />
                  Confirm
                </button>
              )}
              {selectedAppointment.status === APPOINTMENT_STATUS.CONFIRMED && (
                <button 
                  className="btn btn-complete"
                  onClick={() => handleStatusUpdate(selectedAppointment._id, APPOINTMENT_STATUS.COMPLETED)}
                >
                  <Check size={16} />
                  Mark Complete
                </button>
              )}
              {selectedAppointment.status !== APPOINTMENT_STATUS.CANCELLED && 
               selectedAppointment.status !== APPOINTMENT_STATUS.COMPLETED && (
                <button 
                  className="btn btn-cancel"
                  onClick={() => handleCancel(selectedAppointment._id)}
                >
                  <X size={16} />
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
