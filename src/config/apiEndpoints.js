/**
 * Configuración centralizada de endpoints de la API
 * Todas las URLs de los endpoints están aquí para fácil mantenimiento
 */

// URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Endpoints de Autenticación
 */
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
};

/**
 * Endpoints de Boosters
 */
export const BOOSTER_ENDPOINTS = {
  GET_ALL: '/boosters',
  GET_BY_ID: (id) => `/boosters/${id}`,
  GET_MY_PROFILE: '/boosters/me/profile',
  UPSERT_PROFILE: '/boosters/me/profile',
  TOGGLE_AVAILABILITY: '/boosters/me/availability',
};

/**
 * Endpoints de Órdenes
 */
export const ORDER_ENDPOINTS = {
  CREATE: '/orders',
  GET_MY_ORDERS: '/orders/my-orders',
  GET_BOOSTER_ORDERS: '/orders/my-booster-orders',
  GET_BY_ID: (id) => `/orders/${id}`,
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
  UPDATE_PROGRESS: (id) => `/orders/${id}/progress`,
  PROCESS_PAYMENT: (orderId) => `/orders/${orderId}/payment`,
  CANCEL: (id) => `/orders/${id}/cancel`,
};

/**
 * Endpoints de Partidas
 */
export const MATCH_ENDPOINTS = {
  ADD_MATCH: (orderId) => `/matches/order/${orderId}`,
  GET_BY_ORDER: (orderId) => `/matches/order/${orderId}`,
  DELETE: (id) => `/matches/${id}`,
};

/**
 * Endpoints de Reseñas
 */
export const REVIEW_ENDPOINTS = {
  CREATE: '/reviews',
  GET_BY_BOOSTER: (boosterId) => `/reviews/booster/${boosterId}`,
};

/**
 * Endpoints de Administración (solo para admins)
 */
export const ADMIN_ENDPOINTS = {
  // Statistics
  GET_STATISTICS: '/admin/statistics',
  
  // Users
  GET_ALL_USERS: '/admin/users',
  GET_USER_BY_ID: (id) => `/admin/users/${id}`,
  CREATE_USER: '/admin/users',
  UPDATE_USER: (id) => `/admin/users/${id}`,
  DELETE_USER: (id) => `/admin/users/${id}`,
  
  // Boosters
  GET_ALL_BOOSTERS: '/admin/boosters',
  UPDATE_BOOSTER: (id) => `/admin/boosters/${id}`,
  
  // Orders
  GET_ALL_ORDERS: '/admin/orders',
  UPDATE_ORDER: (id) => `/admin/orders/${id}`,
};

/**
 * Endpoints de Pricing (cotizaciones de boosters)
 */
export const PRICING_ENDPOINTS = {
  // Public
  GET_BOOSTER_PRICING: (boosterId) => `/pricing/booster/${boosterId}`,
  CALCULATE_PRICE: (boosterId) => `/pricing/booster/${boosterId}/calculate`,
  
  // Protected (booster only)
  GET_MY_PRICING: '/pricing/my-pricing',
  UPSERT_MY_PRICING: '/pricing/my-pricing',
  DELETE_PRICING: (id) => `/pricing/my-pricing/${id}`,
};

/**
 * Endpoints de Bulk Pricing (configuración bulk de precios)
 */
export const BULK_PRICING_ENDPOINTS = {
  GET_MY_CONFIG: '/pricing/bulk/my-config',
  UPSERT_MY_CONFIG: '/pricing/bulk/my-config',
  CALCULATE: '/pricing/bulk/calculate',
};

/**
 * Endpoint de Health Check
 */
export const HEALTH_ENDPOINT = '/health';
