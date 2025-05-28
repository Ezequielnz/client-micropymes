import React, { useState, useEffect, useCallback } from 'react';
import { salesAPI, customerAPI } from '../utils/api'; // Assuming salesAPI is available

/**
 * @typedef {object} SaleItemDetail
 * @property {string|number} id_producto - ID of the product.
 * @property {string} [nombre_producto] - Name of the product (if available directly).
 * @property {number} cantidad - Quantity sold.
 * @property {number} precio_venta - Sale price per unit.
 */

/**
 * @typedef {object} SaleRecord
 * @property {string|number} id_venta - Unique ID of the sale.
 * @property {string} fecha_venta - Date and time of the sale (ISO string or similar).
 * @property {string|number|null} id_cliente - ID of the customer associated with the sale, or null.
 * @property {number} monto_total - Total amount of the sale.
 * @property {Array<SaleItemDetail>} [items] - Array of items included in the sale.
 */

/**
 * @typedef {object} CustomerRef
 * @property {string|number} id_cliente - Unique ID of the customer.
 * @property {string} nombre - Name of the customer.
 */

/**
 * SalesReports component for displaying and filtering sales transaction data.
 * It fetches sales records and associated customer data to present a comprehensive report.
 * Users can filter sales by a date range.
 */
function SalesReports() {
  /** @type {[Array<SaleRecord>, function]} sales - State for storing the list of sales records. */
  const [sales, setSales] = useState([]);
  /** @type {[Array<CustomerRef>, function]} customers - State for storing customer data to map customer IDs to names in the report. */
  const [customers, setCustomers] = useState([]);
  /** @type {[boolean, function]} loading - State to indicate if sales data is currently being fetched. */
  const [loading, setLoading] = useState(true);
  /** @type {[string, function]} error - State for storing error messages related to fetching sales data. */
  const [error, setError] = useState('');
  
  // Date filter states
  /** @type {[string, function]} startDate - State for the start date filter input (YYYY-MM-DD format). */
  const [startDate, setStartDate] = useState('');
  /** @type {[string, function]} endDate - State for the end date filter input (YYYY-MM-DD format). */
  const [endDate, setEndDate] = useState('');

  /**
   * Fetches customer data from the API using `customerAPI.getCustomers`.
   * This data is used to map customer IDs in sales records to customer names.
   * Errors during this fetch are logged but do not necessarily block sales data loading.
   */
  const fetchAllCustomers = useCallback(async () => {
    try {
      const customersData = await customerAPI.getCustomers();
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching customers for report:', err);
      // Not setting main error, as sales might still load
    }
  }, []);


  /**
   * Fetches sales data from the API using `salesAPI.getSales`.
   * Applies date range filtering based on `currentStartDate` and `currentEndDate` parameters.
   * Updates component state for sales, loading, and errors.
   * @param {string} currentStartDate - The start date for filtering sales (YYYY-MM-DD).
   * @param {string} currentEndDate - The end date for filtering sales (YYYY-MM-DD).
   */
  const fetchSalesData = useCallback(async (currentStartDate, currentEndDate) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentStartDate) params.fecha_inicio = currentStartDate;
      if (currentEndDate) params.fecha_fin = currentEndDate;
      
      const data = await salesAPI.getSales(params);
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load sales data.');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * useEffect hook for initial data fetching.
   * Fetches all customers once on mount.
   * Fetches sales data based on the current `startDate` and `endDate`.
   * This effect re-runs if `fetchSalesData`, `fetchAllCustomers`, `startDate`, or `endDate` change.
   * The inclusion of `startDate` and `endDate` as dependencies allows for automatic refetching
   * as the user changes the date inputs.
   */
  useEffect(() => {
    fetchAllCustomers();
    fetchSalesData(startDate, endDate); 
  }, [fetchSalesData, fetchAllCustomers, startDate, endDate]);

  /**
   * Handles the explicit application of date filters via the "Apply Filters" button.
   * Prevents default form submission and calls `fetchSalesData` with the current
   * `startDate` and `endDate` from the state.
   * Note: `fetchSalesData` is also triggered by the `useEffect` hook when `startDate` or `endDate` change.
   * This handler provides an explicit user action for filtering.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleFilterApply = (e) => {
    e.preventDefault();
    fetchSalesData(startDate, endDate);
  };

  /**
   * Retrieves the customer's name based on their ID.
   * Uses the `customers` state which should be pre-loaded.
   * @param {string|number|null} customerId - The ID of the customer.
   * @returns {string} The customer's name, 'N/A (Walk-in)' if no ID, or 'ID: {customerId}' if not found.
   */
  const getCustomerName = (customerId) => {
    if (!customers.length || !customerId) return 'N/A (Walk-in)';
    const customer = customers.find(c => c.id_cliente === customerId);
    return customer ? customer.nombre : `ID: ${customerId}`;
  };
  
  /**
   * Formats a date string into a more readable local date and time string.
   * Handles potential errors if the date string is invalid.
   * @param {string} dateString - The date string to format (e.g., an ISO string).
   * @returns {string} The formatted date string (e.g., "MM/DD/YYYY, HH:MM:SS AM/PM") or the original string if formatting fails or input is invalid.
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Attempt to create a date object. Handle potential ISO string or other formats.
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if formatting fails
    }
  };


  return (
    <div className="container mt-4">
      <h1>Sales Reports</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Filter Form */}
      <form onSubmit={handleFilterApply} className="row g-3 mb-4 align-items-end">
        <div className="col-md-4">
          <label htmlFor="startDate" className="form-label">Start Date</label>
          <input 
            type="date" 
            className="form-control" 
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="endDate" className="form-label">End Date</label>
          <input 
            type="date" 
            className="form-control" 
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </form>

      {loading && <p>Loading sales reports...</p>}
      
      {!loading && sales.length === 0 && !error && (
        <p>No sales found for the selected criteria.</p>
      )}

      {!loading && sales.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Items Sold</th> 
                {/* Add more headers if needed, e.g., "View Details" */}
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id_venta}>
                  <td>{sale.id_venta}</td>
                  <td>{formatDate(sale.fecha_venta)}</td>
                  <td>{getCustomerName(sale.id_cliente)}</td>
                  <td>${Number(sale.monto_total).toFixed(2)}</td>
                  <td>{sale.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0}</td>
                  {/* 
                    Example for items display (if items are part of sale object):
                    <td>
                      <ul>
                        {sale.items && sale.items.map(item => (
                          <li key={item.id_producto_venta_detalle || item.id_producto}>
                            {item.nombre_producto || `Product ID: ${item.id_producto}`} - Qty: {item.cantidad} @ ${Number(item.precio_venta).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </td> 
                  */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SalesReports;
