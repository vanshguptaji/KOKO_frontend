// Validate phone number (basic validation)
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, dots, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
  
  // Check if it's a valid phone number (10-15 digits, optional + prefix)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)' };
  }
  
  return { isValid: true, error: null };
};

// Validate email (optional field)
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: true, error: null }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

// Validate name (not empty, reasonable length)
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: `${fieldName} is too long` };
  }
  
  return { isValid: true, error: null };
};

// Validate date (must be in the future)
export const validateFutureDate = (dateString) => {
  if (!dateString) {
    return { isValid: false, error: 'Date is required' };
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  // Reset time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  
  if (date < now) {
    return { isValid: false, error: 'Please select a future date' };
  }
  
  return { isValid: true, error: null };
};

// Validate time slot
export const validateTimeSlot = (timeSlot) => {
  if (!timeSlot) {
    return { isValid: false, error: 'Time slot is required' };
  }
  
  // Accept various time formats: HH:MM, H:MM AM/PM, etc.
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  
  if (!timeRegex.test(timeSlot)) {
    return { isValid: false, error: 'Please enter a valid time (e.g., 2:00 PM or 14:00)' };
  }
  
  return { isValid: true, error: null };
};

// Validate appointment data
export const validateAppointment = (data) => {
  const errors = {};
  
  const ownerNameValidation = validateName(data.ownerName, 'Owner name');
  if (!ownerNameValidation.isValid) {
    errors.ownerName = ownerNameValidation.error;
  }
  
  const petNameValidation = validateName(data.petName, 'Pet name');
  if (!petNameValidation.isValid) {
    errors.petName = petNameValidation.error;
  }
  
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  // Validate email if provided
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
  }
  
  // Validate scheduled date
  const dateValidation = validateFutureDate(data.scheduledDate);
  if (!dateValidation.isValid) {
    errors.scheduledDate = dateValidation.error;
  }
  
  // Validate time slot
  if (data.scheduledTimeSlot) {
    const timeValidation = validateTimeSlot(data.scheduledTimeSlot);
    if (!timeValidation.isValid) {
      errors.scheduledTimeSlot = timeValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
