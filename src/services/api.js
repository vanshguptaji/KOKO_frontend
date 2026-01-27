import axios from 'axios';
import config from '../config';
import { getSessionId, getContext } from '../utils/session';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for AI responses
});

// Request interceptor to add session info
api.interceptors.request.use(
  (requestConfig) => {
    const sessionId = getSessionId();
    const context = getContext();
    
    if (sessionId) {
      requestConfig.headers['X-Session-ID'] = sessionId;
    }
    
    if (context) {
      requestConfig.headers['X-User-Context'] = JSON.stringify(context);
    }
    
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Chat API endpoints - matches backend chatRoutes.js
export const chatAPI = {
  /**
   * Initialize a new chat session
   * POST /api/chat/init
   */
  initSession: async () => {
    const sessionId = getSessionId();
    const context = getContext();
    
    const response = await api.post('/chat/init', {
      sessionId,
      context,
    });
    
    return response.data;
  },

  /**
   * Send a message and get AI response
   * POST /api/chat/message
   * 
   * Response structure:
   * {
   *   success: boolean,
   *   data: {
   *     response: string,
   *     sessionId: string,
   *     isBookingFlow: boolean,
   *     isBookingComplete: boolean,
   *     appointmentId: string | null
   *   }
   * }
   */
  sendMessage: async (message) => {
    const sessionId = getSessionId();
    const context = getContext();
    
    const response = await api.post('/chat/message', {
      message,
      sessionId,
      context,
    });
    
    return response.data;
  },
  
  /**
   * Get conversation history
   * GET /api/chat/history/:sessionId
   * 
   * Response structure:
   * {
   *   success: boolean,
   *   data: {
   *     messages: Array<{role: string, content: string, timestamp: string}>,
   *     context: object
   *   }
   * }
   */
  getHistory: async (limit = 50) => {
    const sessionId = getSessionId();
    const response = await api.get(`/chat/history/${sessionId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Reset chat session (clears booking state)
   * DELETE /api/chat/session/:sessionId
   */
  resetSession: async () => {
    const sessionId = getSessionId();
    const response = await api.delete(`/chat/session/${sessionId}`);
    return response.data;
  },
};

// Appointment API endpoints - matches backend appointmentRoutes.js
export const appointmentAPI = {
  /**
   * Get all appointments (Admin)
   * GET /api/appointments
   */
  getAll: async (page = 1, limit = 20, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  /**
   * Get appointment by ID
   * GET /api/appointments/:id
   */
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  /**
   * Get appointments for a session
   * GET /api/appointments/session/:sessionId
   */
  getBySession: async () => {
    const sessionId = getSessionId();
    const response = await api.get(`/appointments/session/${sessionId}`);
    return response.data;
  },

  /**
   * Update appointment status (Admin)
   * PATCH /api/appointments/:id/status
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get appointment statistics (Admin)
   * GET /api/appointments/stats
   */
  getStats: async () => {
    const response = await api.get('/appointments/stats');
    return response.data;
  },
};

export default api;
