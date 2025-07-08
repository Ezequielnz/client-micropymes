import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, customerAPI, salesAPI, authAPI } from '../utils/api';
import { PageLoader } from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
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
  Receipt
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
 * @typedef {object} ProductInSales
 * @property {string} id - The unique identifier for the product.
 * @property {string} nombre - The name of the product.
 * @property {number} precio_venta - The selling price of the product.
 * @property {number} stock_actual - The current available stock of the product.
 * @property {string} categoria_id - The ID of the category this product belongs to.
 * @property {string} [descripcion] - Optional description of the product.
 */

/**
 * @typedef {object} CustomerInSales
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
 * Sales component with modern design for processing sales transactions.
 */
function Sales() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  /** @type {[Array<ProductInSales>, function]} allProducts - State for storing all products fetched from the API. */
  const [allProducts, setAllProducts] = useState([]);
  /** @type {[Array<ProductInSales>, function]} availableProducts - State for products currently displayed to the user, potentially filtered by search. */
  const [availableProducts, setAvailableProducts] = useState([]);
  /** @type {[Array<CartItem>, function]} cart - State representing the current shopping cart, an array of CartItem objects. */
  const [cart, setCart] = useState([]);
  /** @type {[Array<CustomerInSales>, function]} customers - State for the list of customers available for selection. */
  const [customers, setCustomers] = useState([]);
  /** @type {[string, function]} selectedCustomer - State for the ID of the customer selected for the current sale. Empty string if no customer is selected. */
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  /** @type {[string, function]} productSearchTerm - State for the search term entered by the user to filter products. */
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  /** @type {[boolean, function]} loadingProducts - State to indicate if product data is currently being fetched. */
  const [loadingProducts, setLoadingProducts] = useState(true);
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
   * Fetches initial data required for the sales system, including all products
   * and a list of customers. This function is called on component mount.
   * It updates loading states and handles potential errors during data fetching.
   */
  const fetchInitialData = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoadingProducts(false);
      setLoadingCustomers(false);
      return;
    }

    setLoadingProducts(true);
    setLoadingCustomers(true);
    setError(''); // Clear general errors
    setSaleSuccessMessage(''); // Clear previous success messages
    // cartError is managed per operation
    try {
      const [productsData, customersData] = await Promise.all([
        productAPI.getProducts(businessId),
        customerAPI.getCustomers(businessId),
      ]);
      setAllProducts(Array.isArray(productsData) ? productsData : []);
      setAvailableProducts(Array.isArray(productsData) ? productsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data. Please try refreshing.');
      setAllProducts([]);
      setAvailableProducts([]);
      setCustomers([]);
    } finally {
      setLoadingProducts(false);
      setLoadingCustomers(false);
    }
  }, [businessId]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    
    loadUserData();
    fetchInitialData();
  }, [fetchInitialData]);

  /**
   * useEffect hook to filter `availableProducts` based on `productSearchTerm`.
   * Updates the `availableProducts` state whenever the search term or the full product list changes.
   */
  useEffect(() => {
    if (productSearchTerm.trim() === '') {
      setAvailableProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product =>
        product.nombre.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(productSearchTerm.toLowerCase()))
      );
      setAvailableProducts(filtered);
    }
  }, [productSearchTerm, allProducts]);

  /**
   * Calculates the total price of all items in the cart.
   * Uses useMemo for performance optimization to avoid recalculating on every render.
   * @returns {number} The total price of all cart items.
   */
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.item_total, 0);
  }, [cart]);

  /**
   * Adds a product to the cart or increases its quantity if it's already in the cart.
   * Validates stock availability before adding.
   * @param {ProductInSales} product - The product to add to the cart.
   * @param {number} [quantity=1] - The quantity to add (defaults to 1).
   */
  const handleAddToCart = (product, quantity = 1) => {
    setCartError(''); // Clear previous cart errors

    const existingCartItem = cart.find(item => item.producto_id === product.id);
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const newTotalQuantity = currentCartQuantity + quantity;

    // Check stock availability
    if (newTotalQuantity > product.stock_actual) {
      setCartError(`Stock insuficiente para ${product.nombre}. Stock disponible: ${product.stock_actual}`);
      return;
    }

    if (existingCartItem) {
      // Update quantity of existing item
      setCart(prevCart =>
        prevCart.map(item =>
          item.producto_id === product.id
            ? {
                ...item,
                quantity: newTotalQuantity,
                item_total: newTotalQuantity * item.precio_at_sale
              }
            : item
        )
      );
    } else {
      // Add new item to cart
      const newCartItem = {
        producto_id: product.id,
        nombre: product.nombre,
        precio_at_sale: product.precio_venta,
        quantity: quantity,
        stock_original: product.stock_actual,
        item_total: quantity * product.precio_venta
      };
      setCart(prevCart => [...prevCart, newCartItem]);
    }
  };

  /**
   * Updates the quantity of a specific product in the cart.
   * Validates stock availability and removes the item if quantity becomes 0 or negative.
   * @param {string} productId - The ID of the product to update.
   * @param {number} newQuantity - The new quantity for the product.
   */
  const handleUpdateCartQuantity = (productId, newQuantity) => {
    setCartError(''); // Clear previous cart errors

    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    // Find the original product to check stock
    const originalProduct = allProducts.find(p => p.id === productId);
    if (!originalProduct) {
      setCartError('Producto no encontrado');
      return;
    }

    // Check stock availability
    if (newQuantity > originalProduct.stock_actual) {
      setCartError(`Stock insuficiente para ${originalProduct.nombre}. Stock disponible: ${originalProduct.stock_actual}`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.producto_id === productId
          ? {
              ...item,
              quantity: newQuantity,
              item_total: newQuantity * item.precio_at_sale
            }
          : item
      )
    );
  };

  /**
   * Removes a product from the cart entirely.
   * @param {string} productId - The ID of the product to remove.
   */
  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.producto_id !== productId));
    setCartError(''); // Clear cart errors when removing items
  };

  /**
   * Handles the completion of a sale by submitting the cart data to the API.
   * Validates that the cart is not empty and a payment method is selected.
   * Clears the cart and shows a success message upon successful completion.
   */
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setCartError('El carrito está vacío');
      return;
    }

    if (!paymentMethod) {
      setCartError('Seleccione un método de pago');
      return;
    }

    setSubmittingSale(true);
    setCartError('');
    setSaleSuccessMessage('');

    try {
      const saleData = {
        cliente_id: selectedCustomer,
        metodo_pago: paymentMethod,
        items: cart.map(item => ({
          id: item.producto_id,
          tipo: "producto", // Por ahora solo productos, después agregar servicios
          cantidad: item.quantity,
          precio: item.precio_at_sale
        }))
      };

      const result = await salesAPI.recordSale(saleData);
      
      // Clear cart and show success message
      setCart([]);
      setSelectedCustomer('');
      setSaleSuccessMessage(`Venta completada exitosamente. ID: ${result.id}`);
      
      // Refresh product data to update stock
      await fetchInitialData();
      
    } catch (err) {
      console.error('Error completing sale:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Error al completar la venta';
      setCartError(errorMessage);
    } finally {
      setSubmittingSale(false);
    }
  };

  if (loadingProducts || loadingCustomers) {
    return <PageLoader message="Cargando sistema de ventas..." variant="primary" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Sistema de Ventas"
        subtitle="Procesar ventas y gestionar transacciones"
        icon={Receipt}
        backPath={`/business/${businessId}`}
        userName={user?.nombre || 'Usuario'}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <div className="ml-2">{error}</div>
          </Alert>
        )}

        {/* Success Messages */}
        {saleSuccessMessage && (
          <Alert variant="success" className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <div className="ml-2">{saleSuccessMessage}</div>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Productos Disponibles
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {availableProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {productSearchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </h3>
                    <p className="text-gray-500">
                      {productSearchTerm 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Agrega productos desde la sección de gestión'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAddToCart(product)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                            {product.nombre}
                          </h3>
                          <span className="text-lg font-bold text-green-600">
                            ${product.precio_venta}
                          </span>
                        </div>
                        
                        {product.descripcion && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {product.descripcion}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock_actual}
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.stock_actual === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Carrito de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cart Error */}
                {cartError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <div className="ml-2">{cartError}</div>
                  </Alert>
                )}

                {/* Customer Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente (opcional)
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="" className="text-gray-900">Cliente anónimo</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id} className="text-gray-900">
                        {customer.nombre} {customer.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="efectivo" className="text-gray-900">Efectivo</option>
                    <option value="tarjeta" className="text-gray-900">Tarjeta</option>
                    <option value="transferencia" className="text-gray-900">Transferencia</option>
                  </select>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">El carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.producto_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.nombre}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ${item.precio_at_sale} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateCartQuantity(item.producto_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateCartQuantity(item.producto_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFromCart(item.producto_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Total */}
                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Complete Sale Button */}
                    <Button
                      onClick={handleCompleteSale}
                      disabled={submittingSale || cart.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      {submittingSale ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Completar Venta
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
