import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Product APIs
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getLowStock: () => api.get('/products/alerts/low-stock'),
};

// Sales APIs
export const salesAPI = {
    getAll: (params) => api.get('/sales', { params }),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    update: (id, data) => api.put(`/sales/${id}`, data),
    cancel: (id, reason) => api.post(`/sales/${id}/cancel`, { reason }),
    getStats: (params) => api.get('/sales/stats/summary', { params }),
};

// Inventory APIs
export const inventoryAPI = {
    getLogs: (params) => api.get('/inventory/logs', { params }),
    adjust: (data) => api.post('/inventory/adjust', data),
    getSummary: () => api.get('/inventory/summary'),
    getMovements: (productId, params) => api.get(`/inventory/movements/${productId}`, { params }),
};

// Invoice APIs
export const invoiceAPI = {
    getAll: (params) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    getByNumber: (invoiceNumber) => api.get(`/invoices/number/${invoiceNumber}`),
};

// Logs APIs
export const logsAPI = {
    getActivityLogs: (params) => api.get('/logs/activity', { params }),
    getUserActivity: (userId, params) => api.get(`/logs/activity/user/${userId}`, { params }),
    getActivityStats: (params) => api.get('/logs/activity/stats', { params }),
};

// Dashboard APIs
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getSalesByCategory: (params) => api.get('/dashboard/sales-by-category', { params }),
};

// User/Employee Management APIs (Admin only)
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    deactivate: (id) => api.put(`/users/${id}/deactivate`),
    delete: (id) => api.delete(`/users/${id}`),
};

// Category APIs
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getAllIncludingInactive: () => api.get('/categories/all'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export default api;
