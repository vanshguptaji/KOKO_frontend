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
  getAll: async (options = {}) => {
    const { 
      page = 1, 
      limit = 20, 
      status = null,
      date = null,
      startDate = null,
      endDate = null,
      search = null,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = options;
    
    const params = { page, limit, sortBy, sortOrder };
    if (status) params.status = status;
    if (date) params.date = date;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;
    
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
   * Get available services and pet types
   * GET /api/appointments/services
   */
  getServices: async () => {
    const response = await api.get('/appointments/services');
    return response.data;
  },

  /**
   * Get available dates for the next N days
   * GET /api/appointments/available-dates
   */
  getAvailableDates: async (days = 14) => {
    const response = await api.get('/appointments/available-dates', { params: { days } });
    return response.data;
  },

  /**
   * Get available time slots for a specific date
   * GET /api/appointments/available-slots/:date
   */
  getAvailableSlots: async (date) => {
    const response = await api.get(`/appointments/available-slots/${date}`);
    return response.data;
  },

  /**
   * Create a new appointment
   * POST /api/appointments
   */
  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  /**
   * Update an appointment
   * PUT /api/appointments/:id
   */
  update: async (id, updateData) => {
    const response = await api.put(`/appointments/${id}`, updateData);
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
   * Cancel an appointment
   * PATCH /api/appointments/:id/cancel
   */
  cancel: async (id, reason = '') => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Delete an appointment (Admin)
   * DELETE /api/appointments/:id
   */
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Get today's appointments
   * GET /api/appointments/today
   */
  getToday: async () => {
    const response = await api.get('/appointments/today');
    return response.data;
  },

  /**
   * Get upcoming appointments
   * GET /api/appointments/upcoming
   */
  getUpcoming: async (limit = 10) => {
    const response = await api.get('/appointments/upcoming', { params: { limit } });
    return response.data;
  },

  /**
   * Get appointments by date
   * GET /api/appointments/date/:date
   */
  getByDate: async (date) => {
    const response = await api.get(`/appointments/date/${date}`);
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
