import axios from 'axios';
import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  BOOSTER_ENDPOINTS,
  ORDER_ENDPOINTS,
  MATCH_ENDPOINTS,
  REVIEW_ENDPOINTS,
  ADMIN_ENDPOINTS,
  PRICING_ENDPOINTS,
  BULK_PRICING_ENDPOINTS,
} from '../config/apiEndpoints';

/**
 * Instancia de Axios configurada con la URL base
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar el token de autenticación automáticamente
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar errores de respuesta
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================

export const authService = {
  register: (data) => api.post(AUTH_ENDPOINTS.REGISTER, data),
  login: (data) => api.post(AUTH_ENDPOINTS.LOGIN, data),
  getProfile: () => api.get(AUTH_ENDPOINTS.PROFILE),
};

// ==================== BOOSTER SERVICES ====================

export const boosterService = {
  getAll: () => api.get(BOOSTER_ENDPOINTS.GET_ALL),
  getById: (id) => api.get(BOOSTER_ENDPOINTS.GET_BY_ID(id)),
  getMyProfile: () => api.get(BOOSTER_ENDPOINTS.GET_MY_PROFILE),
  upsertProfile: (data) => api.post(BOOSTER_ENDPOINTS.UPSERT_PROFILE, data),
  toggleAvailability: () => api.patch(BOOSTER_ENDPOINTS.TOGGLE_AVAILABILITY),
};

// ==================== ORDER SERVICES ====================

export const orderService = {
  create: (data) => api.post(ORDER_ENDPOINTS.CREATE, data),
  getMyOrders: () => api.get(ORDER_ENDPOINTS.GET_MY_ORDERS),
  getBoosterOrders: () => api.get(ORDER_ENDPOINTS.GET_BOOSTER_ORDERS),
  getById: (id) => api.get(ORDER_ENDPOINTS.GET_BY_ID(id)),
  updateStatus: (id, status) => api.patch(ORDER_ENDPOINTS.UPDATE_STATUS(id), { status }),
  updateProgress: (id, data) => api.patch(ORDER_ENDPOINTS.UPDATE_PROGRESS(id), data),
};

// ==================== MATCH SERVICES ====================

export const matchService = {
  addMatch: (orderId, data) => api.post(MATCH_ENDPOINTS.ADD_MATCH(orderId), data),
  getByOrder: (orderId) => api.get(MATCH_ENDPOINTS.GET_BY_ORDER(orderId)),
  delete: (id) => api.delete(MATCH_ENDPOINTS.DELETE(id)),
};

// ==================== REVIEW SERVICES ====================

export const reviewService = {
  create: (data) => api.post(REVIEW_ENDPOINTS.CREATE, data),
  getByBooster: (boosterId) => api.get(REVIEW_ENDPOINTS.GET_BY_BOOSTER(boosterId)),
};

// ==================== ADMIN SERVICES ====================

export const adminService = {
  // Statistics
  getStatistics: () => api.get(ADMIN_ENDPOINTS.GET_STATISTICS),
  
  // Users
  getAllUsers: () => api.get(ADMIN_ENDPOINTS.GET_ALL_USERS),
  getUserById: (id) => api.get(ADMIN_ENDPOINTS.GET_USER_BY_ID(id)),
  createUser: (data) => api.post(ADMIN_ENDPOINTS.CREATE_USER, data),
  updateUser: (id, data) => api.put(ADMIN_ENDPOINTS.UPDATE_USER(id), data),
  deleteUser: (id) => api.delete(ADMIN_ENDPOINTS.DELETE_USER(id)),
  
  // Boosters
  getAllBoosters: () => api.get(ADMIN_ENDPOINTS.GET_ALL_BOOSTERS),
  updateBooster: (id, data) => api.put(ADMIN_ENDPOINTS.UPDATE_BOOSTER(id), data),
  
  // Orders
  getAllOrders: () => api.get(ADMIN_ENDPOINTS.GET_ALL_ORDERS),
  updateOrder: (id, data) => api.put(ADMIN_ENDPOINTS.UPDATE_ORDER(id), data),
};

// ==================== PRICING SERVICES ====================

export const pricingService = {
  // Public
  getBoosterPricing: (boosterId) => api.get(PRICING_ENDPOINTS.GET_BOOSTER_PRICING(boosterId)),
  calculatePrice: (boosterId, params) => api.get(PRICING_ENDPOINTS.CALCULATE_PRICE(boosterId), { params }),
  
  // Protected
  getMyPricing: () => api.get(PRICING_ENDPOINTS.GET_MY_PRICING),
  upsertMyPricing: (data) => api.post(PRICING_ENDPOINTS.UPSERT_MY_PRICING, data),
  deletePricing: (id) => api.delete(PRICING_ENDPOINTS.DELETE_PRICING(id)),
};

// ==================== BULK PRICING SERVICES ====================

export const bulkPricingService = {
  getMyConfig: () => api.get(BULK_PRICING_ENDPOINTS.GET_MY_CONFIG),
  upsertMyConfig: (data) => api.post(BULK_PRICING_ENDPOINTS.UPSERT_MY_CONFIG, data),
  calculate: (data) => api.post(BULK_PRICING_ENDPOINTS.CALCULATE, data),
};

export default api;
