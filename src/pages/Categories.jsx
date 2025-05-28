import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { categoryAPI } from '../utils/api';

/**
 * Categories component for managing product categories for a specific business.
 * Allows users to view, add, edit, and delete categories within a business context.
 * It fetches category data from the API and handles form submissions for CRUD operations.
 */
function Categories() {
  // Use useParams to get businessId from URL
  const { businessId } = useParams(); 

  /** @type {[Array<object>, function]} categories - State for storing the list of categories. Each category object typically has `id_categoria` and `nombre`. */
  const [categories, setCategories] = useState([]);
  /** @type {[boolean, function]} loading - State to indicate if data is being loaded (e.g., fetching categories, submitting form). */
  const [loading, setLoading] = useState(true);
  /** @type {[string | JSX.Element, function]} error - State for storing general error messages (e.g., failed to fetch categories, failed to delete, permission errors). */
  const [error, setError] = useState('');
  
  // State for form inputs
  /** @type {[string, function]} categoryName - State for the category name input field. */
  const [categoryName, setCategoryName] = useState('');
    /** @type {[string, function]} categoryDescription - State for the category description input field. */
  const [categoryDescription, setCategoryDescription] = useState('');
  /** @type {[boolean, function]} isEditing - State to toggle between add and edit mode for the form. */
  const [isEditing, setIsEditing] = useState(false);
  /** @type {[object|null, function]} currentCategory - State to store the category object currently being edited. Null when adding a new category. */
  const [currentCategory, setCurrentCategory] = useState(null);
  /** @type {[string | JSX.Element, function]} formError - State for storing error messages specific to the add/edit form (e.g., validation errors, create/update API errors). */
  const [formError, setFormError] = useState('');

  /**
   * Fetches categories for the current business from the server.
   * Requires businessId from URL.
   */
  const fetchCategories = useCallback(async () => {
    if (!businessId) {
        setError('Business ID is missing.');
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      setError('');
      // Pass businessId to the API call
      const data = await categoryAPI.getCategories(businessId);
      // Ensure data is an array, default to empty array if not
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching categories';
      // Check for 403 Forbidden specifically
      if (err.response?.status === 403) {
           setError('You do not have permission to view categories for this business.');
      } else {
           setError(errorMessage);
      }
      console.error('Error fetching categories:', err);
      setCategories([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [businessId]); // Add businessId to the dependency array

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Handles the submission of the category form (for both adding and editing).
   * Requires businessId from URL.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!businessName.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }
    if (!businessId) {
        setFormError('Business ID is missing.');
        return;
    }

    setLoading(true);
    try {
      const categoryData = { nombre: categoryName.trim(), descripcion: categoryDescription.trim() };
      if (isEditing && currentCategory) {
        // Update existing category - Pass businessId and categoryId
        await categoryAPI.updateCategory(businessId, currentCategory.id, categoryData); 
      } else {
        // Create new category - Pass businessId
        await categoryAPI.createCategory(businessId, categoryData);
      }
      setCategoryName('');
        setCategoryDescription('');
      setIsEditing(false);
      setCurrentCategory(null);
      await fetchCategories(); // Refresh list
    } catch (err) {
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating category' : 'Error creating category');
       // Check for 403 Forbidden specifically
      if (err.response?.status === 403) {
           setFormError('You do not have permission to edit categories for this business.');
      } else {
           setFormError(specificError);
      }
      console.error(isEditing ? 'Error updating category:' : 'Error creating category:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets the form to edit mode when an "Edit" button is clicked.
   * Populates the form with the selected category's data.
   */
  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryName(category.nombre); // Pre-fill form
     setCategoryDescription(category.descripcion || ''); // Pre-fill description
    setFormError('');
  };

  /**
   * Handles the deletion of a category for the current business.
   * Requires businessId from URL.
   */
  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      if (!businessId) {
           setError('Business ID is missing.');
           return;
      }
      setLoading(true);
      try {
        // Pass businessId and categoryId to the API call
        await categoryAPI.deleteCategory(businessId, categoryId);
        await fetchCategories(); // Refresh list
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Error deleting category';
         // Check for 403 Forbidden specifically
        if (err.response?.status === 403) {
             setError('You do not have permission to delete categories for this business.');
        } else {
             setError(errorMessage);
        }
        console.error('Error deleting category:', err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  /**
   * Cancels the editing mode.
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryName('');
      setCategoryDescription('');
    setFormError('');
  };

  return (
    <div className="container mt-4">
      <h1>Category Management {businessId && `for Business ID: ${businessId}`}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Form for Adding/Editing Categories */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{isEditing ? 'Edit Category' : 'Add New Category'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryName" className="form-label">Category Name</label>
              <input
                type="text"
                className={`form-control ${formError ? 'is-invalid' : ''}`}
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
              {formError && <div className="invalid-feedback">{formError}</div>}
            </div>
             <div className="mb-3">
              <label htmlFor="categoryDescription" className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading || !businessId}>
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Category' : 'Add Category')}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={loading}>
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Display Categories */}
      {loading && !categories.length && <p>Loading categories...</p>}
      {!loading && !error && categories.length === 0 && <p>No categories found for this business. Add one above!</p>}
      
      {categories.length > 0 && (
        <div className="card">
          <div className="card-header">
            Existing Categories
          </div>
          <ul className="list-group list-group-flush">
            {categories.map(category => (
              <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                     {category.nombre}
                     {category.descripcion && <small className="text-muted ms-2">{category.descripcion}</small>}
                </div>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2" 
                    onClick={() => handleEdit(category)} 
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDelete(category.id)} 
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

export default Categories;
