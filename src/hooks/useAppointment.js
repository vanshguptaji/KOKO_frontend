import { useState, useCallback } from 'react';
import { appointmentAPI } from '../services/api';
import { validateAppointment } from '../utils/validators';

// Appointment booking states
export const BOOKING_STATES = {
  IDLE: 'idle',
  COLLECTING_INFO: 'collecting_info',
  CONFIRMING: 'confirming',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Fields to collect for appointment
export const APPOINTMENT_FIELDS = [
  { key: 'ownerName', label: 'Pet Owner Name', prompt: "What's your name?" },
  { key: 'petName', label: 'Pet Name', prompt: "What's your pet's name?" },
  { key: 'phone', label: 'Phone Number', prompt: "What's your phone number?" },
  { key: 'preferredDate', label: 'Preferred Date', prompt: 'What date would you prefer? (e.g., January 30, 2026)' },
  { key: 'preferredTime', label: 'Preferred Time', prompt: 'What time works best for you? (e.g., 2:00 PM)' },
];

const initialAppointmentData = {
  ownerName: '',
  petName: '',
  phone: '',
  preferredDate: '',
  preferredTime: '',
};

export const useAppointment = () => {
  const [bookingState, setBookingState] = useState(BOOKING_STATES.IDLE);
  const [appointmentData, setAppointmentData] = useState(initialAppointmentData);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Start the booking flow
  const startBooking = useCallback((initialData = {}) => {
    setAppointmentData({ ...initialAppointmentData, ...initialData });
    setCurrentFieldIndex(0);
    setBookingState(BOOKING_STATES.COLLECTING_INFO);
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
      setConfirmedAppointment(response.appointment || response);
      setBookingState(BOOKING_STATES.SUCCESS);
      
      return { success: true, appointment: response.appointment || response };
    } catch (error) {
      setBookingState(BOOKING_STATES.ERROR);
      const errorMessage = error.response?.data?.message || 'Failed to book appointment';
      setErrors({ submit: errorMessage });
      
      return { success: false, error: errorMessage };
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

  // Format appointment data for display
  const formatAppointmentSummary = useCallback(() => {
    const data = appointmentData;
    return `
📋 **Appointment Details:**
- **Owner Name:** ${data.ownerName}
- **Pet Name:** ${data.petName}
- **Phone:** ${data.phone}
- **Date:** ${data.preferredDate}
- **Time:** ${data.preferredTime}
    `.trim();
  }, [appointmentData]);

  return {
    bookingState,
    appointmentData,
    currentFieldIndex,
    errors,
    confirmedAppointment,
    startBooking,
    getCurrentField,
    updateField,
    confirmAppointment,
    cancelBooking,
    resetBooking,
    formatAppointmentSummary,
    isBookingActive: bookingState !== BOOKING_STATES.IDLE && bookingState !== BOOKING_STATES.SUCCESS,
  };
};

export default useAppointment;
