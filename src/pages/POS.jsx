import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI, customerAPI, salesAPI } from '../utils/api'; // Import salesAPI

/**
 * @typedef {object} ProductInPOS
 * @property {string|number} id_producto - The unique identifier for the product.
 * @property {string} nombre - The name of the product.
 * @property {number} precio - The selling price of the product.
 * @property {number} stock - The current available stock of the product.
 * @property {string|number} id_categoria - The ID of the category this product belongs to.
 * @property {string} [descripcion] - Optional description of the product.
 */

/**
 * @typedef {object} CustomerInPOS
 * @property {string|number} id_cliente - The unique identifier for the customer.
 * @property {string} nombre - The customer's full name.
 * @property {string} email - The customer's email address.
 */

/**
 * @typedef {object} CartItem
 * @property {string|number} id_producto - The ID of the product in the cart.
 * @property {string} nombre - The name of the product.
 * @property {number} precio_at_sale - The price of the product at the time it was added to the cart.
 * @property {number} quantity - The quantity of this product in the cart.
 * @property {number} stock_original - The original stock of the product when it was first added or fetched, used for validation.
 * @property {number} item_total - The total price for this cart item (quantity * precio_at_sale).
 */


/**
 * Point of Sale (POS) component.
 * This component provides an interface for creating sales transactions. It allows users to:
 * - View and search available products.
 * - Add products to a shopping cart.
 * - Manage quantities of items in the cart.
 * - Select a customer for the sale (optional).
 * - Calculate the total sale amount.
 * - Finalize and record the sale.
 * It interacts with product, customer, and sales APIs to fetch data and submit sales.
 */
function POS() {
  const { businessId } = useParams();

  /** @type {[Array<ProductInPOS>, function]} allProducts - State for storing all products fetched from the API. */
  const [allProducts, setAllProducts] = useState([]);
  /** @type {[Array<ProductInPOS>, function]} availableProducts - State for products currently displayed to the user, potentially filtered by search. */
  const [availableProducts, setAvailableProducts] = useState([]);
  /** @type {[Array<CartItem>, function]} cart - State representing the current shopping cart, an array of CartItem objects. */
  const [cart, setCart] = useState([]);
  /** @type {[Array<CustomerInPOS>, function]} customers - State for the list of customers available for selection. */
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

  /**
   * Fetches initial data required for the POS system, including all products
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
    fetchInitialData();
  }, [fetchInitialData]);

  /**
   * useEffect hook to filter `availableProducts` based on `productSearchTerm`.
   * This runs whenever `productSearchTerm` or the master `allProducts` list changes.
   */
  useEffect(() => {
    if (!productSearchTerm) {
      setAvailableProducts(allProducts);
    } else {
      setAvailableProducts(
        allProducts.filter(product =>
          product.nombre.toLowerCase().includes(productSearchTerm.toLowerCase())
        )
      );
    }
  }, [productSearchTerm, allProducts]);

  /**
   * Adds a product to the cart or updates its quantity if already present.
   * Performs stock validation before adding/updating.
   * @param {ProductInPOS} product - The product object to add to the cart.
   * @param {number} [quantity=1] - The quantity of the product to add. Defaults to 1.
   */
  const handleAddToCart = (product, quantity = 1) => {
    setCartError('');
    if (quantity <= 0) return;

    const existingCartItem = cart.find(item => item.id_producto === product.id_producto);
    const availableStock = product.stock - (existingCartItem?.quantity || 0);

    if (quantity > availableStock) {
      setCartError(`Cannot add ${quantity} ${product.nombre}(s). Only ${availableStock + (existingCartItem?.quantity || 0)} available in stock (already ${existingCartItem?.quantity || 0} in cart).`);
      return;
    }

    if (existingCartItem) {
      setCart(cart.map(item =>
        item.id_producto === product.id_producto
          ? { ...item, quantity: item.quantity + quantity, item_total: (item.quantity + quantity) * item.precio_at_sale }
          : item
      ));
    } else {
      setCart([...cart, {
        id_producto: product.id_producto,
        nombre: product.nombre,
        precio_at_sale: parseFloat(product.precio), // Assuming product.precio is the sale price
        quantity: quantity,
        stock_original: product.stock, // Store original stock for validation
        item_total: quantity * parseFloat(product.precio),
      }]);
    }
  };

  /**
   * Updates the quantity of an item in the cart.
   * Performs stock validation. If the new quantity is 0, the item is removed.
   * @param {string|number} productId - The ID of the product in the cart to update.
   * @param {number} newQuantity - The new quantity for the item.
   */
  const handleUpdateCartQuantity = (productId, newQuantity) => {
    setCartError('');
    const itemToUpdate = cart.find(item => item.id_producto === productId);
    if (!itemToUpdate) return;

    const productInAll = allProducts.find(p => p.id_producto === productId);
    if (!productInAll) {
        setCartError(`Product details not found for ID ${productId}. Please refresh.`);
        return;
    }

    if (newQuantity < 0) return; // Cannot have negative quantity

    if (newQuantity === 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    if (newQuantity > productInAll.stock) {
      setCartError(`Cannot set quantity to ${newQuantity}. Only ${productInAll.stock} available in stock.`);
      return;
    }

    setCart(cart.map(item =>
      item.id_producto === productId
        ? { ...item, quantity: newQuantity, item_total: newQuantity * item.precio_at_sale }
        : item
    ));
  };

  /**
   * Removes an item completely from the cart.
   * @param {string|number} productId - The ID of the product to remove from the cart.
   */
  const handleRemoveFromCart = (productId) => {
    setCartError('');
    setCart(cart.filter(item => item.id_producto !== productId));
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
      setError('Cannot complete sale with an empty cart.');
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
      id_cliente: selectedCustomer ? parseInt(selectedCustomer, 10) : null,
      items: cart.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.quantity,
        precio_venta: item.precio_at_sale, // Ensure this is the price per unit
      })),
      monto_total: cartTotal,
    };

    try {
      const response = await salesAPI.recordSale(businessId, saleData);
      setSaleSuccessMessage(response.message || 'Sale recorded successfully!');
      setCart([]);
      setSelectedCustomer('');
      setProductSearchTerm('');
      // Re-fetch products to update stock, and customers just in case.
      // This is a simple way to reflect stock changes.
      await fetchInitialData(); 
    } catch (err) {
      console.error('Error recording sale:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to record sale.');
    } finally {
      setSubmittingSale(false);
    }
  };

  return (
    <div className="container-fluid mt-4"> {/* Use container-fluid for more space */}
      <h1>Point of Sale</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {cartError && <div className="alert alert-warning">{cartError}</div>}
      {saleSuccessMessage && <div className="alert alert-success">{saleSuccessMessage}</div>}

      <div className="row">
        {/* Product Selection Area (Left Side) */}
        <div className="col-lg-7 col-md-6 mb-3">
          <div className="card">
            <div className="card-header">
              <h3>Products</h3>
            </div>
            <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search products by name..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
              />
              {loadingProducts && <p>Loading products...</p>}
              {!loadingProducts && availableProducts.length === 0 && (
                <p>{productSearchTerm ? 'No products match your search.' : 'No products available.'}</p>
              )}
              <div className="list-group">
                {availableProducts.map(product => (
                  <div key={product.id_producto} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{product.nombre}</h5>
                      <p className="mb-1">Price: ${Number(product.precio).toFixed(2)} - Stock: {product.stock}</p>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleAddToCart(product, 1)} 
                      disabled={product.stock <= (cart.find(item => item.id_producto === product.id_producto)?.quantity || 0) || product.stock === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cart/Sale Summary Area (Right Side) */}
        <div className="col-lg-5 col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Current Sale</h3>
            </div>
            <div className="card-body">
              {loadingCustomers && <p>Loading customers...</p>}
              {!loadingCustomers && customers.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="customerSelect" className="form-label">Select Customer (Optional)</label>
                  <select 
                    id="customerSelect" 
                    className="form-select"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Walk-in / No Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.nombre} {customer.apellido} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {cart.length === 0 ? (
                <p>Cart is empty.</p>
              ) : (
                <ul className="list-group mb-3">
                  {cart.map(item => (
                    <li key={item.id_producto} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{item.nombre} (${Number(item.precio_at_sale).toFixed(2)} ea.)</span>
                        <span>Item Total: ${Number(item.item_total).toFixed(2)}</span>
                      </div>
                      <div className="d-flex align-items-center mt-2">
                        <button 
                            className="btn btn-outline-secondary btn-sm me-2" 
                            onClick={() => handleUpdateCartQuantity(item.id_producto, item.quantity - 1)}
                            disabled={item.quantity <= 1 && submittingSale} // Disable if qty is 1, or allow removal
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center" 
                          style={{width: '60px'}}
                          value={item.quantity} 
                          onChange={(e) => handleUpdateCartQuantity(item.id_producto, parseInt(e.target.value, 10) || 0)}
                          min="0"
                          max={item.stock_original} // Max is original stock
                          disabled={submittingSale}
                        />
                        <button 
                            className="btn btn-outline-secondary btn-sm ms-2" 
                            onClick={() => handleUpdateCartQuantity(item.id_producto, item.quantity + 1)}
                            disabled={item.quantity >= item.stock_original || submittingSale}
                        >
                          +
                        </button>
                        <button 
                            className="btn btn-danger btn-sm ms-auto" 
                            onClick={() => handleRemoveFromCart(item.id_producto)}
                            disabled={submittingSale}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <h4>Total: ${Number(cartTotal).toFixed(2)}</h4>
              
              <button 
                className="btn btn-success w-100 mt-3" 
                disabled={cart.length === 0 || submittingSale || loadingProducts || loadingCustomers}
                onClick={handleCompleteSale}
              >
                {submittingSale ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;
