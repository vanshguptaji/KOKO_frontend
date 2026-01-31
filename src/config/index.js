// Configuration for the Veterinary Chatbot SDK

const config = {
  // API Base URL - can be overridden via environment variable
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://koko-backend-1.onrender.com/api',
  
  // SDK Configuration defaults
  defaults: {
    position: 'bottom-right',
    primaryColor: '#a855f7',
    title: 'VetBot',
    subtitle: 'Virtual Veterinary Assistant',
    placeholder: 'Send message...',
    welcomeMessage: "Hello! I'm your virtual veterinary assistant. I can help you with pet care questions, vaccination schedules, diet and nutrition advice, and booking vet appointments. How can I help you today?",
  },
  
  // Session configuration
  session: {
    storageKey: 'vetbot_session_id',
    contextKey: 'vetbot_context',
  },
};

export default config;
