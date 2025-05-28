import React, { useState, useEffect, useCallback } from 'react';
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
  /** @type {[Array<Product>, function]} products - State for the list of all products currently displayed. */
  const [products, setProducts] = useState([]);
  /** @type {[Array<Product>, function]} lowStockProducts - State for products that are below the low stock threshold. */
  const [lowStockProducts, setLowStockProducts] = useState([]);
  /** @type {[Array<Category>, function]} categories - State for the list of available categories, used for filtering and in the product form. */
  const [categories, setCategories] = useState([]);
  
  /** @type {[boolean, function]} loadingProducts - State to indicate if products are being fetched. */
  const [loadingProducts, setLoadingProducts] = useState(true);
  /** @type {[boolean, function]} loadingCategories - State to indicate if categories are being fetched. */
  const [loadingCategories, setLoadingCategories] = useState(true);
  /** @type {[string, function]} error - State for storing general page errors (e.g., failed to load initial data, delete errors). */
  const [error, setError] = useState('');
  /** @type {[string, function]} formError - State for storing errors specific to the add/edit product form. */
  const [formError, setFormError] = useState('');
  /** @type {[string, function]} selectedCategoryIdFilter - State for the currently selected category ID used to filter the product list. Empty string means all categories. */
  const [selectedCategoryIdFilter, setSelectedCategoryIdFilter] = useState('');

  // Form states for Add/Edit Product
  /** @type {[boolean, function]} showForm - State to control the visibility of the add/edit product form. */
  const [showForm, setShowForm] = useState(false);
  /** @type {[boolean, function]} isEditing - State to determine if the form is in 'edit' mode (true) or 'add' mode (false). */
  const [isEditing, setIsEditing] = useState(false);
  /** @type {[Product|null, function]} currentProduct - State to store the product object currently being edited. Null when adding. */
  const [currentProduct, setCurrentProduct] = useState(null);
  /** @type {[FormDataProduct, function]} formData - State for the add/edit product form inputs. */
  const [formData, setFormData] = useState(initialFormState);
  /** @type {[boolean, function]} submittingForm - State to indicate if the add/edit product form is currently being submitted. */
  const [submittingForm, setSubmittingForm] = useState(false);

  // States for Excel Import
  /** @type {[File|null, function]} selectedFile - State for the Excel file selected by the user for import. */
  const [selectedFile, setSelectedFile] = useState(null);
  /** @type {[boolean, function]} importing - State to indicate if an Excel file import is in progress. */
  const [importing, setImporting] = useState(false);
  /** @type {[string, function]} importError - State for storing errors related to the Excel import process. */
  const [importError, setImportError] = useState('');
  /** @type {[string, function]} importSuccessMessage - State for storing success messages from the Excel import process. */
  const [importSuccessMessage, setImportSuccessMessage] = useState('');
  /** @type {[boolean, function]} showImportForm - State to control the visibility of the Excel import form. */
  const [showImportForm, setShowImportForm] = useState(false);

  /**
   * Fetches categories from the API using `categoryAPI.getCategories`.
   * Updates `categories` state and handles loading/error states for category fetching.
   */
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await categoryAPI.getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(prevError => prevError + (prevError ? ' ' : '') + 'Failed to load categories.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  /**
   * Fetches products from the API using `productAPI.getProducts`.
   * Can be filtered by `categoryId`. Also identifies and sets low stock products.
   * Updates `products`, `lowStockProducts` states and handles loading/error states for product fetching.
   * @param {string} [categoryId] - Optional category ID to filter products by.
   */
  const fetchProducts = useCallback(async (categoryId) => {
    setLoadingProducts(true);
    setLowStockProducts([]); // Reset low stock products on new fetch
    // setError(prev => prev.includes('categories') ? prev : ''); 
    try {
      const params = categoryId ? { id_categoria: categoryId } : {};
      const productsData = await productAPI.getProducts(params);
      const validProducts = Array.isArray(productsData) ? productsData : [];
      setProducts(validProducts);

      // Identify low stock products
      if (validProducts.length > 0) {
        const lowStock = validProducts.filter(
          (product) => typeof product.stock === 'number' && product.stock < LOW_STOCK_THRESHOLD
        );
        setLowStockProducts(lowStock);
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => prevError + (prevError ? ' ' : '') + 'Failed to load products.');
      setProducts([]);
      setLowStockProducts([]); // Clear on error as well
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchProducts(selectedCategoryIdFilter); // Fetch products based on current filter
  }, [fetchCategories, fetchProducts, selectedCategoryIdFilter]);

  /**
   * Handles changes to the category filter dropdown.
   * Updates `selectedCategoryIdFilter` state, which triggers `useEffect` to refetch products.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event.
   */
  const handleCategoryFilterChange = (e) => {
    setSelectedCategoryIdFilter(e.target.value);
    // Products will be refetched by useEffect due to selectedCategoryIdFilter change
  };

  /**
   * Retrieves the name of a category based on its ID.
   * @param {string|number} categoryId - The ID of the category.
   * @returns {string} The name of the category, or 'N/A' if categories are not loaded, 
   *                   or 'Unknown Category' if the ID is not found.
   */
  const getCategoryName = (categoryId) => {
    if (!categories || categories.length === 0) return 'N/A';
    const category = categories.find(cat => cat.id_categoria === categoryId);
    return category ? category.nombre : 'Unknown Category';
  };

  /**
   * Handles input changes for the add/edit product form.
   * Updates the corresponding field in the `formData` state.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Shows the add product form and resets form state for adding a new product.
   */
  const handleShowAddForm = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData(initialFormState); // Reset form
    setShowForm(true);
    setFormError('');
  };

  /**
   * Prepares the form for editing an existing product.
   * Sets `isEditing` to true, stores the `product` data in `currentProduct` and `formData`,
   * and shows the form.
   * @param {Product} product - The product object to be edited.
   */
  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(), // Ensure string for input value
      stock: product.stock.toString(),   // Ensure string for input value
      id_categoria: product.id_categoria.toString(), // Ensure string for select value
    });
    setShowForm(true);
    setFormError('');
  };

  /**
   * Handles the deletion of a product after user confirmation.
   * Calls `productAPI.deleteProduct` and refreshes the product list.
   * Manages loading and error states for the delete operation.
   * @param {string|number} productId - The ID of the product to delete.
   */
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setSubmittingForm(true); // Use submittingForm for general CUD operation loading
      setError('');
      try {
        await productAPI.deleteProduct(productId);
        await fetchProducts(selectedCategoryIdFilter); // Refresh list
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.response?.data?.detail || err.message || 'Error deleting product.');
      } finally {
        setSubmittingForm(false);
      }
    }
  };

  /**
   * Handles submission of the add/edit product form.
   * Validates required fields. If valid, it calls either `productAPI.createProduct` (for add)
   * or `productAPI.updateProduct` (for edit).
   * On success, it hides the form, resets form data, and refreshes the product list.
   * Manages loading and error states specific to form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.nombre || !formData.precio || !formData.stock || !formData.id_categoria) {
      setFormError('Name, Price, Stock, and Category are required.');
      return;
    }
    
    const productData = {
      ...formData,
      precio: parseFloat(formData.precio), // Ensure price is a number
      stock: parseInt(formData.stock, 10),   // Ensure stock is an integer
      id_categoria: parseInt(formData.id_categoria, 10), // Ensure category_id is an integer
    };

    setSubmittingForm(true);
    setError('');

    try {
      if (isEditing && currentProduct) {
        await productAPI.updateProduct(currentProduct.id_producto, productData);
      } else {
        await productAPI.createProduct(productData);
      }
      setShowForm(false);
      setFormData(initialFormState);
      await fetchProducts(selectedCategoryIdFilter); // Refresh list
    } catch (err) {
      console.error('Error saving product:', err);
      setFormError(err.response?.data?.detail || err.message || 'Error saving product.');
    } finally {
      setSubmittingForm(false);
    }
  };
  
  const isLoadingInitialData = loadingProducts && loadingCategories;

  /**
   * Handles the change event for the file input in the Excel import form.
   * Updates `selectedFile` state and clears previous import messages.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setImportError('');
    setImportSuccessMessage('');
  };

  /**
   * Handles the submission of the Excel import form.
   * Validates if a file is selected. If so, creates `FormData`, calls `productAPI.importProducts`.
   * Manages loading, success, and error states for the import process.
   * Refreshes the product list on successful import.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setImportError('Please select an Excel file to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccessMessage('');
    setError(''); // Clear general errors

    const fileData = new FormData();
    fileData.append('file', selectedFile); // Key 'file' must match backend expectation

    try {
      const response = await productAPI.importProducts(fileData);
      setImportSuccessMessage(response.message || 'Products imported successfully!');
      setSelectedFile(null); 
      if(document.getElementById('excelFile')) { // Reset file input visually only if it exists
         document.getElementById('excelFile').value = null;
      }
      await fetchProducts(selectedCategoryIdFilter); 
      // setShowImportForm(false); // Decide if you want to hide form on success
    } catch (err) {
      console.error('Error importing products:', err);
      setImportError(err.response?.data?.detail || err.message || 'Error importing products. Check file format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Product Management</h1>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Low Stock Alert */}
      {!showForm && !showImportForm && lowStockProducts.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <strong>Low Stock Alert:</strong> The following products are running low:
          <ul>
            {lowStockProducts.map(p => (
              <li key={`low-${p.id_producto}`}>
                {p.nombre} (Stock: {p.stock})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Action Buttons: Add Product and Toggle Import Form */}
      {!showForm && !showImportForm && (
        <div className="mb-3">
          <button 
            className="btn btn-primary me-2" 
            onClick={handleShowAddForm} 
            disabled={loadingCategories || submittingForm || importing}
          >
            Add New Product
          </button>
          <button 
            className="btn btn-info" 
            onClick={() => { 
              setShowImportForm(true); 
              setImportError(''); 
              setImportSuccessMessage(''); 
              setSelectedFile(null); 
            }} 
            disabled={loadingCategories || submittingForm || importing}
          >
            Import Products from Excel
          </button>
        </div>
      )}
      
      {/* Import Products Form */}
      {showImportForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Import Products from Excel</h5>
            {importError && <div className="alert alert-danger">{importError}</div>}
            {importSuccessMessage && <div className="alert alert-success">{importSuccessMessage}</div>}
            <form onSubmit={handleImportSubmit}>
              <div className="mb-3">
                <label htmlFor="excelFile" className="form-label">Select Excel File (.xlsx, .xls)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  id="excelFile" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange} 
                  disabled={importing}
                />
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={importing || !selectedFile}>
                {importing ? 'Importing...' : 'Upload and Import'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowImportForm(false)} disabled={importing}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h5>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={handleSubmit}>
              {/* Form fields remain the same as before */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Name</label>
                <input type="text" name="nombre" id="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Description</label>
                <textarea name="descripcion" id="descripcion" className="form-control" value={formData.descripcion} onChange={handleInputChange}></textarea>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="precio" className="form-label">Price</label>
                  <input type="number" name="precio" id="precio" className="form-control" value={formData.precio} onChange={handleInputChange} required step="0.01" />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input type="number" name="stock" id="stock" className="form-control" value={formData.stock} onChange={handleInputChange} required step="1" />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="id_categoria" className="form-label">Category</label>
                  <select name="id_categoria" id="id_categoria" className="form-select" value={formData.id_categoria} onChange={handleInputChange} required disabled={loadingCategories}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={submittingForm || loadingCategories}>
                {submittingForm ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={submittingForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Filter - Only show if no forms are active */}
      {!loadingCategories && categories.length > 0 && !showForm && !showImportForm && (
        <div className="mb-3">
          <label htmlFor="categoryFilter" className="form-label">Filter by Category:</label>
          <select 
            id="categoryFilter" 
            className="form-select"
            value={selectedCategoryIdFilter} 
            onChange={handleCategoryFilterChange}
            disabled={loadingProducts || submittingForm || importing}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id_categoria} value={category.id_categoria}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
      {loadingCategories && !showForm && !showImportForm && <p>Loading categories...</p>}


      {/* Products List - Only show if no forms are active */}
      {!showForm && !showImportForm && (
        <>
          <h2>Products List</h2>
          {isLoadingInitialData && <p>Loading products...</p>}
          {!isLoadingInitialData && products.length === 0 && !error && <p>No products found. Try adjusting the filter or adding new products.</p>}
          
          {!loadingProducts && products.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id_producto}>
                      <td>{product.nombre}</td>
                      <td>{product.descripcion}</td>
                      <td>${Number(product.precio).toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{getCategoryName(product.id_categoria)}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(product)} disabled={submittingForm || loadingProducts || importing}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id_producto)} disabled={submittingForm || loadingProducts || importing}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {loadingProducts && !isLoadingInitialData && <p>Loading products for selected category...</p>}
        </>
      )}
    </div>
  );
}

export default Products;
