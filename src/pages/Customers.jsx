import React, { useState, useEffect, useCallback } from 'react';
import { customerAPI } from '../utils/api'; // Import customerAPI

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // To trigger fetch on actual search submission

  // Form State
  const initialFormState = { nombre: '', email: '', telefono: '', direccion: '' };
  const [formData, setFormData] = useState(initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null); // For storing ID during edit
  const [formError, setFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  // Define fetchCustomers using useCallback
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchQuery); // Update searchTerm to trigger useEffect
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShowAddForm = () => {
    setIsEditing(false);
    setCurrentCustomer(null);
    setFormData(initialFormState);
    setShowForm(true);
    setFormError('');
    setError(''); // Clear general errors when showing form
  };

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
