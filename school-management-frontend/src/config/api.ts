// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change_password',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/update_profile',
  },
  
  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events/create',
    DETAIL: (id: string) => `/events/${id}`,
    UPDATE: (id: string) => `/events/${id}/update`,
    DELETE: (id: string) => `/events/${id}/delete`,
    BULK_CREATE: '/events/bulk_create',
  },
  
  // Event Types
  EVENT_TYPES: {
    LIST: '/events/event-types',
    CREATE: '/events/event-types/create',
    DETAIL: (id: string) => `/events/event-types/${id}`,
    UPDATE: (id: string) => `/events/event-types/${id}/update`,
    DELETE: (id: string) => `/events/event-types/${id}/delete`,
  },
  
  // Classrooms
  CLASSROOMS: {
    LIST: '/classrooms',
    CREATE: '/classrooms/create',
    DETAIL: (id: string) => `/classrooms/${id}`,
    UPDATE: (id: string) => `/classrooms/${id}/update`,
    DELETE: (id: string) => `/classrooms/${id}/delete`,
  },
  
  // Students
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students/create',
    DETAIL: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}/update`,
    DELETE: (id: string) => `/students/${id}/delete`,
  },
  
  // Week Summaries
  WEEK_SUMMARIES: {
    LIST: '/week-summaries',
    DETAIL: (id: string) => `/week-summaries/${id}`,
    APPROVE: (id: string) => `/week-summaries/${id}/approve`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RANKINGS: '/dashboard/rankings',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
  }
  
  return url;
}; 