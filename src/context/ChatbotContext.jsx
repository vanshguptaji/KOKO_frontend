import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getContext, setContext, getSessionId, clearSession } from '../utils/session';

// Create context
const ChatbotContext = createContext(null);

// Provider component
export const ChatbotProvider = ({ children, config = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [sessionId, setSessionIdState] = useState(null);

  // Initialize context on mount
  useEffect(() => {
    const ctx = getContext();
    const sid = getSessionId();
    setUserContext(ctx);
    setSessionIdState(sid);
  }, []);

  // Toggle chatbot open/close
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Open chatbot
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close chatbot
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Update user context
  const updateContext = useCallback((newContext) => {
    const merged = { ...userContext, ...newContext };
    setContext(merged);
    setUserContext(merged);
  }, [userContext]);

  // Clear session and context
  const resetSession = useCallback(() => {
    clearSession();
    setUserContext(null);
    setSessionIdState(getSessionId());
  }, []);

  const value = {
    isOpen,
    userContext,
    sessionId,
    config,
    toggleChat,
    openChat,
    closeChat,
    updateContext,
    resetSession,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Hook to use chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  
  return context;
};

export default ChatbotContext;
