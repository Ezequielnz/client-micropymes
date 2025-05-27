import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI } from '../utils/api';

/**
 * Categories component for managing product categories.
 * Allows users to view, add, edit, and delete categories.
 * It fetches category data from the API and handles form submissions for CRUD operations.
 */
function Categories() {
  /** @type {[Array<object>, function]} categories - State for storing the list of categories. Each category object typically has `id_categoria` and `nombre`. */
  const [categories, setCategories] = useState([]);
  /** @type {[boolean, function]} loading - State to indicate if data is being loaded (e.g., fetching categories, submitting form). */
  const [loading, setLoading] = useState(true);
  /** @type {[string, function]} error - State for storing general error messages (e.g., failed to fetch categories, failed to delete). */
  const [error, setError] = useState('');
  
  // State for form inputs
  /** @type {[string, function]} categoryName - State for the category name input field. */
  const [categoryName, setCategoryName] = useState('');
  /** @type {[boolean, function]} isEditing - State to toggle between add and edit mode for the form. */
  const [isEditing, setIsEditing] = useState(false);
  /** @type {[object|null, function]} currentCategory - State to store the category object currently being edited. Null when adding a new category. */
  const [currentCategory, setCurrentCategory] = useState(null);
  /** @type {[string, function]} formError - State for storing error messages specific to the add/edit form (e.g., validation errors, create/update API errors). */
  const [formError, setFormError] = useState('');

  /**
   * Fetches categories from the server using `categoryAPI.getCategories`
   * and updates the component's state (`categories`, `loading`, `error`).
   * Ensures that the `categories` state is always an array.
   */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await categoryAPI.getCategories();
      // Ensure data is an array, default to empty array if not
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error fetching categories');
      console.error('Error fetching categories:', err);
      setCategories([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Handles the submission of the category form (for both adding and editing).
   * Prevents default form action, validates input, and calls the appropriate
   * API function (`createCategory` or `updateCategory`).
   * Resets form state and refreshes the category list upon successful submission.
   * Displays errors in `formError` state if validation or API call fails.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!categoryName.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentCategory) {
        // Update existing category
        // Assuming API expects { nombre: "new name" }
        await categoryAPI.updateCategory(currentCategory.id_categoria, { nombre: categoryName }); 
      } else {
        // Create new category
        // Assuming API expects { nombre: "new name" }
        await categoryAPI.createCategory({ nombre: categoryName });
      }
      setCategoryName('');
      setIsEditing(false);
      setCurrentCategory(null);
      await fetchCategories(); // Refresh list
    } catch (err) {
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating category' : 'Error creating category');
      setFormError(specificError);
      console.error(isEditing ? 'Error updating category:' : 'Error creating category:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets the form to edit mode when an "Edit" button is clicked.
   * Populates the form with the selected category's data.
   * @param {object} category - The category object to be edited.
   * @param {string|number} category.id_categoria - The ID of the category.
   * @param {string} category.nombre - The name of the category.
   */
  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryName(category.nombre); // Pre-fill form
    setFormError('');
  };

  /**
   * Handles the deletion of a category.
   * Shows a confirmation dialog before proceeding. If confirmed,
   * calls `categoryAPI.deleteCategory` and refreshes the category list.
   * Displays errors in the main `error` state if deletion fails.
   * @param {string|number} categoryId - The ID of the category to be deleted.
   */
  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await categoryAPI.deleteCategory(categoryId);
        await fetchCategories(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Error deleting category');
        console.error('Error deleting category:', err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  /**
   * Cancels the editing mode.
   * Resets the form fields and related state (`isEditing`, `currentCategory`, `categoryName`, `formError`).
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryName('');
    setFormError('');
  };

  return (
    <div className="container mt-4">
      <h1>Category Management</h1>
      
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
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
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
      {!loading && !error && categories.length === 0 && <p>No categories found. Add one above!</p>}
      
      {categories.length > 0 && (
        <div className="card">
          <div className="card-header">
            Existing Categories
          </div>
          <ul className="list-group list-group-flush">
            {categories.map(category => (
              <li key={category.id_categoria} className="list-group-item d-flex justify-content-between align-items-center">
                {category.nombre}
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
                    onClick={() => handleDelete(category.id_categoria)} 
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
