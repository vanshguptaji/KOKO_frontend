import config from '../config';

// Generate a unique session ID
export const generateSessionId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomPart}`;
};

// Get or create session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem(config.session.storageKey);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(config.session.storageKey, sessionId);
  }
  
  return sessionId;
};

// Set session ID
export const setSessionId = (sessionId) => {
  localStorage.setItem(config.session.storageKey, sessionId);
};

// Clear session
export const clearSession = () => {
  localStorage.removeItem(config.session.storageKey);
  localStorage.removeItem(config.session.contextKey);
};

// Get context from window.VetChatbotConfig or localStorage
export const getContext = () => {
  // First check if context is set via SDK configuration
  if (typeof window !== 'undefined' && window.VetChatbotConfig) {
    const context = {
      userId: window.VetChatbotConfig.userId || null,
      userName: window.VetChatbotConfig.userName || null,
      petName: window.VetChatbotConfig.petName || null,
      source: window.VetChatbotConfig.source || 'direct',
    };
    
    // Store in localStorage for persistence
    localStorage.setItem(config.session.contextKey, JSON.stringify(context));
    return context;
  }
  
  // Fall back to localStorage
  const storedContext = localStorage.getItem(config.session.contextKey);
  if (storedContext) {
    try {
      return JSON.parse(storedContext);
    } catch {
      return null;
    }
  }
  
  return null;
};

// Set context
export const setContext = (context) => {
  localStorage.setItem(config.session.contextKey, JSON.stringify(context));
};
