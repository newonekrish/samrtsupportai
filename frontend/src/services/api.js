import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';
    if (error.response) {
      // Backend returned an error response
      if (error.response.data?.error) {
        message = error.response.data.error;
      } else if (error.response.data?.errors) {
        const errs = error.response.data.errors;
        if (typeof errs === 'object') {
          message = Object.entries(errs)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
        } else {
          message = String(errs);
        }
      } else if (error.response.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.response.status >= 500) {
        message = 'Server error. Please ensure the backend and database are running.';
      }
    } else if (error.request) {
      // Network error or backend offline
      message = 'Cannot connect to the backend server. Please verify Django is running at http://127.0.0.1:8000.';
    }
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch dashboard statistics
 */
export const getStats = async () => {
  const response = await apiClient.get('/tickets/stats/');
  return response.data;
};

/**
 * Fetch tickets with optional query filters (search, status, priority, category)
 */
export const getTickets = async (params = {}) => {
  const response = await apiClient.get('/tickets/', { params });
  return response.data;
};

/**
 * Fetch single ticket details by ID
 */
export const getTicket = async (id) => {
  const response = await apiClient.get(`/tickets/${id}/`);
  return response.data;
};

/**
 * Create a new customer support ticket
 */
export const createTicket = async (ticketData) => {
  const response = await apiClient.post('/tickets/', ticketData);
  return response.data;
};

/**
 * Trigger AI analysis on a ticket
 */
export const analyzeTicket = async (id) => {
  const response = await apiClient.post(`/tickets/${id}/analyze/`);
  return response.data;
};

/**
 * Update ticket status or employee edited response
 */
export const updateTicket = async (id, updateData) => {
  const response = await apiClient.patch(`/tickets/${id}/`, updateData);
  return response.data;
};

export default apiClient;
