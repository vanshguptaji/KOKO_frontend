// Validate phone number (basic validation)
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid phone number (10-15 digits)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
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
  
  const dateValidation = validateFutureDate(data.preferredDate);
  if (!dateValidation.isValid) {
    errors.preferredDate = dateValidation.error;
  }
  
  if (data.preferredTime && typeof data.preferredTime === 'string') {
    // Basic time format validation (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.preferredTime)) {
      errors.preferredTime = 'Please enter a valid time';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
