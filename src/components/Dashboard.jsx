import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Users,
  ShoppingCart,
  Plus,
  FileText,
  Upload,
  MessageSquare,
  Mail,
  Eye,
  Send,
  Filter,
  MoreHorizontal,
  LogOut,
  Building2,
  Clock,
  Target,
  Activity,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { salesAPI, tasksAPI, productAPI, customerAPI, authAPI, businessAPI } from '../utils/api';
import { PageLoader } from './LoadingSpinner';

// Componentes UI simples
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-erp-primary text-white hover:bg-erp-primary-hover focus:ring-erp-primary shadow-erp-primary',
    outline: 'border border-erp-neutral-300 bg-white text-erp-neutral-700 hover:bg-erp-neutral-50 focus:ring-erp-primary',
    ghost: 'text-erp-neutral-700 hover:bg-erp-neutral-100 focus:ring-erp-primary',
    success: 'bg-erp-success text-white hover:bg-erp-success-hover focus:ring-erp-success shadow-erp-success',
    warning: 'bg-erp-warning text-white hover:bg-erp-warning-hover focus:ring-erp-warning shadow-erp-warning'
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

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-erp-neutral-200 rounded-lg shadow-erp-soft hover:shadow-erp-medium transition-all duration-300 ${className}`}>
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
  <h3 className={`text-lg font-semibold text-erp-neutral-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-erp-neutral-600 ${className}`}>
    {children}
  </p>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-erp-neutral-100 text-erp-neutral-800',
    secondary: 'bg-erp-neutral-100 text-erp-neutral-800',
    success: 'bg-erp-success-100 text-erp-success-800',
    warning: 'bg-erp-warning-100 text-erp-warning-800',
    destructive: 'bg-erp-error-100 text-erp-error-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Avatar = ({ children, className = '' }) => (
  <div className={`inline-flex items-center justify-center w-8 h-8 bg-erp-neutral-200 rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children }) => (
  <span className="text-sm font-medium text-erp-neutral-600">{children}</span>
);

const DropdownMenu = ({ children }) => (
  <div className="relative inline-block text-left">
    {children}
  </div>
);

const DropdownMenuTrigger = ({ children, ...props }) => (
  <div {...props}>
    {children}
  </div>
);

const DropdownMenuContent = ({ children, className = '' }) => (
  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${className}`}>
    <div className="py-1">
      {children}
    </div>
  </div>
);

const DropdownMenuItem = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
  >
    {children}
  </button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [taskFilter, setTaskFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para datos reales con cache por período
  const [dashboardStatsCache, setDashboardStatsCache] = useState({
    today: null,
    week: null,
    month: null
  });
  const [topItemsCache, setTopItemsCache] = useState({
    today: null,
    week: null,
    month: null
  });
  
  // Estados para datos que se cargan una sola vez
  const [recentSales, setRecentSales] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Estados para diagnóstico de rendimiento
  const [healthCheckResult, setHealthCheckResult] = useState(null);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);

  // Datos simulados para alertas y notificaciones
  const alerts = [
    {
      id: 1,
      type: 'warning',
      icon: '🚨',
      message: 'Algunos productos tienen stock bajo',
      priority: 'high',
    },
    {
      id: 2,
      type: 'error',
      icon: '⏱️',
      message: 'Tienes tareas pendientes por completar',
      priority: 'high',
    },
    {
      id: 3,
      type: 'info',
      icon: '💰',
      message: 'Considera revisar los precios de tus productos',
      priority: 'medium',
    },
    {
      id: 4,
      type: 'warning',
      icon: '📄',
      message: 'Hay ventas pendientes de facturar',
      priority: 'medium',
    },
  ];

  const notifications = [
    {
      id: 1,
      type: 'whatsapp',
      message: 'Sistema de notificaciones activo',
      status: 'sent',
      time: 'Hace 1 hora',
    },
    {
      id: 2,
      type: 'email',
      message: 'Bienvenido al dashboard',
      status: 'delivered',
      time: 'Hace 2 horas',
    },
    {
      id: 3,
      type: 'whatsapp',
      message: 'Dashboard configurado correctamente',
      status: 'delivered',
      time: 'Hace 3 horas',
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentBusiness) {
      loadBusinessData();
    }
  }, [currentBusiness]);

  // Los datos se cargan todos juntos en loadStatsForPeriod, no necesitamos pre-carga adicional

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [userData, businessesData] = await Promise.all([
        authAPI.getCurrentUser(),
        businessAPI.getBusinesses()
      ]);
      
      setUser(userData);
      setBusinesses(businessesData);
      
      // Seleccionar el primer negocio por defecto
      if (businessesData && businessesData.length > 0) {
        setCurrentBusiness(businessesData[0]);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessData = async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const dataPromises = [
        // Cargar estadísticas (esto carga todos los períodos)
        loadStatsForPeriod(selectedPeriod),
        
        // Cargar otros datos estáticos
        salesAPI.getRecentSales(currentBusiness.id).then(data => {
          setRecentSales(Array.isArray(data) ? data.slice(0, 5) : []);
        }).catch(error => {
          console.error('Error loading recent sales:', error);
          setRecentSales([]);
        }),
        
        tasksAPI.getTaskStats(currentBusiness.id).then(setTaskStats).catch(error => {
          console.error('Error loading task stats:', error);
          setTaskStats({ total: 0, pendientes: 0, completadas: 0, en_progreso: 0 });
        }),
        
        productAPI.getProducts(currentBusiness.id).then(setProducts).catch(error => {
          console.error('Error loading products:', error);
          setProducts([]);
        }),
        
        customerAPI.getCustomers(currentBusiness.id).then(setCustomers).catch(error => {
          console.error('Error loading customers:', error);
          setCustomers([]);
        })
      ];

      // Esperar a que terminen las cargas principales
      await Promise.allSettled(dataPromises);

    } catch (error) {
      console.error('Error loading business data:', error);
      setError('Error al cargar los datos del negocio');
    } finally {
      setLoading(false);
    }
  };

  // Función optimizada para cargar estadísticas por período
  const loadStatsForPeriod = async (period) => {
    // Si ya tenemos los datos en cache, no hacer nada
    if (dashboardStatsCache[period]) {
      return;
    }

    if (!currentBusiness?.id) return;

    setStatsLoading(true);
    try {
      const statsResponse = await salesAPI.getDashboardStatsV2(currentBusiness.id);
      
      // La respuesta contiene todos los períodos, así que los cacheamos todos
      if (statsResponse) {
        // Cachear todas las estadísticas por período
        setDashboardStatsCache(prev => ({
          ...prev,
          today: statsResponse.today || { total_sales: 0, estimated_profit: 0, new_customers: 0 },
          week: statsResponse.week || { total_sales: 0, estimated_profit: 0, new_customers: 0 },
          month: statsResponse.month || { total_sales: 0, estimated_profit: 0, new_customers: 0 }
        }));
        
        // Cachear los top items (son los mismos para todos los períodos por ahora)
        setTopItemsCache(prev => ({
          ...prev,
          today: statsResponse.top_items || [],
          week: statsResponse.top_items || [],
          month: statsResponse.top_items || []
        }));
      }

    } catch (error) {
      console.error(`Error loading stats for ${period}:`, error);
      // Set empty data on error solo para el período solicitado
      setDashboardStatsCache(prev => ({
        ...prev,
        [period]: { total_sales: 0, estimated_profit: 0, new_customers: 0 }
      }));
      setTopItemsCache(prev => ({
        ...prev,
        [period]: []
      }));
    } finally {
      setStatsLoading(false);
    }
  };

  // Manejar cambio de período - ahora es instantáneo si ya tenemos los datos
  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    
    // Solo cargar si no tenemos los datos en cache
    if (!dashboardStatsCache[period]) {
      await loadStatsForPeriod(period);
    }
  };

  const generateSalesData = (products) => {
    const baseRevenue = products.reduce((sum, product) => sum + product.precio_venta, 0);
    
    return {
      today: {
        sales: Math.floor(baseRevenue * 0.1),
        profit: Math.floor(baseRevenue * 0.03),
        orders: Math.floor(Math.random() * 10) + 1
      },
      week: {
        sales: Math.floor(baseRevenue * 0.7),
        profit: Math.floor(baseRevenue * 0.2),
        orders: Math.floor(Math.random() * 50) + 10
      },
      month: {
        sales: Math.floor(baseRevenue * 3),
        profit: Math.floor(baseRevenue * 0.8),
        orders: Math.floor(Math.random() * 200) + 50
      }
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const performHealthCheck = async () => {
    if (!currentBusiness?.id) return;
    
    setHealthCheckLoading(true);
    setHealthCheckResult(null);
    
    try {
      const startTime = Date.now();
      const result = await salesAPI.healthCheck(currentBusiness.id);
      const endTime = Date.now();
      
      setHealthCheckResult({
        ...result,
        frontend_time: `${endTime - startTime}ms`,
        status: 'success'
      });
    } catch (error) {
      const endTime = Date.now();
      setHealthCheckResult({
        status: 'error',
        error: error.message,
        frontend_time: `${endTime - startTime}ms`
      });
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada':
      case 'sent':
      case 'delivered':
        return 'badge-success';
      case 'pendiente':
      case 'failed':
        return 'badge-error';
      case 'en_progreso':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
      case 'urgente':
        return 'border-l-red-500';
      case 'media':
        return 'border-l-yellow-500';
      case 'baja':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getTaskPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
      case 'urgente':
        return 'badge-error';
      case 'media':
        return 'badge-warning';
      case 'baja':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Obtener datos actuales del cache
  const currentStats = dashboardStatsCache[selectedPeriod] || {
    total_sales: 0,
    estimated_profit: 0,
    new_customers: 0
  };
  
  const topItems = topItemsCache[selectedPeriod] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido de vuelta, aquí tienes el resumen de tu negocio</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={performHealthCheck}
              disabled={healthCheckLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {healthCheckLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Diagnóstico
            </button>
            <button
              onClick={() => navigate('/my-businesses')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Mis Negocios
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Resultados del Diagnóstico */}
        {healthCheckResult && (
          <div className="mb-8">
            <div className={`rounded-lg p-4 border ${
              healthCheckResult.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {healthCheckResult.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-semibold ${
                  healthCheckResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  Diagnóstico de Conectividad
                </h3>
              </div>
              
              {healthCheckResult.status === 'success' ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Ventas:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.ventas_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Productos:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.productos_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Backend:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.response_time}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Frontend:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.frontend_time}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="text-red-700">
                    <strong>Error:</strong> {healthCheckResult.error}
                  </div>
                  <div className="text-gray-600">
                    Tiempo transcurrido: {healthCheckResult.frontend_time}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setHealthCheckResult(null)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Resumen del Negocio */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Resumen del Negocio</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodChange('today')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'today' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {statsLoading && selectedPeriod === 'today' && (
                  <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Hoy
              </button>
              <button
                onClick={() => handlePeriodChange('week')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'week' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {statsLoading && selectedPeriod === 'week' && (
                  <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Semana
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'month' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {statsLoading && selectedPeriod === 'month' && (
                  <div className="inline-block w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Mes
              </button>
            </div>
          </div>

          {/* Cards de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Ventas Totales */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-600">Ventas Totales</span>
                </div>
              </div>
              <div className="space-y-1">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      ${(currentStats.total_sales || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12% vs período anterior</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ganancia Neta */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Ganancia Neta</span>
                </div>
              </div>
              <div className="space-y-1">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      ${(currentStats.estimated_profit || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Margen: {currentStats.total_sales > 0 
                        ? Math.round((currentStats.estimated_profit / currentStats.total_sales) * 100) 
                        : 0}%
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Nuevos Clientes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium text-gray-600">Nuevos Clientes</span>
                </div>
              </div>
              <div className="space-y-1">
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentStats.new_customers || 0}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span>-3% vs período anterior</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Productos Top */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-600">Productos Top</span>
                </div>
              </div>
              <div className="space-y-2">
                {statsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    {topItems.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 truncate">{item.nombre}</span>
                        <span className="text-sm font-medium text-gray-900">{item.cantidad_total}</span>
                      </div>
                    ))}
                    {topItems.length === 0 && (
                      <div className="text-sm text-gray-500">Sin datos</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertas Inteligentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Alertas Inteligentes</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Tu COO virtual detectó estas situaciones importantes</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Alert Items */}
                  <div className="flex items-start gap-4 p-4 border-l-4 border-red-400 bg-white rounded-lg border border-gray-100">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">El stock de Producto A se agotará en 3 días</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-full mt-2">
                        Alta
                      </span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '4px',
                        color: '#9ca3af'
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 p-4 border-l-4 border-red-400 bg-white rounded-lg border border-gray-100">
                    <Clock className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Juan Pérez tiene 3 tareas atrasadas</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-full mt-2">
                        Alta
                      </span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '4px',
                        color: '#9ca3af'
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 p-4 border-l-4 border-yellow-400 bg-white rounded-lg border border-gray-100">
                    <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Podés aumentar el precio de Servicio Premium en 15%</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-yellow-600 bg-white border border-yellow-200 rounded-full mt-2">
                        Media
                      </span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '4px',
                        color: '#9ca3af'
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 p-4 border-l-4 border-gray-300 bg-white rounded-lg border border-gray-100">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Falta facturar la venta a Cliente XYZ por $2,500</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full mt-2">
                        Baja
                      </span>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '4px',
                        color: '#9ca3af'
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                <p className="text-sm text-gray-600 mt-1">Accede rápidamente a las funciones más usadas</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => navigate(`/business/${currentBusiness?.id}/pos`)}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Nueva Venta</span>
                  </button>

                  <button 
                    onClick={() => navigate(`/business/${currentBusiness?.id}/products`)}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Nuevo Producto</span>
                  </button>

                  <button 
                    onClick={() => navigate(`/business/${currentBusiness?.id}/customers`)}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                      <Users className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Añadir Cliente</span>
                  </button>

                  <button 
                    onClick={() => navigate(`/business/${currentBusiness?.id}/tasks`)}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Plus className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Asignar Tarea</span>
                  </button>

                  <button 
                    onClick={() => navigate(`/business/${currentBusiness?.id}/products/import`)}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group col-span-2"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Upload className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Importar desde Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}