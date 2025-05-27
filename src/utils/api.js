/**
 * src/utils/api.js
 * 
 * This file configures and exports the main Axios instance used for making API calls
 * throughout the application. It establishes the base URL for the API and sets up
 * default headers.
 * 
 * It also includes an Axios request interceptor to automatically attach the JWT token
 * (if available in localStorage) to the Authorization header of outgoing requests.
 * 
 * Furthermore, this file serves as a central module for organizing and exporting
 * various groups of API functions, such as `authAPI`, `categoryAPI`, `productAPI`,
 * `customerAPI`, and `salesAPI`, each dedicated to a specific domain of the application.
 */
import axios from 'axios';

/** @const {string} API_URL - The base URL for all API requests. */
const API_URL = 'http://localhost:8000/api/v1';

// Create a pre-configured Axios instance for API communication.
// This instance will be used for all API calls, ensuring consistent base URL and headers.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json', // Default content type for requests.
  },
});

// Axios request interceptor to automatically add the JWT token to requests.
/**
 * Axios request interceptor.
 * Attaches the JWT token from localStorage to the Authorization header (Bearer token)
 * for all outgoing requests made through this `api` instance.
 * @param {import('axios').AxiosRequestConfig} config - The Axios request configuration object.
 * @returns {import('axios').AxiosRequestConfig} The modified config object.
 */
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

/**
 * @namespace authAPI
 * @description Contains functions for handling user authentication.
 */
export const authAPI = {
  /**
   * Attempts to log in a user with the provided email and password.
   * Uses 'application/x-www-form-urlencoded' content type for the request.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} A promise that resolves to the API response data, 
   *                            typically including an access_token on success.
   * @throws {Error} If the API request fails.
   */
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
  
  /**
   * Registers a new user with the provided user data.
   * @param {object} userData - An object containing user registration details.
   * @param {string} userData.email - The user's email address.
   * @param {string} userData.password - The user's password.
   * @param {string} userData.nombre - The user's first name.
   * @param {string} userData.apellido - The user's last name.
   * @param {string} [userData.rol='usuario'] - The user's role (defaults to 'usuario' if not provided by frontend).
   * @returns {Promise<object>} A promise that resolves to the API response data,
   *                            which might include user details and/or an access_token
   *                            depending on the backend's registration flow.
   * @throws {Error} If the API request fails.
   */
  register: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  /**
   * Fetches the currently authenticated user's data.
   * Relies on the JWT interceptor to include the authentication token in the request.
   * @returns {Promise<object>} A promise that resolves to the user data object, 
   *                            typically including email, name, role, etc.
   * @throws {Error} If the API request fails (e.g., token is invalid or expired).
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

/**
 * @namespace customerAPI
 * @description Contains functions for managing customer data.
 */
export const customerAPI = {
  /**
   * Fetches customers from the API. Can be filtered using parameters.
   * @param {object} [params] - Optional parameters for filtering customers.
   * @param {string} [params.search] - Search term to filter customers by name, email, phone, etc. (if backend supports).
   * @returns {Promise<Array<object>>} A promise that resolves to an array of customer objects.
   * Each customer object typically includes `id_cliente`, `nombre`, `email`, `telefono`, `direccion`.
   * @throws {Error} If the API request fails.
   */
  getCustomers: async (params) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  /**
   * Fetches a single customer by their ID.
   * @param {string|number} customerId - The ID of the customer to fetch.
   * @returns {Promise<object>} A promise that resolves to the customer object.
   * @throws {Error} If the API request fails or the customer is not found.
   */
  getCustomerById: async (customerId) => {
    const response = await api.get(`/clientes/${customerId}`);
    return response.data;
  },

  /**
   * Creates a new customer.
   * @param {object} customerData - Data for the new customer.
   * @param {string} customerData.nombre - Customer's full name.
   * @param {string} customerData.email - Customer's email address.
   * @param {string} [customerData.telefono] - Customer's phone number (optional).
   * @param {string} [customerData.direccion] - Customer's physical address (optional).
   * @returns {Promise<object>} A promise that resolves to the newly created customer object.
   * @throws {Error} If the API request fails.
   */
  createCustomer: async (customerData) => {
    const response = await api.post('/clientes', customerData);
    return response.data;
  },

  /**
   * Updates an existing customer.
   * @param {string|number} customerId - The ID of the customer to update.
   * @param {object} customerData - Data to update the customer with.
   * Can include `nombre`, `email`, `telefono`, `direccion`.
   * @returns {Promise<object>} A promise that resolves to the updated customer object.
   * @throws {Error} If the API request fails.
   */
  updateCustomer: async (customerId, customerData) => {
    const response = await api.put(`/clientes/${customerId}`, customerData);
    return response.data;
  },

  /**
   * Deletes a customer.
   * @param {string|number} customerId - The ID of the customer to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message or an empty object from the API.
   * @throws {Error} If the API request fails.
   */
  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/clientes/${customerId}`);
    return response.data;
  },
};

/**
 * @namespace productAPI
 * @description Contains functions for managing products.
 */
export const productAPI = {
  /**
   * Fetches products from the API. Can be filtered using parameters.
   * @param {object} [params] - Optional parameters for filtering products.
   * @param {string|number} [params.id_categoria] - Category ID to filter products by.
   * @param {string} [params.search] - Search term to filter products by name, etc. (if backend supports).
   * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
   * Each product object typically includes `id_producto`, `nombre`, `descripcion`, `precio`, `stock`, `id_categoria`.
   * @throws {Error} If the API request fails.
   */
  getProducts: async (params) => {
    const response = await api.get('/productos', { params });
    return response.data;
  },

  /**
   * Fetches a single product by its ID.
   * @param {string|number} productId - The ID of the product to fetch.
   * @returns {Promise<object>} A promise that resolves to the product object.
   * @throws {Error} If the API request fails or the product is not found.
   */
  getProductById: async (productId) => {
    const response = await api.get(`/productos/${productId}`);
    return response.data;
  },

  /**
   * Creates a new product.
   * @param {object} productData - Data for the new product.
   * @param {string} productData.nombre - Name of the product.
   * @param {string} [productData.descripcion] - Description of the product.
   * @param {number} productData.precio - Price of the product.
   * @param {number} productData.stock - Stock quantity of the product.
   * @param {string|number} productData.id_categoria - ID of the category the product belongs to.
   * @returns {Promise<object>} A promise that resolves to the newly created product object.
   * @throws {Error} If the API request fails.
   */
  createProduct: async (productData) => {
    const response = await api.post('/productos', productData);
    return response.data;
  },

  /**
   * Updates an existing product.
   * @param {string|number} productId - The ID of the product to update.
   * @param {object} productData - Data to update the product with.
   * Can include `nombre`, `descripcion`, `precio`, `stock`, `id_categoria`.
   * @returns {Promise<object>} A promise that resolves to the updated product object.
   * @throws {Error} If the API request fails.
   */
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/productos/${productId}`, productData);
    return response.data;
  },

  /**
   * Deletes a product.
   * @param {string|number} productId - The ID of the product to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message or an empty object from the API.
   * @throws {Error} If the API request fails.
   */
  deleteProduct: async (productId) => {
    const response = await api.delete(`/productos/${productId}`);
    return response.data;
  },

  /**
   * Imports products from an Excel file.
   * The server is expected to handle the Excel file parsing and product creation/update.
   * @param {FormData} formData - The FormData object containing the Excel file.
   * The file should be appended with the key 'file' (e.g., `formData.append('file', excelFile)`).
   * @returns {Promise<object>} A promise that resolves to the API response, which might include
   * details like the number of products imported, any errors, or a success message.
   * @throws {Error} If the API request fails.
   */
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

/**
 * @namespace categoryAPI
 * @description Contains functions for managing product categories.
 */
export const categoryAPI = {
  /**
   * Fetches all categories from the API.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of category objects. 
   * Each object typically contains `id_categoria` and `nombre`.
   * @throws {Error} If the API request fails.
   */
  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },

  /**
   * Creates a new category.
   * @param {object} categoryData - Data for the new category.
   * @param {string} categoryData.nombre - The name of the new category.
   * @returns {Promise<object>} A promise that resolves to the newly created category object.
   * @throws {Error} If the API request fails.
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/categorias', categoryData);
    return response.data;
  },

  /**
   * Updates an existing category.
   * @param {string|number} categoryId - The ID of the category to update.
   * @param {object} categoryData - Data to update the category with.
   * @param {string} categoryData.nombre - The new name for the category.
   * @returns {Promise<object>} A promise that resolves to the updated category object.
   * @throws {Error} If the API request fails.
   */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categorias/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Deletes a category.
   * @param {string|number} categoryId - The ID of the category to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message or an empty object from the API.
   * @throws {Error} If the API request fails.
   */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categorias/${categoryId}`);
    return response.data;
  },
};

/**
 * @namespace salesAPI
 * @description Contains functions for managing sales transactions and reports.
 */
export const salesAPI = {
  /**
   * Records a new sale transaction.
   * @param {object} saleData - Data for the new sale.
   * @param {(string|number|null)} saleData.id_cliente - The ID of the customer, or null if not specified (e.g., walk-in).
   * @param {Array<object>} saleData.items - An array of items sold.
   * @param {(string|number)} saleData.items[].id_producto - The ID of the product sold.
   * @param {number} saleData.items[].cantidad - The quantity of the product sold.
   * @param {number} saleData.items[].precio_venta - The price at which the product was sold (per unit).
   * @param {number} saleData.monto_total - The total amount of the sale.
   * @returns {Promise<object>} A promise that resolves to the API response, typically confirming the sale
   *                            (e.g., the created sale object or a success message).
   * @throws {Error} If the API request fails.
   */
  recordSale: async (saleData) => {
    // Ensure saleData includes:
    // { id_cliente (opcional), items: [{ id_producto, cantidad, precio_venta }], monto_total }
    const response = await api.post('/ventas', saleData);
    return response.data;
  },

  /**
   * Fetches sales records from the API. Can be filtered using parameters.
   * @param {object} [params] - Optional parameters for filtering sales records.
   * @param {string} [params.fecha_inicio] - Start date for filtering sales (e.g., 'YYYY-MM-DD').
   * @param {string} [params.fecha_fin] - End date for filtering sales (e.g., 'YYYY-MM-DD').
   * @param {string|number} [params.id_cliente] - Customer ID to filter sales by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of sale objects.
   * Each sale object typically includes `id_venta`, `fecha_venta`, `id_cliente`, `monto_total`, and an `items` array.
   * @throws {Error} If the API request fails.
   */
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