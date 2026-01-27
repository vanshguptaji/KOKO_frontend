import { memo } from 'react';
import { Bot, User, Calendar, CheckCircle2 } from 'lucide-react';
import { MESSAGE_TYPES } from '../../hooks/useChat';
import { formatRelativeTime } from '../../utils/dateUtils';
import './ChatMessage.css';

const ChatMessage = memo(({ message }) => {
  const { content, type, timestamp, appointmentConfirmed, appointmentId, isBookingFlow } = message;

  const messageClass = `vetbot-message vetbot-message-${type}`;

  // Parse markdown-like formatting
  const formatContent = (text) => {
    if (!text) return '';

    // Handle bold text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    // Handle bullet points
    formatted = formatted.replace(/^- (.+)$/gm, '• $1');

    return formatted;
  };

  // Render booking flow indicator
  const renderBookingIndicator = () => {
    if (!isBookingFlow || type !== MESSAGE_TYPES.BOT) return null;

    return (
      <div className="vetbot-booking-indicator">
        <span className="vetbot-booking-icon"><Calendar size={12} /></span>
        <span>Booking Appointment</span>
      </div>
    );
  };

  // Render appointment confirmation card
  const renderAppointmentSuccess = () => {
    if (!appointmentConfirmed || !appointmentId) return null;

    return (
      <div className="vetbot-appointment-card">
        <div className="vetbot-appointment-header">
          <span className="vetbot-appointment-icon"><CheckCircle2 size={16} /></span>
          <span>Appointment Booked</span>
        </div>
        <div className="vetbot-appointment-details">
          <div className="vetbot-appointment-row">
            <span className="vetbot-appointment-label">Confirmation ID:</span>
            <span className="vetbot-appointment-id">{appointmentId}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render avatar based on message type
  const renderAvatar = () => {
    if (type === MESSAGE_TYPES.USER) {
      return (
        <div className="vetbot-avatar vetbot-avatar-user">
          <User size={16} />
        </div>
      );
    }

    if (type === MESSAGE_TYPES.BOT) {
      return (
        <div className="vetbot-avatar vetbot-avatar-bot">
          <Bot size={16} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={messageClass}>
      {type !== MESSAGE_TYPES.USER && type !== MESSAGE_TYPES.SYSTEM && renderAvatar()}
      
      <div className="vetbot-message-wrapper">
        {renderBookingIndicator()}
        
        <div 
          className="vetbot-message-content"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
        
        {renderAppointmentSuccess()}
        
        {timestamp && type !== MESSAGE_TYPES.SYSTEM && (
          <span className="vetbot-message-time">
            {formatRelativeTime(timestamp)}
          </span>
        )}
      </div>
      
      {type === MESSAGE_TYPES.USER && renderAvatar()}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
