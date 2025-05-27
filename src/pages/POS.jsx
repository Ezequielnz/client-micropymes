import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { productAPI, customerAPI, salesAPI } from '../utils/api'; // Import salesAPI

function POS() {
  const [allProducts, setAllProducts] = useState([]); // All fetched products
  const [availableProducts, setAvailableProducts] = useState([]); // Products filtered by search
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submittingSale, setSubmittingSale] = useState(false);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState(''); // For cart-specific errors like stock issues
  const [saleSuccessMessage, setSaleSuccessMessage] = useState(''); // For success message

  // Fetch initial data (products and customers)
  const fetchInitialData = useCallback(async () => {
    setLoadingProducts(true);
    setLoadingCustomers(true);
    setError(''); // Clear general errors
    setSaleSuccessMessage(''); // Clear previous success messages
    // cartError is managed per operation
    try {
      const [productsData, customersData] = await Promise.all([
        productAPI.getProducts(),
        customerAPI.getCustomers(),
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
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Product search/filter logic
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

  const handleRemoveFromCart = (productId) => {
    setCartError('');
    setCart(cart.filter(item => item.id_producto !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.item_total, 0);
  }, [cart]);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('Cannot complete sale with an empty cart.');
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
      const response = await salesAPI.recordSale(saleData);
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
                      <option key={customer.id_cliente} value={customer.id_cliente}>
                        {customer.nombre} ({customer.email})
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
