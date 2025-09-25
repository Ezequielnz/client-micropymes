import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, customerAPI, salesAPI, serviceAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
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
  CheckCircle,
  AlertTriangle,
  Loader2,
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
  const { currentBusiness } = useBusinessContext();
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;

  /** @type {[Array<CartItem>, function]} cart - State representing the current shopping cart, an array of CartItem objects. */
  const [cart, setCart] = useState([]);
  /** @type {[string, function]} selectedCustomer - State for the ID of the customer selected for the current sale. Empty string if no customer is selected. */
  const [selectedCustomer, setSelectedCustomer] = useState('');
  /** @type {[boolean, function]} isCustomerModalOpen - State to control the visibility of the new customer modal. */
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  /** @type {[object, function]} newCustomer - Form state for creating a new customer. */
  const [newCustomer, setNewCustomer] = useState({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', documento_tipo: '', documento_numero: '' });
  /** @type {[string, function]} createCustomerError - Error message for creating a customer. */
  const [createCustomerError, setCreateCustomerError] = useState('');
  
  /** @type {[string, function]} searchTerm - State for the search term entered by the user to filter products and services. */
  const [searchTerm, setSearchTerm] = useState('');
  /** @type {[string, function]} activeTab - State for the currently active tab (productos or servicios). */
  const [activeTab, setActiveTab] = useState('productos');
  
  /** @type {[string, function]} error - State for storing general page-level error messages (e.g., initial data load failure, sale submission failure). */
  const [error, setError] = useState('');
  /** @type {[string, function]} cartError - State for storing errors specific to cart operations (e.g., insufficient stock). */
  const [cartError, setCartError] = useState('');
  /** @type {[string, function]} saleSuccessMessage - State for displaying a success message after a sale is completed. */
  const [saleSuccessMessage, setSaleSuccessMessage] = useState('');
  /** @type {[string, function]} paymentMethod - State for the selected payment method. */
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  // Mantener un carrito independiente por negocio usando sessionStorage
  useEffect(() => {
    // Cuando cambia el negocio, cargamos su carrito propio desde la sesión
    if (!businessId) {
      setCart([]);
      setSelectedCustomer('');
      setSearchTerm('');
      return;
    }
    try {
      const key = `pos_cart_${businessId}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed : []);
      } else {
        setCart([]);
      }
    } catch (e) {
      console.warn('No se pudo cargar el carrito de la sesión:', e);
      setCart([]);
    }
    // Limpiar mensajes transitorios al cambiar de negocio
    setError('');
    setCartError('');
    setSaleSuccessMessage('');
    setSelectedCustomer('');
    setSearchTerm('');
  }, [businessId]);

  // Guardar el carrito actual en sessionStorage bajo la clave del negocio
  useEffect(() => {
    if (!businessId) return;
    try {
      const key = `pos_cart_${businessId}`;
      sessionStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      console.warn('No se pudo guardar el carrito en la sesión:', e);
    }
  }, [cart, businessId]);

  // ✅ OPTIMIZED: React Query for products with smart caching
  const { 
    data: allProducts = [], 
    isLoading: loadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => productAPI.getProducts(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: React Query for services with smart caching
  const { 
    data: allServices = [], 
    isLoading: loadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ['services', businessId],
    queryFn: () => serviceAPI.getServices(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: React Query for customers with smart caching
  const { 
    data: customers = [], 
    isLoading: loadingCustomers,
    error: customersError
  } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: () => customerAPI.getCustomers(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 5 * 60 * 1000, // 5 minutes (less dynamic)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: Record sale mutation
  const recordSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await salesAPI.recordSale(saleData);
    },
    onSuccess: () => {
      setSaleSuccessMessage('¡Venta registrada exitosamente!');
      setCart([]);
      setSelectedCustomer('');
      setSearchTerm('');
      setError('');
      setCartError('');
      // Invalidate products to update stock levels
      queryClient.invalidateQueries(['products', businessId]);
    },
    onError: (err) => {
      console.error('Error recording sale:', err);
      setError(err.response?.data?.detail || err.message || 'Error al registrar la venta.');
      setSaleSuccessMessage('');
    }
  });

  // ✅ Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await customerAPI.createCustomer(businessId, customerData);
    },
    onSuccess: (created) => {
      setSelectedCustomer(created.id);
      queryClient.invalidateQueries(['customers', businessId]);
      setIsCustomerModalOpen(false);
      setNewCustomer({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', documento_tipo: '', documento_numero: '' });
      setCreateCustomerError('');
    },
    onError: (err) => {
      console.error('Error creating customer:', err);
      setCreateCustomerError(err.response?.data?.detail || err.message || 'Error al crear el cliente.');
    }
  });

  // ✅ OPTIMIZED: Memoized filtered products
  const availableProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    return allProducts.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  // ✅ OPTIMIZED: Memoized filtered services
  const availableServices = useMemo(() => {
    if (!searchTerm) return allServices;
    return allServices.filter(service =>
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allServices, searchTerm]);

  // ✅ OPTIMIZED: Memoized computed error state
  const currentError = useMemo(() => {
    if (error) return error;
    if (activeTab === 'productos' && productsError) {
      return `Error al cargar productos: ${productsError.message}`;
    }
    if (activeTab === 'servicios' && servicesError) {
      return `Error al cargar servicios: ${servicesError.message}`;
    }
    if (customersError) {
      return `Error al cargar clientes: ${customersError.message}`;
    }
    return '';
  }, [error, activeTab, productsError, servicesError, customersError]);

  // ✅ OPTIMIZED: Memoized loading state
  const isLoading = useMemo(() => {
    return loadingProducts || loadingServices || loadingCustomers || recordSaleMutation.isPending || createCustomerMutation.isPending;
  }, [loadingProducts, loadingServices, loadingCustomers, recordSaleMutation.isPending, createCustomerMutation.isPending]);

  /**
   * Adds a product to the cart or updates its quantity if already present.
   * Performs stock validation before adding/updating.
   * @param {ProductInPOS} product - The product object to add to the cart.
   * @param {number} [quantity=1] - The quantity of the product to add. Defaults to 1.
   */
  const handleAddToCart = useCallback((product, quantity = 1) => {
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
  }, [cart]);

  /**
   * Adds a service to the cart or updates its quantity if already present.
   * No stock validation needed for services.
   * @param {ServiceInPOS} service - The service object to add to the cart.
   * @param {number} [quantity=1] - The quantity of the service to add. Defaults to 1.
   */
  const handleAddServiceToCart = useCallback((service, quantity = 1) => {
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
  }, [cart]);

  /**
   * Updates the quantity of an item in the cart.
   * Performs stock validation for products only. If the new quantity is 0, the item is removed.
   * @param {string} itemId - The ID of the item in the cart to update.
   * @param {string} tipo - The type of the item (producto or servicio).
   * @param {number} newQuantity - The new quantity for the item.
   */
  const handleUpdateCartQuantity = useCallback((itemId, tipo, newQuantity) => {
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
  }, [cart, allProducts, handleRemoveFromCart]);

  /**
   * Removes an item completely from the cart.
   * @param {string} itemId - The ID of the item to remove from the cart.
   * @param {string} tipo - The type of the item (producto or servicio).
   */
  const handleRemoveFromCart = useCallback((itemId, tipo = null) => {
    setCartError('');
    if (tipo) {
      setCart(cart.filter(item => !(item.item_id === itemId && item.tipo === tipo)));
    } else {
      // Fallback for backward compatibility
      setCart(cart.filter(item => item.item_id !== itemId));
    }
  }, [cart]);

  /**
   * Calculates the total amount for the current cart.
   * @type {number}
   */
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.item_total, 0);
  }, [cart]);

  /**
   * Handles the completion of the sale.
   * Constructs the sale data object and submits it via mutation.
   */
  const handleCompleteSale = useCallback(async () => {
    if (cart.length === 0) {
      setError('No se puede completar una venta con carrito vacío.');
      return;
    }

    setError('');
    setSaleSuccessMessage('');
    setCartError('');

    const saleData = {
      cliente_id: selectedCustomer || null,
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
      await recordSaleMutation.mutateAsync(saleData);
    } catch (err) {
      // Error handling is done in the mutation onError callback
      console.error('Sale completion error:', err);
    }
  }, [cart, selectedCustomer, paymentMethod, recordSaleMutation]);

  const handleOpenNewCustomer = useCallback(() => {
    setCreateCustomerError('');
    setIsCustomerModalOpen(true);
  }, []);

  const handleCreateCustomer = useCallback(async () => {
    setCreateCustomerError('');
    const nombre = (newCustomer.nombre || '').trim();
    const apellido = (newCustomer.apellido || '').trim();
    if (!nombre || !apellido) {
      setCreateCustomerError('Por favor, completa nombre y apellido.');
      return;
    }
    try {
      await createCustomerMutation.mutateAsync({
        nombre,
        apellido,
        email: newCustomer.email || null,
        telefono: newCustomer.telefono || null,
        direccion: newCustomer.direccion || null,
        documento_tipo: newCustomer.documento_tipo || null,
        documento_numero: newCustomer.documento_numero || null,
      });
    } catch {
      // Error handling is done in the mutation onError callback
    }
  }, [newCustomer, createCustomerMutation]);

  // ✅ OPTIMIZED: Early return for missing business
  if (!currentBusiness) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 min-w-0">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                Punto de Venta
              </h1>
              <p className="text-gray-600">
                Sistema de ventas para mostrador
              </p>
            </div>
          </div>
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            No hay negocio seleccionado. Por favor selecciona un negocio desde el menú superior.
          </Alert>
        </div>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => !createCustomerMutation.isPending && setIsCustomerModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto z-10">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Cliente</h3>
                {createCustomerError && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {createCustomerError}
                  </Alert>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newCustomer.nombre}
                      onChange={(e) => setNewCustomer({ ...newCustomer, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre"
                      required
                      disabled={createCustomerMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      value={newCustomer.apellido}
                      onChange={(e) => setNewCustomer({ ...newCustomer, apellido: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Apellido"
                      required
                      disabled={createCustomerMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                      disabled={createCustomerMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={newCustomer.telefono}
                      onChange={(e) => setNewCustomer({ ...newCustomer, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+54 9 ..."
                      disabled={createCustomerMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      value={newCustomer.direccion}
                      onChange={(e) => setNewCustomer({ ...newCustomer, direccion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle 123"
                      disabled={createCustomerMutation.isPending}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doc. Tipo</label>
                      <input
                        type="text"
                        value={newCustomer.documento_tipo}
                        onChange={(e) => setNewCustomer({ ...newCustomer, documento_tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="DNI/CUIT"
                        disabled={createCustomerMutation.isPending}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doc. Número</label>
                      <input
                        type="text"
                        value={newCustomer.documento_numero}
                        onChange={(e) => setNewCustomer({ ...newCustomer, documento_numero: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345678"
                        disabled={createCustomerMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => !createCustomerMutation.isPending && setIsCustomerModalOpen(false)}
                    disabled={createCustomerMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateCustomer}
                    disabled={createCustomerMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {createCustomerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 min-w-0">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Punto de Venta
            </h1>
            <p className="text-gray-600">
              Sistema de ventas para mostrador
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <ShoppingCart className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {cart.length} items en carrito
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {currentError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {currentError}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                <div className="flex flex-wrap bg-gray-100 rounded-lg p-1 gap-1">
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
                    disabled={isLoading}
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
                            disabled={product.stock_actual <= (cart.find(item => item.item_id === product.id && item.tipo === 'producto')?.quantity || 0) || product.stock_actual === 0 || isLoading}
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
                            disabled={isLoading}
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
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Venta Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Customer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente (Opcional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    className="w-full sm:flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    disabled={isLoading || loadingCustomers}
                  >
                    <option value="" className="text-gray-900">Cliente ocasional</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id} className="text-gray-900">
                        {customer.nombre} {customer.apellido}
                      </option>
                    ))}
                  </select>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNewCustomer}
                    disabled={isLoading}
                    className="sm:w-auto"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Nuevo cliente
                  </Button>
                </div>
                {loadingCustomers && (
                  <p className="text-sm text-gray-500 mt-2">Cargando clientes...</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isLoading}
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
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateCartQuantity(item.item_id, item.tipo, item.quantity + 1)}
                              disabled={item.tipo === 'producto' && item.quantity >= item.stock_original || isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.item_id, item.tipo)}
                            disabled={isLoading}
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
                disabled={cart.length === 0 || isLoading}
                className="w-full"
                size="lg"
              >
                {recordSaleMutation.isPending ? (
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
  );
}

export default function ProtectedPOS() {
  return (
    <Layout activeSection="pos">
      <PermissionGuard requiredModule="ventas" requiredAction="ver">
        <POS />
      </PermissionGuard>
    </Layout>
  );
}
