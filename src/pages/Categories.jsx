import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI } from '../utils/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for form inputs
  const [categoryName, setCategoryName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // Stores category being edited
  const [formError, setFormError] = useState(''); // Error specific to the form

  // Fetch categories function
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

  // Handle form submission (for both add and edit)
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

  // Handle edit button click
  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryName(category.nombre); // Pre-fill form
    setFormError('');
  };

  // Handle delete button click
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
  
  // Cancel editing
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
