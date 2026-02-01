import { useState, useCallback, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { getSessionId, getContext } from '../utils/session';
import config from '../config';

// Message types
export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  ERROR: 'error',
};

// Create a message object
const createMessage = (content, type, metadata = {}) => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  content,
  type,
  timestamp: new Date().toISOString(),
  ...metadata,
});

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBookingFlow, setIsBookingFlow] = useState(false);
  const abortControllerRef = useRef(null);

  // Initialize chat with welcome message from backend
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;

    setIsLoading(true);
    
    try {
      // Try to initialize session with backend
      const response = await chatAPI.initSession();
      
      if (response.success && response.data?.response) {
        setMessages([createMessage(response.data.response, MESSAGE_TYPES.BOT)]);
      } else {
        // Fallback to default welcome message
        const context = getContext();
        let welcomeMessage = config.defaults.welcomeMessage;

        if (context?.userName) {
          welcomeMessage = `Hello, ${context.userName}! 👋 I'm your virtual veterinary assistant.`;
          if (context.petName) {
            welcomeMessage += ` I see you're here about ${context.petName}.`;
          }
          welcomeMessage += ` I can help you with pet care questions, vaccination schedules, diet & nutrition advice, and booking vet appointments. How can I help you today?`;
        }
        
        setMessages([createMessage(welcomeMessage, MESSAGE_TYPES.BOT)]);
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.log('Could not initialize session from backend, using default:', err.message);
      
      // Fallback to default welcome message
      const context = getContext();
      let welcomeMessage = config.defaults.welcomeMessage;

      if (context?.userName) {
        welcomeMessage = `Hello, ${context.userName}! 👋 I'm your virtual veterinary assistant.`;
        if (context.petName) {
          welcomeMessage += ` I see you're here about ${context.petName}.`;
        }
        welcomeMessage += ` I can help you with pet care questions, vaccination schedules, diet & nutrition advice, and booking vet appointments. How can I help you today?`;
      }
      
      setMessages([createMessage(welcomeMessage, MESSAGE_TYPES.BOT)]);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }

    // Try to fetch history from backend
    try {
      const sessionId = getSessionId();
      if (sessionId) {
        const historyResponse = await chatAPI.getHistory();
        if (historyResponse.success && historyResponse.data?.messages?.length > 0) {
          const historyMessages = historyResponse.data.messages.map((msg) =>
            createMessage(
              msg.content,
              msg.role === 'user' ? MESSAGE_TYPES.USER : MESSAGE_TYPES.BOT,
              { timestamp: msg.timestamp }
            )
          );
          setMessages(historyMessages);
        }
      }
    } catch (err) {
      // Silently fail - history fetch is optional
      console.log('Could not fetch chat history:', err.message);
    }
  }, [isInitialized]);

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage = createMessage(content.trim(), MESSAGE_TYPES.USER);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(content.trim());

      if (response.success && response.data) {
        const { response: botResponse, isBookingFlow: bookingFlow, isBookingComplete, appointmentId } = response.data;

        // Update booking flow state
        setIsBookingFlow(bookingFlow || false);

        // Add bot response with metadata
        const botMessage = createMessage(
          botResponse,
          MESSAGE_TYPES.BOT,
          {
            isBookingFlow: bookingFlow,
            isBookingComplete,
            appointmentId,
            appointmentConfirmed: isBookingComplete,
          }
        );

        setMessages((prev) => [...prev, botMessage]);

        // If booking is complete, show success message
        if (isBookingComplete && appointmentId) {
          const successMessage = createMessage(
            `✅ Your appointment has been booked successfully! (ID: ${appointmentId})`,
            MESSAGE_TYPES.SYSTEM
          );
          setMessages((prev) => [...prev, successMessage]);
        }

        return response.data;
      } else {
        // Handle API response with success: false
        const errorMsg = response.error || 'Failed to get response';
        throw new Error(errorMsg);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;

      // Extract error message from various response formats
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for validation errors array
        if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
          // Format validation errors nicely
          const validationMessages = errorData.validationErrors
            .map(ve => `• ${ve.message}`)
            .join('\n');
          errorMessage = `⚠️ Validation Error:\n${validationMessages}`;
        } else if (errorData.error) {
          // Single error message
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        createMessage(errorMessage, MESSAGE_TYPES.ERROR),
      ]);

      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  // Clear chat history and reset session
  const clearChat = useCallback(async () => {
    try {
      // Reset session on backend
      await chatAPI.resetSession();
    } catch (err) {
      console.log('Could not reset session on backend:', err.message);
    }

    // Reset local state
    setMessages([createMessage(config.defaults.welcomeMessage, MESSAGE_TYPES.BOT)]);
    setError(null);
    setIsBookingFlow(false);
  }, []);

  // Add a system message
  const addSystemMessage = useCallback((content) => {
    setMessages((prev) => [...prev, createMessage(content, MESSAGE_TYPES.SYSTEM)]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    isInitialized,
    isBookingFlow,
    sendMessage,
    clearChat,
    addSystemMessage,
    initializeChat,
  };
};

export default useChat;
