import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, customerAPI, salesAPI, serviceAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import {
  Package,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Users,
  CreditCard,
  DollarSign,
  Search,
  ArrowLeft,
  Building2,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Menu,
  X,
  Wrench
} from 'lucide-react';

// Componente Button reutilizable
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

// Componente Card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

// Componente Alert
const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * @typedef {object} ProductInPOS
 * @property {string} id - The unique identifier for the product.
 * @property {string} nombre - The name of the product.
 * @property {number} precio_venta - The selling price of the product.
 * @property {number} stock_actual - The current available stock of the product.
 * @property {string} categoria_id - The ID of the category this product belongs to.
 * @property {string} [descripcion] - Optional description of the product.
 */

/**
 * @typedef {object} CustomerInPOS
 * @property {string} id - The unique identifier for the customer.
 * @property {string} nombre - The customer's first name.
 * @property {string} apellido - The customer's last name.
 * @property {string} email - The customer's email address.
 */

/**
 * @typedef {object} CartItem
 * @property {string} producto_id - The ID of the product in the cart.
 * @property {string} nombre - The name of the product.
 * @property {number} precio_at_sale - The price of the product at the time it was added to the cart.
 * @property {number} quantity - The quantity of this product in the cart.
 * @property {number} stock_original - The original stock of the product when it was first added or fetched, used for validation.
 * @property {number} item_total - The total price for this cart item (quantity * precio_at_sale).
 */

/**
 * Point of Sale (POS) component with modern design.
 */
function POS() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /** @type {[Array<ProductInPOS>, function]} allProducts - State for storing all products fetched from the API. */
  const [allProducts, setAllProducts] = useState([]);
  /** @type {[Array<ServiceInPOS>, function]} allServices - State for storing all services fetched from the API. */
  const [allServices, setAllServices] = useState([]);
  /** @type {[Array<ProductInPOS>, function]} availableProducts - State for products currently displayed to the user, potentially filtered by search. */
  const [availableProducts, setAvailableProducts] = useState([]);
  /** @type {[Array<ServiceInPOS>, function]} availableServices - State for services currently displayed to the user, potentially filtered by search. */
  const [availableServices, setAvailableServices] = useState([]);
  /** @type {[Array<CartItem>, function]} cart - State representing the current shopping cart, an array of CartItem objects. */
  const [cart, setCart] = useState([]);
  /** @type {[Array<CustomerInPOS>, function]} customers - State for the list of customers available for selection. */
  const [customers, setCustomers] = useState([]);
  /** @type {[string, function]} selectedCustomer - State for the ID of the customer selected for the current sale. Empty string if no customer is selected. */
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  /** @type {[string, function]} searchTerm - State for the search term entered by the user to filter products and services. */
  const [searchTerm, setSearchTerm] = useState('');
  /** @type {[string, function]} activeTab - State for the currently active tab (productos or servicios). */
  const [activeTab, setActiveTab] = useState('productos');
  
  /** @type {[boolean, function]} loadingProducts - State to indicate if product data is currently being fetched. */
  const [loadingProducts, setLoadingProducts] = useState(true);
  /** @type {[boolean, function]} loadingServices - State to indicate if service data is currently being fetched. */
  const [loadingServices, setLoadingServices] = useState(true);
  /** @type {[boolean, function]} loadingCustomers - State to indicate if customer data is currently being fetched. */
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  /** @type {[boolean, function]} submittingSale - State to indicate if a sale is currently being submitted to the API. */
  const [submittingSale, setSubmittingSale] = useState(false);
  /** @type {[string, function]} error - State for storing general page-level error messages (e.g., initial data load failure, sale submission failure). */
  const [error, setError] = useState('');
  /** @type {[string, function]} cartError - State for storing errors specific to cart operations (e.g., insufficient stock). */
  const [cartError, setCartError] = useState('');
  /** @type {[string, function]} saleSuccessMessage - State for displaying a success message after a sale is completed. */
  const [saleSuccessMessage, setSaleSuccessMessage] = useState('');
  /** @type {[string, function]} paymentMethod - State for the selected payment method. */
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  /**
   * Fetches initial data required for the POS system, including all products,
   * services, and a list of customers. This function is called on component mount.
   * It updates loading states and handles potential errors during data fetching.
   */
  const fetchInitialData = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoadingProducts(false);
      setLoadingServices(false);
      setLoadingCustomers(false);
      return;
    }

    setLoadingProducts(true);
    setLoadingServices(true);
    setLoadingCustomers(true);
    setError(''); // Clear general errors
    setSaleSuccessMessage(''); // Clear previous success messages
    // cartError is managed per operation
    try {
      const [productsData, servicesData, customersData] = await Promise.all([
        productAPI.getProducts(businessId),
        serviceAPI.getServices(businessId),
        customerAPI.getCustomers(businessId),
      ]);
      setAllProducts(Array.isArray(productsData) ? productsData : []);
      setAvailableProducts(Array.isArray(productsData) ? productsData : []);
      setAllServices(Array.isArray(servicesData) ? servicesData : []);
      setAvailableServices(Array.isArray(servicesData) ? servicesData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data. Please try refreshing.');
      setAllProducts([]);
      setAvailableProducts([]);
      setAllServices([]);
      setAvailableServices([]);
      setCustomers([]);
    } finally {
      setLoadingProducts(false);
      setLoadingServices(false);
      setLoadingCustomers(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /**
   * useEffect hook to filter `availableProducts` based on `searchTerm`.
   * This runs whenever `searchTerm` or the master `allProducts` list changes.
   */
  useEffect(() => {
    if (!searchTerm) {
      setAvailableProducts(allProducts);
    } else {
      setAvailableProducts(
        allProducts.filter(product =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allProducts]);

  /**
   * useEffect hook to filter `availableServices` based on `searchTerm`.
   * This runs whenever `searchTerm` or the master `allServices` list changes.
   */
  useEffect(() => {
    if (!searchTerm) {
      setAvailableServices(allServices);
    } else {
      setAvailableServices(
        allServices.filter(service =>
          service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allServices]);

  /**
   * Adds a product to the cart or updates its quantity if already present.
   * Performs stock validation before adding/updating.
   * @param {ProductInPOS} product - The product object to add to the cart.
   * @param {number} [quantity=1] - The quantity of the product to add. Defaults to 1.
   */
  const handleAddToCart = (product, quantity = 1) => {
    setCartError('');
    if (quantity <= 0) return;

    const existingCartItem = cart.find(item => item.item_id === product.id && item.tipo === 'producto');
    const availableStock = product.stock_actual - (existingCartItem?.quantity || 0);

    if (quantity > availableStock) {
      setCartError(`No se puede agregar ${quantity} ${product.nombre}(s). Solo ${availableStock + (existingCartItem?.quantity || 0)} disponible en stock.`);
      return;
    }

    if (existingCartItem) {
      setCart(cart.map(item =>
        item.item_id === product.id && item.tipo === 'producto'
          ? { ...item, quantity: item.quantity + quantity, item_total: (item.quantity + quantity) * item.precio_at_sale }
          : item
      ));
    } else {
      setCart([...cart, {
        item_id: product.id,
        tipo: 'producto',
        nombre: product.nombre,
        precio_at_sale: parseFloat(product.precio_venta),
        quantity: quantity,
        stock_original: product.stock_actual,
        item_total: quantity * parseFloat(product.precio_venta),
      }]);
    }
  };

  /**
   * Adds a service to the cart or updates its quantity if already present.
   * No stock validation needed for services.
   * @param {ServiceInPOS} service - The service object to add to the cart.
   * @param {number} [quantity=1] - The quantity of the service to add. Defaults to 1.
   */
  const handleAddServiceToCart = (service, quantity = 1) => {
    setCartError('');
    if (quantity <= 0) return;

    const existingCartItem = cart.find(item => item.item_id === service.id && item.tipo === 'servicio');

    if (existingCartItem) {
      setCart(cart.map(item =>
        item.item_id === service.id && item.tipo === 'servicio'
          ? { ...item, quantity: item.quantity + quantity, item_total: (item.quantity + quantity) * item.precio_at_sale }
          : item
      ));
    } else {
      setCart([...cart, {
        item_id: service.id,
        tipo: 'servicio',
        nombre: service.nombre,
        precio_at_sale: parseFloat(service.precio),
        quantity: quantity,
        item_total: quantity * parseFloat(service.precio),
      }]);
    }
  };

  /**
   * Updates the quantity of an item in the cart.
   * Performs stock validation for products only. If the new quantity is 0, the item is removed.
   * @param {string} itemId - The ID of the item in the cart to update.
   * @param {string} tipo - The type of the item (producto or servicio).
   * @param {number} newQuantity - The new quantity for the item.
   */
  const handleUpdateCartQuantity = (itemId, tipo, newQuantity) => {
    setCartError('');
    const itemToUpdate = cart.find(item => item.item_id === itemId && item.tipo === tipo);
    if (!itemToUpdate) return;

    if (newQuantity < 0) return; // Cannot have negative quantity

    if (newQuantity === 0) {
      handleRemoveFromCart(itemId, tipo);
      return;
    }

    // Only validate stock for products, not services
    if (itemToUpdate.tipo === 'producto') {
      const productInAll = allProducts.find(p => p.id === itemId);
      if (!productInAll) {
        setCartError(`Detalles del producto no encontrados para ID ${itemId}. Por favor actualiza.`);
        return;
      }
      
      if (newQuantity > productInAll.stock_actual) {
        setCartError(`No se puede establecer cantidad a ${newQuantity}. Solo ${productInAll.stock_actual} disponible en stock.`);
        return;
      }
    }

    setCart(cart.map(item =>
      item.item_id === itemId && item.tipo === tipo
        ? { ...item, quantity: newQuantity, item_total: newQuantity * item.precio_at_sale }
        : item
    ));
  };

  /**
   * Removes an item completely from the cart.
   * @param {string} itemId - The ID of the item to remove from the cart.
   * @param {string} tipo - The type of the item (producto or servicio).
   */
  const handleRemoveFromCart = (itemId, tipo = null) => {
    setCartError('');
    if (tipo) {
      setCart(cart.filter(item => !(item.item_id === itemId && item.tipo === tipo)));
    } else {
      // Fallback for backward compatibility
      setCart(cart.filter(item => item.item_id !== itemId));
    }
  };

  /**
   * Calculates the total amount for the current cart.
   * @type {number}
   */
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.item_total, 0);
  }, [cart]);

  /**
   * Handles the completion of the sale.
   * Constructs the sale data object and submits it to the `salesAPI.recordSale`.
   * On success, it clears the cart, resets selected customer and search terms,
   * displays a success message, and re-fetches initial data (to update stock levels).
   * On failure, it displays an error message.
   */
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('No se puede completar una venta con carrito vacío.');
      return;
    }
    if (!businessId) {
      setError('Business ID is missing.');
      return;
    }
    setSubmittingSale(true);
    setError('');
    setSaleSuccessMessage('');
    setCartError('');

    const saleData = {
      cliente_id: selectedCustomer,
      metodo_pago: paymentMethod,
      observaciones: null,
      items: cart.map(item => ({
        id: item.item_id,
        tipo: item.tipo,
        cantidad: item.quantity,
        precio: item.precio_at_sale
      }))
    };

    try {
      const response = await salesAPI.recordSale(saleData);
      setSaleSuccessMessage('¡Venta registrada exitosamente!');
      setCart([]);
      setSelectedCustomer('');
      setSearchTerm('');
      // Re-fetch products to update stock, and customers just in case.
      // This is a simple way to reflect stock changes.
      await fetchInitialData(); 
    } catch (err) {
      console.error('Error recording sale:', err);
      setError(err.response?.data?.detail || err.message || 'Error al registrar la venta.');
    } finally {
      setSubmittingSale(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BizFlow Pro
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/home')}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}`)}
                  className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/sales-reports`)}
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Reportes
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/home')}
                  className="w-full text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}`)}
                  className="w-full text-gray-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/sales-reports`)}
                  className="w-full text-gray-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Reportes
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Punto de Venta
                </h1>
                <p className="text-lg text-gray-600">
                  Sistema de ventas para mostrador
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <ShoppingCart className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {cart.length} items en carrito
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </Alert>
            )}
            
            {cartError && (
              <Alert variant="warning" className="mb-6">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {cartError}
              </Alert>
            )}
            
            {saleSuccessMessage && (
              <Alert variant="success" className="mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                {saleSuccessMessage}
              </Alert>
            )}
          </div>

          {/* Main POS Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products and Services Section - Left Side */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {activeTab === 'productos' ? (
                        <>
                          <Package className="h-5 w-5 text-blue-600" />
                          Productos Disponibles
                        </>
                      ) : (
                        <>
                          <Wrench className="h-5 w-5 text-purple-600" />
                          Servicios Disponibles
                        </>
                      )}
                    </CardTitle>
                    
                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('productos')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'productos'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Package className="h-4 w-4 mr-2 inline" />
                        Productos
                      </button>
                      <button
                        onClick={() => setActiveTab('servicios')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'servicios'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Wrench className="h-4 w-4 mr-2 inline" />
                        Servicios
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={activeTab === 'productos' ? "Buscar productos por nombre..." : "Buscar servicios por nombre..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Products/Services Grid */}
                  <div className="max-h-96 overflow-y-auto">
                    {activeTab === 'productos' ? (
                      <>
                        {loadingProducts && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Cargando productos...</span>
                          </div>
                        )}
                        
                        {!loadingProducts && availableProducts.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos disponibles.'}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableProducts.map(product => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">{product.nombre}</h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Stock: {product.stock_actual} unidades
                                  </p>
                                  <p className="text-lg font-bold text-blue-600">
                                    ${Number(product.precio_venta).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                onClick={() => handleAddToCart(product, 1)} 
                                disabled={product.stock_actual <= (cart.find(item => item.item_id === product.id && item.tipo === 'producto')?.quantity || 0) || product.stock_actual === 0}
                                className="w-full"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar al Carrito
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {loadingServices && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <span className="ml-2 text-gray-600">Cargando servicios...</span>
                          </div>
                        )}
                        
                        {!loadingServices && availableServices.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No se encontraron servicios que coincidan con tu búsqueda.' : 'No hay servicios disponibles.'}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableServices.map(service => (
                            <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">{service.nombre}</h3>
                                  {service.descripcion && (
                                    <p className="text-sm text-gray-600 mb-2">{service.descripcion}</p>
                                  )}
                                  {service.duracion_minutos && (
                                    <p className="text-sm text-gray-500 mb-2">
                                      Duración: {service.duracion_minutos} min
                                    </p>
                                  )}
                                  <p className="text-lg font-bold text-purple-600">
                                    ${Number(service.precio).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                onClick={() => handleAddServiceToCart(service, 1)} 
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar al Carrito
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Section - Right Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    Venta Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Customer Selection */}
                  {!loadingCustomers && customers.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cliente (Opcional)
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                      >
                        <option value="" className="text-gray-900">Cliente ocasional</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id} className="text-gray-900">
                            {customer.nombre} {customer.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={submittingSale}
                    >
                      <option value="efectivo" className="text-gray-900">💵 Efectivo</option>
                      <option value="tarjeta" className="text-gray-900">💳 Tarjeta</option>
                      <option value="transferencia" className="text-gray-900">🏦 Transferencia</option>
                    </select>
                  </div>

                  {/* Cart Items */}
                  <div className="mb-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>El carrito está vacío</p>
                        <p className="text-sm">Agrega productos o servicios para comenzar</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cart.map(item => (
                          <div key={`${item.item_id}-${item.tipo}`} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.tipo === 'producto' ? (
                                    <Package className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Wrench className="h-4 w-4 text-purple-600" />
                                  )}
                                  <h4 className="font-medium text-gray-900 text-sm">{item.nombre}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.tipo === 'producto' 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  ${Number(item.precio_at_sale).toFixed(2)} c/u
                                </p>
                              </div>
                              <p className="font-semibold text-blue-600">
                                ${Number(item.item_total).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateCartQuantity(item.item_id, item.tipo, item.quantity - 1)}
                                  disabled={submittingSale}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateCartQuantity(item.item_id, item.tipo, item.quantity + 1)}
                                  disabled={item.tipo === 'producto' && item.quantity >= item.stock_original || submittingSale}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFromCart(item.item_id, item.tipo)}
                                disabled={submittingSale}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${Number(cartTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Complete Sale Button */}
                  <Button 
                    onClick={handleCompleteSale}
                    disabled={cart.length === 0 || submittingSale || loadingProducts || loadingServices || loadingCustomers}
                    className="w-full"
                    size="lg"
                  >
                    {submittingSale ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Completar Venta
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProtectedPOS() {
  return (
    <PermissionGuard requiredModule="ventas" requiredAction="ver">
      <POS />
    </PermissionGuard>
  );
}
