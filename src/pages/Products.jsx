import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../utils/api';

/**
 * @typedef {object} Product
 * @property {string|number} id_producto - The unique identifier for the product.
 * @property {string} nombre - The name of the product.
 * @property {string} [descripcion] - The description of the product.
 * @property {number} precio - The price of the product.
 * @property {number} stock - The current stock quantity of the product.
 * @property {string|number} id_categoria - The ID of the category this product belongs to.
 */

/**
 * @typedef {object} Category
 * @property {string|number} id_categoria - The unique identifier for the category.
 * @property {string} nombre - The name of the category.
 */

/**
 * @typedef {object} FormDataProduct
 * @property {string} nombre - Name of the product.
 * @property {string} descripcion - Description of the product.
 * @property {string} precio - Price of the product (as string, will be parsed).
 * @property {string} stock - Stock quantity of the product (as string, will be parsed).
 * @property {string} id_categoria - Selected category ID for the product.
 */


const initialFormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  id_categoria: '', // This will hold the selected category ID
};

const LOW_STOCK_THRESHOLD = 10; // Define the threshold

/**
 * Products component for managing inventory.
 * Allows users to view, add, edit, delete, and filter products.
 * Also supports importing products from an Excel file and displays low stock alerts.
 */
function Products() {
  const { businessId } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  // State for product form
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
  });

  const fetchProducts = useCallback(async (categoryId = selectedCategory) => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      // Pass businessId to the productAPI call
      const data = await productAPI.getProducts(businessId, params);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching products';
      if (err.response?.status === 403) {
        setError('You do not have permission to view products for this business.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedCategory]); // Add businessId and selectedCategory to dependency array

  const fetchCategories = useCallback(async () => {
    if (!businessId) {
      // Error for missing businessId will be handled by fetchProducts or elsewhere
      return;
    }
    try {
      // Pass businessId to categoryAPI call
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Optionally set an error specifically for categories if needed
    }
  }, [businessId]); // Add businessId to dependency array

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // fetchProducts will be called by the useEffect watching selectedCategory
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!businessId) {
      setFormError('Business ID is missing.');
      return;
    }
    if (!productForm.nombre || !productForm.precio || !productForm.stock || !productForm.categoria_id) {
      setFormError('Please fill all required fields: Name, Price, Stock, and Category.');
      return;
    }

    setLoading(true);
    try {
      const productData = { 
        nombre: productForm.nombre.trim(), 
        descripcion: productForm.descripcion.trim(), 
        precio: parseFloat(productForm.precio), 
        stock: parseInt(productForm.stock, 10), 
        categoria_id: productForm.categoria_id 
      };

      if (isEditing && currentProduct) {
        // Update existing product - Pass businessId and productId
        await productAPI.updateProduct(businessId, currentProduct.id, productData);
      } else {
        // Create new product - Pass businessId
        await productAPI.createProduct(businessId, productData);
      }

      // Reset form and refresh products
      setProductForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '' });
      setIsEditing(false);
      setCurrentProduct(null);
      await fetchProducts();

    } catch (err) {
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating product' : 'Error creating product');
      if (err.response?.status === 403) {
        setFormError('You do not have permission to edit products for this business.');
      } else {
        setFormError(specificError);
      }
      console.error(isEditing ? 'Error updating product:' : 'Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      categoria_id: product.categoria_id,
    });
    setFormError('');
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      if (!businessId) {
        setError('Business ID is missing.');
        return;
      }
      setLoading(true);
      try {
        // Pass businessId and productId
        await productAPI.deleteProduct(businessId, productId);
        await fetchProducts(); // Refresh list
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Error deleting product';
        if (err.response?.status === 403) {
          setError('You do not have permission to delete products for this business.');
        } else {
          setError(errorMessage);
        }
        console.error('Error deleting product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setProductForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '' });
    setFormError('');
  };

  return (
    <div className="container mt-4">
      <h1>Product Management {businessId && `for Business ID: ${businessId}`}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Category Filter */}
      <div className="mb-3">
        <label htmlFor="categoryFilter" className="form-label">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="form-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.nombre}</option>
          ))}
        </select>
      </div>

      {/* Form for Adding/Editing Products */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h5>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productName" className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                id="productName"
                name="nombre"
                value={productForm.nombre}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="productDescription" className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                id="productDescription"
                name="descripcion"
                value={productForm.descripcion}
                onChange={handleFormChange}
              />
            </div>
            <div className="row">
              <div className="col mb-3">
                <label htmlFor="productPrice" className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  id="productPrice"
                  name="precio"
                  value={productForm.precio}
                  onChange={handleFormChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="col mb-3">
                <label htmlFor="productStock" className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  id="productStock"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleFormChange}
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="productCategory" className="form-label">Category</label>
              <select
                id="productCategory"
                className="form-select"
                name="categoria_id"
                value={productForm.categoria_id}
                onChange={handleFormChange}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.nombre}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary me-2" disabled={loading || !businessId}>
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={loading}>
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Display Products */}
      {loading && !products.length && <p>Loading products...</p>}
      {!loading && !error && products.length === 0 && <p>No products found for this business{selectedCategory && ' in the selected category'}. Add one above!</p>}

      {products.length > 0 && (
        <div className="card">
          <div className="card-header">
            Existing Products
          </div>
          <ul className="list-group list-group-flush">
            {products.map(product => (
              <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {product.nombre} - ${product.precio} (Stock: {product.stock})
                  {product.descripcion && <small className="text-muted ms-2">{product.descripcion}</small>}
                  {/* Display category name? Might require fetching categories and mapping */}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEdit(product)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(product.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Products;
