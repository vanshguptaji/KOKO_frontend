import { useState, useCallback, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import { validateAppointment } from '../utils/validators';

// Appointment booking states (matching backend BOOKING_STATES)
export const BOOKING_STATES = {
  IDLE: 'idle',
  COLLECTING_OWNER_NAME: 'collecting_owner_name',
  COLLECTING_PET_NAME: 'collecting_pet_name',
  COLLECTING_PHONE: 'collecting_phone',
  COLLECTING_DATE_TIME: 'collecting_date_time',
  CONFIRMING: 'confirming',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Appointment status types
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show',
};

// Fields to collect for appointment
export const APPOINTMENT_FIELDS = [
  { key: 'ownerName', label: 'Pet Owner Name', prompt: "What's your name?" },
  { key: 'petName', label: 'Pet Name', prompt: "What's your pet's name?" },
  { key: 'phone', label: 'Phone Number', prompt: "What's your phone number?" },
  { key: 'scheduledDate', label: 'Preferred Date', prompt: 'What date would you prefer? (e.g., January 30, 2026 or tomorrow)' },
  { key: 'scheduledTimeSlot', label: 'Preferred Time', prompt: 'What time works best for you? (e.g., 2:00 PM or afternoon)' },
];

const initialAppointmentData = {
  ownerName: '',
  petName: '',
  petType: 'other',
  phone: '',
  email: '',
  service: 'checkup',
  scheduledDate: '',
  scheduledTimeSlot: '',
  reason: '',
  notes: '',
};

export const useAppointment = () => {
  const [bookingState, setBookingState] = useState(BOOKING_STATES.IDLE);
  const [appointmentData, setAppointmentData] = useState(initialAppointmentData);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await appointmentAPI.getServices();
        if (response.success) {
          setServices(response.data.services || []);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, []);

  // Fetch available dates
  const fetchAvailableDates = useCallback(async (days = 14) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getAvailableDates(days);
      if (response.success) {
        setAvailableDates(response.data || []);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch available dates:', err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  // Fetch available slots for a date
  const fetchAvailableSlots = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getAvailableSlots(date);
      if (response.success) {
        setAvailableSlots(response.data.slots || []);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
    } finally {
      setIsLoading(false);
    }
    return { slots: [] };
  }, []);

  // Fetch all appointments (for calendar view)
  const fetchAppointments = useCallback(async (options = {}) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getAll(options);
      if (response.success) {
        setAppointments(response.data.appointments || []);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setIsLoading(false);
    }
    return { appointments: [] };
  }, []);

  // Fetch appointments by date (for calendar day view)
  const fetchAppointmentsByDate = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getByDate(date);
      if (response.success) {
        return response.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch appointments by date:', err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  // Fetch today's appointments
  const fetchTodaysAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getToday();
      if (response.success) {
        return response.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch today\'s appointments:', err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  // Fetch upcoming appointments
  const fetchUpcomingAppointments = useCallback(async (limit = 10) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getUpcoming(limit);
      if (response.success) {
        return response.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch upcoming appointments:', err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  // Start the booking flow
  const startBooking = useCallback((initialData = {}) => {
    setAppointmentData({ ...initialAppointmentData, ...initialData });
    setCurrentFieldIndex(0);
    setBookingState(BOOKING_STATES.COLLECTING_OWNER_NAME);
    setErrors({});
    
    return APPOINTMENT_FIELDS[0].prompt;
  }, []);

  // Get current field being collected
  const getCurrentField = useCallback(() => {
    if (currentFieldIndex >= APPOINTMENT_FIELDS.length) return null;
    return APPOINTMENT_FIELDS[currentFieldIndex];
  }, [currentFieldIndex]);

  // Update a field and move to next
  const updateField = useCallback((value) => {
    const currentField = APPOINTMENT_FIELDS[currentFieldIndex];
    
    if (!currentField) return null;

    // Update the field
    const updatedData = {
      ...appointmentData,
      [currentField.key]: value,
    };
    setAppointmentData(updatedData);

    // Check if we have more fields
    const nextIndex = currentFieldIndex + 1;
    
    if (nextIndex < APPOINTMENT_FIELDS.length) {
      setCurrentFieldIndex(nextIndex);
      return {
        nextPrompt: APPOINTMENT_FIELDS[nextIndex].prompt,
        isComplete: false,
      };
    } else {
      // All fields collected, move to confirmation
      setBookingState(BOOKING_STATES.CONFIRMING);
      return {
        appointmentData: updatedData,
        isComplete: true,
      };
    }
  }, [currentFieldIndex, appointmentData]);

  // Confirm and submit appointment
  const confirmAppointment = useCallback(async () => {
    // Validate all fields
    const validation = validateAppointment(appointmentData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setBookingState(BOOKING_STATES.ERROR);
      return { success: false, errors: validation.errors };
    }

    setBookingState(BOOKING_STATES.SUBMITTING);

    try {
      const response = await appointmentAPI.create(appointmentData);
      
      if (response.success) {
        setConfirmedAppointment(response.data || response.appointment);
        setBookingState(BOOKING_STATES.SUCCESS);
        return { success: true, appointment: response.data || response.appointment, message: response.message };
      } else {
        throw new Error(response.error || 'Failed to book appointment');
      }
    } catch (error) {
      setBookingState(BOOKING_STATES.ERROR);
      
      // Extract error message from API response
      let errorMessage = 'Failed to book appointment';
      let validationErrors = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for validation errors array from backend
        if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
          errorData.validationErrors.forEach(ve => {
            validationErrors[ve.field] = ve.message;
          });
          errorMessage = errorData.error || 'Validation failed';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Check for slot taken error
        if (errorData.slotTaken) {
          errorMessage = errorData.error || 'This time slot is no longer available. Please choose another time.';
          validationErrors.scheduledTimeSlot = errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage, ...validationErrors });
      
      return { 
        success: false, 
        error: errorMessage, 
        validationErrors,
        slotTaken: error.response?.data?.slotTaken || false
      };
    }
  }, [appointmentData]);

  // Cancel booking flow
  const cancelBooking = useCallback(() => {
    setBookingState(BOOKING_STATES.IDLE);
    setAppointmentData(initialAppointmentData);
    setCurrentFieldIndex(0);
    setErrors({});
    setConfirmedAppointment(null);
  }, []);

  // Reset booking to start over
  const resetBooking = useCallback(() => {
    cancelBooking();
  }, [cancelBooking]);

  // Update appointment status
  const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.updateStatus(appointmentId, status);
      if (response.success) {
        return { success: true, appointment: response.data };
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel an appointment
  const cancelAppointment = useCallback(async (appointmentId, reason = '') => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.cancel(appointmentId, reason);
      if (response.success) {
        return { success: true, appointment: response.data };
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete an appointment
  const deleteAppointment = useCallback(async (appointmentId) => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.delete(appointmentId);
      if (response.success) {
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get appointment statistics
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await appointmentAPI.getStats();
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Format appointment data for display
  const formatAppointmentSummary = useCallback(() => {
    const data = appointmentData;
    return `
📋 **Appointment Details:**
- **Owner Name:** ${data.ownerName}
- **Pet Name:** ${data.petName}
- **Phone:** ${data.phone}
- **Date:** ${data.scheduledDate}
- **Time:** ${data.scheduledTimeSlot}
${data.service ? `- **Service:** ${data.service}` : ''}
    `.trim();
  }, [appointmentData]);

  return {
    // State
    bookingState,
    appointmentData,
    currentFieldIndex,
    errors,
    confirmedAppointment,
    appointments,
    availableSlots,
    availableDates,
    services,
    isLoading,
    
    // Booking flow actions
    startBooking,
    getCurrentField,
    updateField,
    confirmAppointment,
    cancelBooking,
    resetBooking,
    formatAppointmentSummary,
    
    // Data fetching
    fetchAppointments,
    fetchAppointmentsByDate,
    fetchTodaysAppointments,
    fetchUpcomingAppointments,
    fetchAvailableDates,
    fetchAvailableSlots,
    fetchStats,
    
    // Appointment management
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment,
    
    // Computed
    isBookingActive: bookingState !== BOOKING_STATES.IDLE && bookingState !== BOOKING_STATES.SUCCESS,
  };
};

export default useAppointment;
