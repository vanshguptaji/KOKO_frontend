# VetBot SDK - Veterinary Chatbot Frontend

A plug-and-play chatbot SDK for veterinary websites that provides AI-powered Q&A and appointment booking functionality.

## 🚀 Features

- **Floating Chat Widget**: Clean, modern UI that appears in the bottom-right corner
- **AI-Powered Responses**: Integration with backend Gemini API for veterinary Q&A
- **Appointment Booking**: Conversational flow to collect and book vet appointments
- **Easy Integration**: Single script tag to embed on any website
- **Customizable**: Configure colors, titles, and pass user context
- **Responsive**: Works on desktop and mobile devices
- **Persistent Sessions**: Conversation history maintained across page reloads

## 📦 Project Structure

```
src/
├── components/
│   └── Chatbot/           # Main chatbot UI components
│       ├── Chatbot.jsx    # Main widget container
│       ├── Chatbot.css    # Widget styles
│       ├── ChatMessage.jsx # Message bubble component
│       ├── ChatMessage.css # Message styles
│       ├── ChatInput.jsx   # Input field component
│       ├── ChatInput.css   # Input styles
│       └── index.js        # Component exports
├── config/
│   └── index.js           # Configuration constants
├── context/
│   └── ChatbotContext.jsx # Global state management
├── hooks/
│   ├── useChat.js         # Chat message handling hook
│   └── useAppointment.js  # Appointment booking hook
├── services/
│   └── api.js             # API client with axios
├── utils/
│   ├── session.js         # Session management utilities
│   ├── validators.js      # Form validation utilities
│   └── dateUtils.js       # Date formatting utilities
├── App.jsx                # Demo landing page
├── sdk.jsx                # SDK entry point for script tag
└── main.jsx               # React app entry point
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd KOKO_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
```

Build SDK for script tag integration:
```bash
npm run build:sdk
```

## 🔌 Integration Guide

### Basic Integration

Add the chatbot to any website with a single script tag:

```html
<script src="https://your-domain.com/chatbot.js"></script>
```

### With Context Configuration

Pass user context for personalized experience:

```html
<script>
  window.VetChatbotConfig = {
    userId: "user_123",
    userName: "John Doe",
    petName: "Buddy",
    source: "marketing-website"
  };
</script>
<script src="https://your-domain.com/chatbot.js"></script>
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `userId` | string | Unique identifier for the user |
| `userName` | string | User's name for personalization |
| `petName` | string | Pet's name for context |
| `source` | string | Source of integration (e.g., website name) |
| `primaryColor` | string | Primary theme color (hex) |
| `title` | string | Chatbot header title |
| `subtitle` | string | Chatbot header subtitle |

## 🎨 Customization

### Styling

The chatbot uses CSS custom properties for theming:

```css
.vetbot-container {
  --primary-color: #4F46E5;
  --primary-hover: #4338CA;
  --bg-color: #ffffff;
  --text-color: #1f2937;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
}
```

### Component Props

The `Chatbot` component accepts these props:

```jsx
<Chatbot
  position="bottom-right"      // or "bottom-left"
  primaryColor="#4F46E5"       // Theme color
  title="VetBot"               // Header title
  subtitle="Your Vet Assistant" // Header subtitle
/>
```

## 📡 API Integration

The frontend integrates with the backend API endpoints:

### Chat Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/init` | POST | Initialize a new chat session with welcome message |
| `/api/chat/message` | POST | Send message and get AI response |
| `/api/chat/history/:sessionId` | GET | Get conversation history |
| `/api/chat/session/:sessionId` | DELETE | Reset chat session (clears booking state) |

### Appointment Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | GET | Get all appointments (Admin) |
| `/api/appointments/stats` | GET | Get appointment statistics (Admin) |
| `/api/appointments/:id` | GET | Get appointment by ID |
| `/api/appointments/session/:sessionId` | GET | Get appointments by session |
| `/api/appointments/:id/status` | PATCH | Update appointment status (Admin) |

### Response Structure

Chat message response:
```json
{
  "success": true,
  "data": {
    "response": "AI response text",
    "sessionId": "session_xxx",
    "isBookingFlow": false,
    "isBookingComplete": false,
    "appointmentId": null
  }
}
```

### Request Headers

All requests include:
- `X-Session-ID`: Current session identifier
- `X-User-Context`: JSON string of user context (if provided)

## 🧪 Key Features Implementation

### Session Management

Sessions are automatically created and persisted in localStorage:
- Session ID: `vetbot_session_id`
- User Context: `vetbot_context`

### Appointment Booking Flow

The chatbot detects booking intent and collects:
1. Pet Owner Name
2. Pet Name
3. Phone Number
4. Preferred Date
5. Preferred Time

### Message Types

- `user` - User messages
- `bot` - Bot responses
- `system` - System notifications
- `error` - Error messages

## 🏗️ Architecture Decisions

1. **React Hooks over Class Components**: Modern, cleaner code with better reusability
2. **Axios for API calls**: Robust HTTP client with interceptors for session management
3. **CSS Modules alternative**: Scoped CSS with vetbot- prefix to avoid conflicts
4. **Context API**: Lightweight global state without Redux overhead
5. **IIFE SDK Build**: Self-executing bundle for easy script tag integration

## 🔮 Future Improvements

- [ ] Voice input support
- [ ] File/image upload for pet issues
- [ ] Multi-language support
- [ ] Typing indicators with WebSocket
- [ ] Offline message queue
- [ ] Analytics integration
- [ ] A/B testing for responses
- [ ] Dark mode support

## 📝 Assumptions

1. Backend API follows REST conventions
2. CORS is properly configured on the backend
3. Session storage is available in the browser
4. Users have JavaScript enabled
5. Modern browser support (ES6+)

## 🐛 Troubleshooting

### Chatbot not appearing
- Check if the script is loaded correctly
- Verify no JavaScript errors in console
- Ensure the container element isn't blocked

### API connection issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Ensure backend server is running

### Styling conflicts
- All CSS classes are prefixed with `vetbot-`
- Use `!important` sparingly to override
- Check for CSS resets that might affect the widget

## 📄 License

This project is built for the KOKO assignment.
