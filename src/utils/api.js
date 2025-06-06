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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create a pre-configured Axios instance for API communication.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle network errors
    if (!response) {
      console.error('Network Error:', error.message);
      return Promise.reject(error);
    }

    // Handle specific error cases
    switch (response.status) {
      case 401:
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      
      case 403:
        console.error('Permission denied:', response.data?.detail);
        break;
      
      case 404:
        console.error('Resource not found:', response.data?.detail);
        break;
      
      case 500:
        console.error('Server error:', response.data?.detail);
        break;
      
      default:
        console.error('API Error:', response.data?.detail || 'Unknown error');
        break;
    }
    
    // Always return the original error to maintain compatibility
    return Promise.reject(error);
  }
);

// Axios request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token found in localStorage');
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
    
    const response = await api.post('/auth/login', formData, {
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
   * Fetches customers from the API for a specific business. Can be filtered using parameters.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering customers.
   * @param {string} [params.q] - Search term to filter customers by name, apellido, email, or documento_numero.
   * @param {string} [params.documento_tipo] - Document type to filter customers by.
   * @param {number} [params.limit] - Maximum number of results to return (1-100, default 10).
   * @param {number} [params.offset] - Number of results to skip for pagination (default 0).
   * @returns {Promise<Array<object>>} A promise that resolves to an array of customer objects.
   * Each customer object typically includes `id`, `nombre`, `apellido`, `email`, `telefono`, `direccion`, `documento_tipo`, `documento_numero`.
   * @throws {Error} If the API request fails.
   */
  getCustomers: async (businessId, params) => {
    const response = await api.get(`/businesses/${businessId}/clientes`, { params });
    return response.data;
  },

  /**
   * Fetches a single customer by their ID for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} customerId - The ID of the customer to fetch.
   * @returns {Promise<object>} A promise that resolves to the customer object.
   * @throws {Error} If the API request fails or the customer is not found.
   */
  getCustomerById: async (businessId, customerId) => {
    const response = await api.get(`/businesses/${businessId}/clientes/${customerId}`);
    return response.data;
  },

  /**
   * Creates a new customer for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} customerData - Data for the new customer.
   * @param {string} customerData.nombre - Customer's name.
   * @param {string} [customerData.apellido] - Customer's last name (optional).
   * @param {string} [customerData.email] - Customer's email address (optional).
   * @param {string} [customerData.telefono] - Customer's phone number (optional).
   * @param {string} [customerData.direccion] - Customer's physical address (optional).
   * @param {string} [customerData.documento_tipo] - Customer's document type (optional).
   * @param {string} [customerData.documento_numero] - Customer's document number (optional).
   * @returns {Promise<object>} A promise that resolves to the newly created customer object.
   * @throws {Error} If the API request fails.
   */
  createCustomer: async (businessId, customerData) => {
    const response = await api.post(`/businesses/${businessId}/clientes`, customerData);
    return response.data;
  },

  /**
   * Updates an existing customer for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} customerId - The ID of the customer to update.
   * @param {object} customerData - Data to update the customer with.
   * Can include `nombre`, `apellido`, `email`, `telefono`, `direccion`, `documento_tipo`, `documento_numero`.
   * @returns {Promise<object>} A promise that resolves to the updated customer object.
   * @throws {Error} If the API request fails.
   */
  updateCustomer: async (businessId, customerId, customerData) => {
    const response = await api.put(`/businesses/${businessId}/clientes/${customerId}`, customerData);
    return response.data;
  },

  /**
   * Deletes a customer for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} customerId - The ID of the customer to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message from the API.
   * @throws {Error} If the API request fails.
   */
  deleteCustomer: async (businessId, customerId) => {
    const response = await api.delete(`/businesses/${businessId}/clientes/${customerId}`);
    return response.data;
  },
};

/**
 * @namespace productAPI
 * @description Contains functions for managing products.
 */
export const productAPI = {
  /**
   * Fetches products from the API for a specific business. Can be filtered using parameters.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering products.
   * @param {string|number} [params.category_id] - Category ID to filter products by.
   * @param {string} [params.search] - Search term to filter products by name, etc. (if backend supports).
   * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
   * Each product object typically includes `id`, `nombre`, `descripcion`, `precio_venta`, `stock_actual`, `categoria_id`.
   * @throws {Error} If the API request fails.
   */
  getProducts: async (businessId, params) => {
    const response = await api.get(`/businesses/${businessId}/products`, { params });
    return response.data;
  },

  /**
   * Fetches a single product by its ID for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} productId - The ID of the product to fetch.
   * @returns {Promise<object>} A promise that resolves to the product object.
   * @throws {Error} If the API request fails or the product is not found.
   */
  getProductById: async (businessId, productId) => {
    const response = await api.get(`/businesses/${businessId}/products/${productId}`);
    return response.data;
  },

  /**
   * Creates a new product for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} productData - Data for the new product.
   * @param {string} productData.nombre - Name of the product.
   * @param {string} [productData.descripcion] - Description of the product.
   * @param {number} productData.precio_venta - Sale price of the product.
   * @param {number} [productData.precio_compra] - Purchase price of the product.
   * @param {number} productData.stock_actual - Current stock quantity of the product.
   * @param {number} [productData.stock_minimo] - Minimum stock quantity of the product.
   * @param {string|number} productData.categoria_id - ID of the category the product belongs to.
   * @param {string} [productData.codigo] - Product code/SKU.
   * @param {boolean} [productData.activo] - Whether the product is active.
   * @returns {Promise<object>} A promise that resolves to the newly created product object.
   * @throws {Error} If the API request fails.
   */
  createProduct: async (businessId, productData) => {
    const response = await api.post(`/businesses/${businessId}/products`, productData);
    return response.data;
  },

  /**
   * Updates an existing product for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} productId - The ID of the product to update.
   * @param {object} productData - Data to update the product with.
   * Can include `nombre`, `descripcion`, `precio_venta`, `precio_compra`, `stock_actual`, `stock_minimo`, `categoria_id`, `codigo`, `activo`.
   * @returns {Promise<object>} A promise that resolves to the updated product object.
   * @throws {Error} If the API request fails.
   */
  updateProduct: async (businessId, productId, productData) => {
    const response = await api.put(`/businesses/${businessId}/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Deletes a product for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} productId - The ID of the product to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message or an empty object from the API.
   * @throws {Error} If the API request fails.
   */
  deleteProduct: async (businessId, productId) => {
    const response = await api.delete(`/businesses/${businessId}/products/${productId}`);
    return response.data;
  },

  /**
   * Imports products from an Excel file for a specific business.
   * The server is expected to handle the Excel file parsing and product creation/update.
   * @param {string} businessId - The ID of the business.
   * @param {FormData} formData - The FormData object containing the Excel file.
   * The file should be appended with the key 'file' (e.g., `formData.append('file', excelFile)`).
   * @returns {Promise<object>} A promise that resolves to the API response, which might include
   * details like the number of products imported, any errors, or a success message.
   * @throws {Error} If the API request fails.
   */
  importProducts: async (businessId, formData) => {
    // For file uploads, Content-Type needs to be multipart/form-data
    // Axios handles this automatically when FormData is passed as data
    const response = await api.post(`/businesses/${businessId}/products/importar-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * New import workflow endpoints
   */
  
  /**
   * Uploads and processes an Excel file for product import.
   * @param {string} businessId - The ID of the business.
   * @param {FormData} formData - The FormData object containing the Excel file.
   * @returns {Promise<object>} A promise that resolves to the import result with temporary products.
   * @throws {Error} If the API request fails.
   */
  uploadImportFile: async (businessId, formData) => {
    const response = await api.post(`/businesses/${businessId}/import/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Gets the import summary for the current import session.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<object>} A promise that resolves to the import summary.
   * @throws {Error} If the API request fails.
   */
  getImportSummary: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/import/resumen`);
    return response.data;
  },

  /**
   * Gets the temporary products from the current import session.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of temporary products.
   * @throws {Error} If the API request fails.
   */
  getTemporaryProducts: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/import/productos-temporales`);
    return response.data;
  },

  /**
   * Updates a temporary product before final import.
   * @param {string} businessId - The ID of the business.
   * @param {string} productId - The ID of the temporary product.
   * @param {object} productData - The updated product data.
   * @returns {Promise<object>} A promise that resolves to the updated temporary product.
   * @throws {Error} If the API request fails.
   */
  updateTemporaryProduct: async (businessId, productId, productData) => {
    const response = await api.put(`/businesses/${businessId}/import/productos-temporales/${productId}`, productData);
    return response.data;
  },

  /**
   * Confirms the import and creates the final products.
   * @param {string} businessId - The ID of the business.
   * @param {object} confirmationData - The confirmation data including selected products and options.
   * @returns {Promise<object>} A promise that resolves to the final import result.
   * @throws {Error} If the API request fails.
   */
  confirmImport: async (businessId, confirmationData) => {
    const response = await api.post(`/businesses/${businessId}/import/confirmar`, confirmationData);
    return response.data;
  },

  /**
   * Cancels the current import session and cleans up temporary data.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  cancelImport: async (businessId) => {
    const response = await api.delete(`/businesses/${businessId}/import/cancelar`);
    return response.data;
  },

  /**
   * Gets the sheet names from an Excel file.
   * @param {string} businessId - The ID of the business.
   * @param {FormData} formData - The FormData object containing the Excel file.
   * @returns {Promise<Array<string>>} A promise that resolves to an array of sheet names.
   * @throws {Error} If the API request fails.
   */
  getExcelSheets: async (businessId, formData) => {
    const response = await api.post(`/businesses/${businessId}/import/hojas-excel`, formData, {
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
   * Fetches all categories for a specific business from the API.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of category objects. 
   * Each object typically contains `id` and `nombre`.
   * @throws {Error} If the API request fails.
   */
  getCategories: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/categories/`);
    return response.data;
  },

  /**
   * Creates a new category for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} categoryData - Data for the new category.
   * @param {string} categoryData.nombre - The name of the new category.
   * @param {string} [categoryData.descripcion] - The description of the new category.
   * @returns {Promise<object>} A promise that resolves to the newly created category object.
   * @throws {Error} If the API request fails.
   */
  createCategory: async (businessId, categoryData) => {
    const response = await api.post(`/businesses/${businessId}/categories/`, categoryData);
    return response.data;
  },

  /**
   * Updates an existing category within a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} categoryId - The ID of the category to update.
   * @param {object} categoryData - Data to update the category with.
   * Can include `nombre`, `descripcion`.
   * @returns {Promise<object>} A promise that resolves to the updated category object.
   * @throws {Error} If the API request fails.
   */
  updateCategory: async (businessId, categoryId, categoryData) => {
    const response = await api.put(`/businesses/${businessId}/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Deletes a category within a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string|number} categoryId - The ID of the category to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message or an empty object from the API.
   * @throws {Error} If the API request fails.
   */
  deleteCategory: async (businessId, categoryId) => {
    const response = await api.delete(`/businesses/${businessId}/categories/${categoryId}`);
    return response.data;
  },
};

/**
 * @namespace salesAPI
 * @description Contains functions for managing sales transactions and reports.
 */
export const salesAPI = {
  /**
   * Records a new sale transaction for a specific business.
   * @param {string} businessId - The ID of the business.
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
  recordSale: async (businessId, saleData) => {
    // Ensure saleData includes:
    // { id_cliente (opcional), items: [{ id_producto, cantidad, precio_venta }], monto_total }
    const response = await api.post(`/businesses/${businessId}/ventas`, saleData);
    return response.data;
  },

  /**
   * Fetches sales records from the API for a specific business. Can be filtered using parameters.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering sales records.
   * @param {string} [params.fecha_inicio] - Start date for filtering sales (e.g., 'YYYY-MM-DD').
   * @param {string} [params.fecha_fin] - End date for filtering sales (e.g., 'YYYY-MM-DD').
   * @param {string|number} [params.id_cliente] - Customer ID to filter sales by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of sale objects.
   * Each sale object typically includes `id_venta`, `fecha_venta`, `id_cliente`, `monto_total`, and an `items` array.
   * @throws {Error} If the API request fails.
   */
  getSales: async (businessId, params) => {
    // params could include: fecha_inicio, fecha_fin, id_cliente, etc.
    const response = await api.get(`/businesses/${businessId}/ventas`, { params });
    return response.data;
  },
  
  // For getting products to display in POS, we can reuse productAPI.getProducts
  // If a specific endpoint or different data structure is needed for POS products,
  // a new function like getProductsForSale can be added here.
  // For now, productAPI.getProducts will be used in the POS component.
};

/**
 * @namespace serviceAPI
 * @description Contains functions for managing business services.
 */
export const serviceAPI = {
  /**
   * Fetches services from the API for a specific business. Can be filtered using parameters.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering services.
   * @param {string} [params.category_id] - Category ID to filter services by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of service objects.
   * @throws {Error} If the API request fails.
   */
  getServices: async (businessId, params) => {
    const response = await api.get(`/businesses/${businessId}/services`, { params });
    return response.data;
  },

  /**
   * Fetches a single service by its ID for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} serviceId - The ID of the service to fetch.
   * @returns {Promise<object>} A promise that resolves to the service object.
   * @throws {Error} If the API request fails or the service is not found.
   */
  getServiceById: async (businessId, serviceId) => {
    const response = await api.get(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  },

  /**
   * Creates a new service for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} serviceData - Data for the new service.
   * @param {string} serviceData.nombre - Service name.
   * @param {string} [serviceData.descripcion] - Service description.
   * @param {number} serviceData.precio - Service price.
   * @param {number} [serviceData.duracion_minutos] - Service duration in minutes.
   * @param {string} [serviceData.categoria_id] - Category ID.
   * @param {boolean} [serviceData.activo] - Whether the service is active.
   * @returns {Promise<object>} A promise that resolves to the newly created service object.
   * @throws {Error} If the API request fails.
   */
  createService: async (businessId, serviceData) => {
    const response = await api.post(`/businesses/${businessId}/services`, serviceData);
    return response.data;
  },

  /**
   * Updates an existing service for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} serviceId - The ID of the service to update.
   * @param {object} serviceData - Updated service data.
   * @returns {Promise<object>} A promise that resolves to the updated service object.
   * @throws {Error} If the API request fails.
   */
  updateService: async (businessId, serviceId, serviceData) => {
    const response = await api.put(`/businesses/${businessId}/services/${serviceId}`, serviceData);
    return response.data;
  },

  /**
   * Deletes a service for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} serviceId - The ID of the service to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  deleteService: async (businessId, serviceId) => {
    const response = await api.delete(`/businesses/${businessId}/services/${serviceId}`);
    return response.data;
  },
};

/**
 * @namespace subscriptionAPI
 * @description Contains functions for managing client subscriptions to services.
 */
export const subscriptionAPI = {
  /**
   * Fetches subscriptions from the API for a specific business. Can be filtered using parameters.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering subscriptions.
   * @param {string} [params.cliente_id] - Client ID to filter subscriptions by.
   * @param {string} [params.servicio_id] - Service ID to filter subscriptions by.
   * @param {string} [params.estado] - Status to filter subscriptions by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of subscription objects.
   * @throws {Error} If the API request fails.
   */
  getSubscriptions: async (businessId, params) => {
    const response = await api.get(`/businesses/${businessId}/subscriptions`, { params });
    return response.data;
  },

  /**
   * Fetches a single subscription by its ID for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} subscriptionId - The ID of the subscription to fetch.
   * @returns {Promise<object>} A promise that resolves to the subscription object.
   * @throws {Error} If the API request fails or the subscription is not found.
   */
  getSubscriptionById: async (businessId, subscriptionId) => {
    const response = await api.get(`/businesses/${businessId}/subscriptions/${subscriptionId}`);
    return response.data;
  },

  /**
   * Creates a new subscription for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} subscriptionData - Data for the new subscription.
   * @param {string} subscriptionData.cliente_id - Client ID.
   * @param {string} subscriptionData.servicio_id - Service ID.
   * @param {string} subscriptionData.nombre - Subscription name.
   * @param {string} [subscriptionData.descripcion] - Subscription description.
   * @param {number} subscriptionData.precio_mensual - Monthly price.
   * @param {string} [subscriptionData.tipo] - Subscription type (mensual, trimestral, semestral, anual).
   * @param {string} subscriptionData.fecha_inicio - Start date.
   * @param {string} [subscriptionData.fecha_fin] - End date.
   * @param {string} [subscriptionData.fecha_proximo_pago] - Next payment date.
   * @returns {Promise<object>} A promise that resolves to the newly created subscription object.
   * @throws {Error} If the API request fails.
   */
  createSubscription: async (businessId, subscriptionData) => {
    const response = await api.post(`/businesses/${businessId}/subscriptions`, subscriptionData);
    return response.data;
  },

  /**
   * Updates an existing subscription for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} subscriptionId - The ID of the subscription to update.
   * @param {object} subscriptionData - Updated subscription data.
   * @returns {Promise<object>} A promise that resolves to the updated subscription object.
   * @throws {Error} If the API request fails.
   */
  updateSubscription: async (businessId, subscriptionId, subscriptionData) => {
    const response = await api.put(`/businesses/${businessId}/subscriptions/${subscriptionId}`, subscriptionData);
    return response.data;
  },

  /**
   * Updates the status of a subscription.
   * @param {string} businessId - The ID of the business.
   * @param {string} subscriptionId - The ID of the subscription to update.
   * @param {string} estado - New status (activa, pausada, cancelada, vencida).
   * @returns {Promise<object>} A promise that resolves to the updated subscription object.
   * @throws {Error} If the API request fails.
   */
  updateSubscriptionStatus: async (businessId, subscriptionId, estado) => {
    const response = await api.patch(`/businesses/${businessId}/subscriptions/${subscriptionId}/estado`, null, {
      params: { estado }
    });
    return response.data;
  },

  /**
   * Deletes a subscription for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} subscriptionId - The ID of the subscription to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  deleteSubscription: async (businessId, subscriptionId) => {
    const response = await api.delete(`/businesses/${businessId}/subscriptions/${subscriptionId}`);
    return response.data;
  },
};

/**
 * @namespace clientAPI
 * @description Contains functions for managing client data (alias for customerAPI for consistency).
 */
export const clientAPI = {
  /**
   * Fetches clients from the API for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} [params] - Optional parameters for filtering clients.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of client objects.
   * @throws {Error} If the API request fails.
   */
  getClients: async (businessId, params) => {
    return customerAPI.getCustomers(businessId, params);
  },

  /**
   * Fetches a single client by their ID for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} clientId - The ID of the client to fetch.
   * @returns {Promise<object>} A promise that resolves to the client object.
   * @throws {Error} If the API request fails or the client is not found.
   */
  getClientById: async (businessId, clientId) => {
    return customerAPI.getCustomerById(businessId, clientId);
  },

  /**
   * Creates a new client for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {object} clientData - Data for the new client.
   * @returns {Promise<object>} A promise that resolves to the newly created client object.
   * @throws {Error} If the API request fails.
   */
  createClient: async (businessId, clientData) => {
    return customerAPI.createCustomer(businessId, clientData);
  },

  /**
   * Updates an existing client for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} clientId - The ID of the client to update.
   * @param {object} clientData - Updated client data.
   * @returns {Promise<object>} A promise that resolves to the updated client object.
   * @throws {Error} If the API request fails.
   */
  updateClient: async (businessId, clientId, clientData) => {
    return customerAPI.updateCustomer(businessId, clientId, clientData);
  },

  /**
   * Deletes a client for a specific business.
   * @param {string} businessId - The ID of the business.
   * @param {string} clientId - The ID of the client to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  deleteClient: async (businessId, clientId) => {
    return customerAPI.deleteCustomer(businessId, clientId);
  },
};

/**
 * @namespace businessAPI
 * @description Contains functions for managing business data.
 */
export const businessAPI = {
  /**
   * Creates a new business.
   * @param {object} businessData - Data for the new business.
   * @param {string} businessData.nombre - Business name.
   * @returns {Promise<object>} A promise that resolves to the newly created business object.
   * @throws {Error} If the API request fails.
   */
  createBusiness: async (businessData) => {
    const response = await api.post('/businesses/', businessData);
    return response.data;
  },

  /**
   * Fetches businesses associated with the current user.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of business objects.
   * @throws {Error} If the API request fails.
   */
  getBusinesses: async () => {
    const response = await api.get('/businesses/');
    return response.data;
  },

  /**
   * Fetches a single business by ID.
   * @param {string} businessId - The ID of the business to fetch.
   * @returns {Promise<object>} A promise that resolves to the business object.
   * @throws {Error} If the API request fails or the business is not found.
   */
  getBusinessById: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}`);
    return response.data;
  },

  /**
   * Deletes a business and all its related data.
   * @param {string} businessId - The ID of the business to delete.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails or the user doesn't have permission.
   */
  deleteBusiness: async (businessId) => {
    const response = await api.delete(`/businesses/${businessId}`);
    return response.data;
  },

  /**
   * Obtiene notificaciones para el centro de notificaciones de un negocio.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of notification objects.
   * @throws {Error} If the API request fails.
   */
  getNotifications: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/notificaciones`);
    return response.data;
  },

  /**
   * Lista usuarios pendientes de aprobación para un negocio.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of pending users.
   * @throws {Error} If the API request fails.
   */
  getPendingUsers: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/usuarios-pendientes`);
    return response.data;
  },

  /**
   * Aprueba un usuario pendiente.
   * @param {string} businessId - The ID of the business.
   * @param {string} userBusinessId - The ID of the user-business relationship.
   * @param {object} permissions - Permissions to assign to the user.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  approveUser: async (businessId, userBusinessId, permissions) => {
    const response = await api.post(`/businesses/${businessId}/usuarios-pendientes/${userBusinessId}/aprobar`, permissions);
    return response.data;
  },

  /**
   * Rechaza un usuario pendiente.
   * @param {string} businessId - The ID of the business.
   * @param {string} userBusinessId - The ID of the user-business relationship.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  rejectUser: async (businessId, userBusinessId) => {
    const response = await api.post(`/businesses/${businessId}/usuarios-pendientes/${userBusinessId}/rechazar`);
    return response.data;
  },

  /**
   * Obtiene todos los usuarios asociados a un negocio.
   * @param {string} businessId - The ID of the business.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of users with their permissions.
   * @throws {Error} If the API request fails.
   */
  getBusinessUsers: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}/usuarios`);
    return response.data;
  },

  /**
   * Actualiza los permisos de un usuario.
   * @param {string} businessId - The ID of the business.
   * @param {string} userBusinessId - The ID of the user-business relationship.
   * @param {object} permissions - New permissions to assign.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  updateUserPermissions: async (businessId, userBusinessId, permissions) => {
    const response = await api.put(`/businesses/${businessId}/usuarios/${userBusinessId}/permisos`, permissions);
    return response.data;
  },

  /**
   * Remueve un usuario del negocio.
   * @param {string} businessId - The ID of the business.
   * @param {string} userBusinessId - The ID of the user-business relationship.
   * @returns {Promise<object>} A promise that resolves to a confirmation message.
   * @throws {Error} If the API request fails.
   */
  removeUser: async (businessId, userBusinessId) => {
    const response = await api.delete(`/businesses/${businessId}/usuarios/${userBusinessId}`);
    return response.data;
  }
};

export const publicBusinessAPI = {
  buscarNegocios: async ({ nombre = '', id = '' }) => {
    const params = [];
    if (nombre) params.push(`nombre=${encodeURIComponent(nombre)}`);
    if (id) params.push(`id=${encodeURIComponent(id)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    const response = await api.get(`/businesses/public/buscar-negocios${query}`);
    return response.data;
  },
};

export default api; 