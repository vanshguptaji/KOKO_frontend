import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Loader2, RotateCcw, Minimize2, Sparkles } from 'lucide-react';
import { useChat, MESSAGE_TYPES } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import config from '../../config';
import './Chatbot.css';

const Chatbot = ({ 
  position = config.defaults.position,
  primaryColor = config.defaults.primaryColor,
  title = config.defaults.title,
  subtitle = config.defaults.subtitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const {
    messages,
    isLoading,
    error,
    isBookingFlow,
    sendMessage,
    clearChat,
    initializeChat,
  } = useChat();

  // Initialize chat when widget opens
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleToggle = useCallback(() => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  }, [isOpen, isMinimized]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleSendMessage = useCallback(async (message) => {
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [sendMessage]);

  const handleClearChat = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      await clearChat();
    }
  }, [clearChat]);

  // Dynamic subtitle based on booking flow
  const currentSubtitle = isBookingFlow 
    ? 'Booking an appointment' 
    : subtitle;

  // Dynamic styles based on props
  const dynamicStyles = {
    '--primary-color': primaryColor,
    '--primary-hover': adjustColor(primaryColor, -20),
  };

  return (
    <div 
      className={`vetbot-container vetbot-${position}`}
      style={dynamicStyles}
    >
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="vetbot-window">
          {/* Header */}
          <div className={`vetbot-header ${isBookingFlow ? 'vetbot-header-booking' : ''}`}>
            <div className="vetbot-header-info">
              <div className="vetbot-avatar">
                <Sparkles size={20} />
              </div>
              <div className="vetbot-header-text">
                <h3 className="vetbot-title">{title}</h3>
                <p className="vetbot-subtitle">{currentSubtitle}</p>
              </div>
            </div>
            <div className="vetbot-header-actions">
              <button 
                className="vetbot-header-btn"
                onClick={handleClearChat}
                title="Clear chat"
                aria-label="Clear chat history"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="vetbot-header-btn"
                onClick={handleMinimize}
                title="Minimize"
                aria-label="Minimize chat"
              >
                <Minimize2 size={16} />
              </button>
              <button 
                className="vetbot-header-btn"
                onClick={handleClose}
                title="Close"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="vetbot-messages" ref={chatContainerRef}>
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
              />
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="vetbot-message vetbot-message-bot">
                <div className="vetbot-message-content vetbot-loading">
                  <Loader2 className="vetbot-spinner" size={18} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput 
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={config.defaults.placeholder}
          />
        </div>
      )}

      {/* Floating Button */}
      <button 
        className={`vetbot-toggle ${isOpen ? 'vetbot-toggle-open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen && isMinimized ? (
          <MessageCircle size={24} />
        ) : isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            <span className="vetbot-toggle-pulse"></span>
          </>
        )}
      </button>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  
  // Remove # if present
  color = color.replace('#', '');
  
  // Parse the color
  const num = parseInt(color, 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export default Chatbot;
