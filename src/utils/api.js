import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones para autenticación
export const authAPI = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Funciones para clientes
export const customerAPI = {
  getCustomers: async (params) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  getCustomerById: async (customerId) => {
    const response = await api.get(`/clientes/${customerId}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/clientes', customerData);
    return response.data;
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await api.put(`/clientes/${customerId}`, customerData);
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/clientes/${customerId}`);
    return response.data;
  },
};

// Funciones para productos
export const productAPI = {
  getProducts: async (params) => {
    const response = await api.get('/productos', { params });
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/productos/${productId}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/productos', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/productos/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/productos/${productId}`);
    return response.data;
  },

  importProducts: async (formData) => {
    // For file uploads, Content-Type needs to be multipart/form-data
    // Axios handles this automatically when FormData is passed as data
    const response = await api.post('/productos/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Funciones para categorías
export const categoryAPI = {
  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categorias', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categorias/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categorias/${categoryId}`);
    return response.data;
  },
};

// Funciones para ventas (Sales)
export const salesAPI = {
  recordSale: async (saleData) => {
    // Ensure saleData includes:
    // { id_cliente (opcional), items: [{ id_producto, cantidad, precio_venta }], total_venta }
    const response = await api.post('/ventas', saleData);
    return response.data;
  },

  getSales: async (params) => {
    // params could include: fecha_inicio, fecha_fin, id_cliente, etc.
    const response = await api.get('/ventas', { params });
    return response.data;
  },
  
  // For getting products to display in POS, we can reuse productAPI.getProducts
  // If a specific endpoint or different data structure is needed for POS products,
  // a new function like getProductsForSale can be added here.
  // For now, productAPI.getProducts will be used in the POS component.
};

export default api; 