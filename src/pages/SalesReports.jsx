import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusinessContext } from '../contexts/BusinessContext';
import { salesAPI, customerAPI } from '../utils/api';
import { PageLoader, SectionLoader } from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import PermissionGuard from '../components/PermissionGuard';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  Package,
  ArrowLeft,
  Building2,
  BarChart3,
  PieChart,
  Users,
  AlertTriangle,
  Loader2,
  Menu,
  X,
  Download
} from 'lucide-react';

/**
 * @typedef {object} SaleItemDetail
 * @property {string|number} producto_id - ID of the product.
 * @property {string} [nombre_producto] - Name of the product (if available directly).
 * @property {number} cantidad - Quantity sold.
 * @property {number} precio_unitario - Sale price per unit.
 * @property {number} subtotal - Total for this item.
 */

/**
 * @typedef {object} SaleRecord
 * @property {string|number} id - Unique ID of the sale.
 * @property {string} fecha - Date and time of the sale (ISO string).
 * @property {string|number|null} cliente_id - ID of the customer associated with the sale, or null.
 * @property {number} total - Total amount of the sale.
 * @property {string} medio_pago - Payment method used.
 * @property {string} estado - Sale status.
 * @property {Array<SaleItemDetail>} [venta_detalle] - Array of items included in the sale.
 */

/**
 * @typedef {object} CustomerRef
 * @property {string|number} id - Unique ID of the customer.
 * @property {string} nombre - Customer's first name.
 * @property {string} apellido - Customer's last name.
 */

// Componente Button reutilizable
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

// Componente Card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

// Componente Alert
const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Componente Badge
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * SalesReports component for displaying and filtering sales transaction data.
 * It fetches sales records and associated customer data to present a comprehensive report.
 * Users can filter sales by a date range.
 */
function SalesReportsComponent() {
  const { currentBusiness } = useBusinessContext();
  const navigate = useNavigate();

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

  // Sales report data
  /** @type {[object, function]} reportData - State for storing sales report analytics. */
  const [reportData, setReportData] = useState(null);

  /**
   * Fetches customer data from the API using `customerAPI.getCustomers`.
   * This data is used to map customer IDs in sales records to customer names.
   * Errors during this fetch are logged but do not necessarily block sales data loading.
   */
  const fetchAllCustomers = useCallback(async () => {
    const businessId = currentBusiness?.id;
    if (!businessId) {
      return;
    }
    try {
      const customersData = await customerAPI.getCustomers(businessId);
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching customers for report:', err);
      // Not setting main error, as sales might still load
    }
  }, [currentBusiness?.id]);

  /**
   * Fetches sales data and report analytics from the API.
   * Applies date range filtering based on `currentStartDate` and `currentEndDate` parameters.
   * Updates component state for sales, loading, and errors.
   * @param {string} currentStartDate - The start date for filtering sales (YYYY-MM-DD).
   * @param {string} currentEndDate - The end date for filtering sales (YYYY-MM-DD).
   */
  const fetchSalesData = useCallback(async (currentStartDate, currentEndDate) => {
    const businessId = currentBusiness?.id;
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentStartDate) params.fecha_inicio = currentStartDate;
      if (currentEndDate) params.fecha_fin = currentEndDate;
      
      // Fetch both sales list and report data
      const [salesData, reportData] = await Promise.all([
        salesAPI.getSales(businessId, params),
        salesAPI.getSalesReport(businessId, params)
      ]);
      
      setSales(Array.isArray(salesData) ? salesData : []);
      setReportData(reportData);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load sales data.');
      setSales([]);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id]);

  /**
   * useEffect hook for initial data fetching.
   * Fetches all customers once on mount.
   * Fetches sales data based on the current `startDate` and `endDate`.
   */
  useEffect(() => {
    fetchAllCustomers();
    fetchSalesData(startDate, endDate); 
  }, [fetchSalesData, fetchAllCustomers, startDate, endDate]);

  /**
   * Handles the explicit application of date filters via the "Apply Filters" button.
   * Prevents default form submission and calls `fetchSalesData` with the current
   * `startDate` and `endDate` from the state.
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
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.nombre} ${customer.apellido}`.trim() : `ID: ${customerId}`;
  };
  
  /**
   * Formats a date string into a more readable local date and time string.
   * Handles potential errors if the date string is invalid.
   * @param {string} dateString - The date string to format (e.g., an ISO string).
   * @returns {string} The formatted date string or the original string if formatting fails.
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout activeSection="reports">
        <div className="p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando reportes de ventas...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes de Ventas
          </h1>
          <p className="text-gray-600">
            Análisis detallado de ventas y ganancias
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFilterApply} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Aplicar Filtros
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sales Analytics Cards */}
        {!loading && reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.total_ventas}</p>
                    <p className="text-sm text-blue-600 mt-1">Transacciones</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${Number(reportData.total_ingresos || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">Bruto</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ganancias Netas</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${Number(reportData.ganancias_netas || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">Después de costos</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio por Venta</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${reportData.total_ventas > 0 ? Number(reportData.total_ingresos / reportData.total_ventas).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-orange-600 mt-1">Ticket promedio</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Products */}
        {!loading && reportData && reportData.productos_mas_vendidos && reportData.productos_mas_vendidos.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.productos_mas_vendidos.slice(0, 6).map((producto, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                      <Badge variant="default">#{index + 1}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="font-medium">{producto.cantidad}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium text-green-600">
                          ${Number(producto.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {!loading && sales.length === 0 && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron ventas
              </h3>
              <p className="text-gray-600">
                No hay ventas para los criterios seleccionados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sales Table */}
        {!loading && sales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Listado Detallado de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Método de Pago</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(sale => (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">#{sale.id}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(sale.fecha)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            {getCustomerName(sale.cliente_id)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">
                            {sale.medio_pago === 'efectivo' && '💵'}
                            {sale.medio_pago === 'tarjeta' && '💳'}
                            {sale.medio_pago === 'transferencia' && '🏦'}
                            {' '}
                            {sale.medio_pago || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ${Number(sale.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={sale.estado === 'completada' ? 'success' : 'warning'}>
                            {sale.estado}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {sale.venta_detalle?.reduce((acc, item) => acc + item.cantidad, 0) || 0} productos
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

export default function ProtectedSalesReports() {
  return (
    <Layout activeSection="reports">
      <PermissionGuard requiredModule="ventas" requiredAction="ver">
        <SalesReportsComponent />
      </PermissionGuard>
    </Layout>
  );
}
