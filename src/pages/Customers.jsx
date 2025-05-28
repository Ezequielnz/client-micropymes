import React, { useState, useEffect, useCallback } from 'react';
import { customerAPI } from '../utils/api'; // Import customerAPI

/**
 * @typedef {object} Customer
 * @property {string|number} id_cliente - The unique identifier for the customer.
 * @property {string} nombre - The customer's full name.
 * @property {string} email - The customer's email address.
 * @property {string} [telefono] - The customer's phone number (optional).
 * @property {string} [direccion] - The customer's physical address (optional).
 */

/**
 * @typedef {object} FormDataCustomer
 * @property {string} nombre - Customer's name.
 * @property {string} email - Customer's email.
 * @property {string} telefono - Customer's phone number.
 * @property {string} direccion - Customer's address.
 */

/**
 * Customers component for managing customer data.
 * Allows users to view a list of customers, search for specific customers,
 * add new customers, edit existing ones, and delete customers.
 * Handles API interactions for these CRUD operations and manages related state
 * (loading, errors, form data).
 */
function Customers() {
  /** @type {[Array<Customer>, function]} customers - State for the list of customers displayed in the table. */
  const [customers, setCustomers] = useState([]);
  /** @type {[boolean, function]} loading - State to indicate if data is being loaded (e.g., fetching customers, deleting a customer). */
  const [loading, setLoading] = useState(true);
  /** @type {[string, function]} error - State for storing general page errors (e.g., failed to fetch, failed to delete). */
  const [error, setError] = useState('');
  /** @type {[string, function]} searchQuery - State for the value currently in the search input field. */
  const [searchQuery, setSearchQuery] = useState('');
  /** @type {[string, function]} searchTerm - State for the actual search term submitted and used for fetching filtered customers. */
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  /** @type {FormDataCustomer} */
  const initialFormState = { nombre: '', email: '', telefono: '', direccion: '' };
  /** @type {[FormDataCustomer, function]} formData - State for the add/edit customer form inputs. */
  const [formData, setFormData] = useState(initialFormState);
  /** @type {[boolean, function]} showForm - State to control the visibility of the add/edit customer form. */
  const [showForm, setShowForm] = useState(false);
  /** @type {[boolean, function]} isEditing - State to determine if the form is in 'edit' mode (true) or 'add' mode (false). */
  const [isEditing, setIsEditing] = useState(false);
  /** @type {[Customer|null, function]} currentCustomer - State to store the customer object currently being edited. Null when adding. */
  const [currentCustomer, setCurrentCustomer] = useState(null);
  /** @type {[string, function]} formError - State for storing errors specific to the add/edit customer form (e.g., validation errors). */
  const [formError, setFormError] = useState('');
  /** @type {[boolean, function]} submittingForm - State to indicate if the add/edit customer form is currently being submitted. */
  const [submittingForm, setSubmittingForm] = useState(false);

  /**
   * Fetches customers from the API using `customerAPI.getCustomers`.
   * Can be filtered by a search `query`.
   * Updates `customers` state and handles loading/error states for customer fetching.
   * @param {string} [query] - Optional search query to filter customers.
   */
  const fetchCustomers = useCallback(async (query) => {
    setLoading(true);
    setError('');
    try {
      const params = query ? { search: query } : {};
      const data = await customerAPI.getCustomers(params);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load customers.');
      setCustomers([]); // Clear customers on error
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, fetchCustomers itself doesn't change

  // Effect for initial fetch and when searchTerm changes
  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [searchTerm, fetchCustomers]);

  /**
   * Handles changes to the search input field.
   * Updates the `searchQuery` state with the current input value.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handles the submission of the search form.
   * Sets the `searchTerm` state with the current `searchQuery`, which in turn
   * triggers the `useEffect` hook to fetch filtered customers.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchQuery); // Update searchTerm to trigger useEffect
  };

  /**
   * Handles input changes for the add/edit customer form.
   * Updates the corresponding field in the `formData` state.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Shows the add customer form.
   * Resets form state (`isEditing` to false, `currentCustomer` to null, `formData` to initial),
   * clears any form or general errors, and displays the form.
   */
  const handleShowAddForm = () => {
    setIsEditing(false);
    setCurrentCustomer(null);
    setFormData(initialFormState);
    setShowForm(true);
    setFormError('');
    setError(''); // Clear general errors when showing form
  };

  /**
   * Prepares the form for editing an existing customer.
   * Sets `isEditing` to true, stores the `customer` data in `currentCustomer` and `formData`,
   * clears errors, and shows the form.
   * @param {Customer} customer - The customer object to be edited.
   */
  const handleEditClick = (customer) => {
    setIsEditing(true);
    setCurrentCustomer(customer);
    setFormData({
      nombre: customer.nombre,
      email: customer.email,
      telefono: customer.telefono || '', // Handle if phone or address can be null
      direccion: customer.direccion || '',
    });
    setShowForm(true);
    setFormError('');
    setError(''); // Clear general errors
  };

  /**
   * Handles submission of the add/edit customer form.
   * Performs validation (name and email required, valid email format).
   * If valid, it calls either `customerAPI.createCustomer` (for adding)
   * or `customerAPI.updateCustomer` (for editing).
   * On success, it hides the form, resets form data, and refreshes the customer list.
   * Manages loading and error states specific to form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.nombre || !formData.email) {
      setFormError('Name and Email are required.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Email address is invalid.');
      return;
    }

    setSubmittingForm(true);
    setError(''); 

    try {
      if (isEditing && currentCustomer) {
        await customerAPI.updateCustomer(currentCustomer.id_cliente, formData);
      } else {
        await customerAPI.createCustomer(formData);
      }
      setShowForm(false);
      setFormData(initialFormState);
      fetchCustomers(searchTerm); // Refresh list
    } catch (err) {
      console.error('Error saving customer:', err);
      setFormError(err.response?.data?.detail || err.message || 'Error saving customer.');
    } finally {
      setSubmittingForm(false);
    }
  };

  /**
   * Handles the deletion of a customer after user confirmation.
   * Calls `customerAPI.deleteCustomer` and refreshes the customer list using the current `searchTerm`.
   * Manages loading and error states for the delete operation.
   * @param {string|number} customerId - The ID of the customer to delete.
   */
  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true); // Indicate loading state for delete operation
      try {
        await customerAPI.deleteCustomer(customerId);
        // Refresh the list with the current search term
        fetchCustomers(searchTerm); 
      } catch (err) {
        console.error('Error deleting customer:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to delete customer.');
        setLoading(false); // Ensure loading is false on error
      }
      // setLoading will be set to false by fetchCustomers in the success case
    }
  };

  return (
    <div className="container mt-4">
      <h1>Customer Management</h1>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Add Customer Button - Only show if form is not visible */}
      {!showForm && (
        <button className="btn btn-primary mb-3" onClick={handleShowAddForm} disabled={loading || submittingForm}>
          Add New Customer
        </button>
      )}

      {/* Customer Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h5>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Name <span className="text-danger">*</span></label>
                <input type="text" name="nombre" id="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                <input type="email" name="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Phone</label>
                <input type="tel" name="telefono" id="telefono" className="form-control" value={formData.telefono} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">Address</label>
                <textarea name="direccion" id="direccion" className="form-control" value={formData.direccion} onChange={handleInputChange}></textarea>
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={submittingForm}>
                {submittingForm ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Customer' : 'Add Customer')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => {setShowForm(false); setFormError('');}} disabled={submittingForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search Form - Only show if form is not visible */}
      {!showForm && (
        <form onSubmit={handleSearchSubmit} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading || submittingForm}
            />
            <button className="btn btn-outline-secondary" type="submit" disabled={loading || submittingForm}>
              {loading && searchTerm === searchQuery ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      )}
      
      {/* Loading and No Customers Message - Only show if form is not visible */}
      {loading && !showForm && <p>Loading customers...</p>}
      
      {!loading && customers.length === 0 && !error && !showForm && (
        <p>No customers found. {searchTerm && "Try a different search term or clear the search."}</p>
      )}

      {/* Customer Table - Only show if form is not visible, not loading, and customers exist */}
      {!loading && customers.length > 0 && !showForm && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th> 
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id_cliente}>
                  <td>{customer.id_cliente}</td>
                  <td>{customer.nombre}</td>
                  <td>{customer.email}</td>
                  <td>{customer.telefono}</td>
                  <td>{customer.direccion || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-2" 
                      onClick={() => handleEditClick(customer)}
                      disabled={loading || submittingForm}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDelete(customer.id_cliente)}
                      disabled={loading || submittingForm}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Customers;
