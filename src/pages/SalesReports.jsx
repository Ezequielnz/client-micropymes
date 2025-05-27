import React, { useState, useEffect, useCallback } from 'react';
import { salesAPI, customerAPI } from '../utils/api'; // Assuming salesAPI is available

function SalesReports() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]); // To map customer IDs to names
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to fetch customers to map IDs to names
  const fetchAllCustomers = useCallback(async () => {
    try {
      const customersData = await customerAPI.getCustomers();
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching customers for report:', err);
      // Not setting main error, as sales might still load
    }
  }, []);


  // Function to fetch sales data
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

  // Initial data fetch (all sales and customers)
  useEffect(() => {
    fetchAllCustomers();
    fetchSalesData(startDate, endDate); // Fetch initial sales (can be all or based on default dates)
  }, [fetchSalesData, fetchAllCustomers, startDate, endDate]); // Re-fetch if dates change via initial state or future logic

  const handleFilterApply = (e) => {
    e.preventDefault();
    // fetchSalesData is already called when startDate/endDate state changes if they are dependencies of useEffect.
    // If we want explicit button click to trigger, we can call it here directly.
    // For now, useEffect handles it. If direct call is preferred, remove startDate/endDate from useEffect deps
    // and uncomment the line below.
    fetchSalesData(startDate, endDate);
  };

  const getCustomerName = (customerId) => {
    if (!customers.length || !customerId) return 'N/A (Walk-in)';
    const customer = customers.find(c => c.id_cliente === customerId);
    return customer ? customer.nombre : `ID: ${customerId}`;
  };
  
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
