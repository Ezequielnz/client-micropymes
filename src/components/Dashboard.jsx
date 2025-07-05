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
  const [error, setError] = useState('');
  
  // Estados para datos reales
  const [salesData, setSalesData] = useState({
    today: { sales: 0, profit: 0, orders: 0 },
    week: { sales: 0, profit: 0, orders: 0 },
    month: { sales: 0, profit: 0, orders: 0 }
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

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

  // Cargar datos del negocio actual cuando cambie
  useEffect(() => {
    if (currentBusiness) {
      loadBusinessData();
    }
  }, [currentBusiness, selectedPeriod]);

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
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessData = async () => {
    if (!currentBusiness) return;
    
    try {
      // Cargar datos secuencialmente para evitar saturar el servidor
      console.log('Loading business data for:', currentBusiness.nombre);
      
      // Primero cargar productos
      const productsData = await productAPI.getProducts(currentBusiness.id).catch((err) => {
        console.error('Error loading products:', err);
        return [];
      });
      
      // Luego clientes
      const customersData = await customerAPI.getCustomers(currentBusiness.id).catch((err) => {
        console.error('Error loading customers:', err);
        return [];
      });
      
      // Después tareas
      const tasksData = await tasksAPI.getTasks(currentBusiness.id, { limit: 5 }).catch((err) => {
        console.error('Error loading tasks:', err);
        return { tareas: [] };
      });
      
      // Finalmente estadísticas de tareas
      const taskStatsData = await tasksAPI.getTaskStatistics(currentBusiness.id).catch((err) => {
        console.error('Error loading task statistics:', err);
        return null;
      });

      setProducts(productsData || []);
      setCustomers(customersData || []);
      setTasks(tasksData.tareas || []);
      setTaskStats(taskStatsData);

      // Simular datos de ventas basados en productos
      const simulatedSales = generateSalesData(productsData || []);
      setSalesData(simulatedSales);

      // Productos más vendidos (simulado)
      const topProductsData = (productsData || []).slice(0, 3).map((product, index) => ({
        name: product.nombre,
        sold: Math.floor(Math.random() * 50) + 10,
        revenue: (Math.floor(Math.random() * 50) + 10) * product.precio_venta
      }));
      setTopProducts(topProductsData);

      // Ventas recientes (simulado)
      const recentSalesData = (productsData || []).slice(0, 4).map((product, index) => ({
        id: index + 1,
        product: product.nombre,
        client: customersData[index % customersData.length]?.nombre || 'Cliente Anónimo',
        amount: product.precio_venta,
        date: `Hace ${index + 1} horas`,
        invoiced: Math.random() > 0.5
      }));
      setRecentSales(recentSalesData);

    } catch (err) {
      console.error('Error loading business data:', err);
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

  if (loading) {
    return <PageLoader message="Cargando dashboard..." variant="primary" />;
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-erp-error mx-auto mb-4" />
          <p className="text-erp-error mb-4">{error}</p>
          <Button onClick={loadInitialData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-sm">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/my-businesses')} className="text-sm">
              <Building2 className="h-4 w-4 mr-2" />
              Mis Negocios
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
            <div className="w-8 h-8 bg-erp-neutral-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-erp-neutral-600">
                {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-main space-y-6">
        {/* Resumen del Negocio */}
        <section>
          <div>
            <h2 className="dashboard-title">¡Hola {user?.nombre}! Aquí tienes el resumen de tu negocio
            {currentBusiness && ` "${currentBusiness.nombre}"`}</h2>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Resumen del Negocio</h2>
            <div className="flex gap-1">
              {['today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="metric-label">Ventas Totales</div>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="metric-value">
                ${salesData[selectedPeriod].sales.toLocaleString()}
              </div>
              <div className="metric-change">
                <TrendingUp className="h-3 w-3 text-erp-success-600" />
                Datos estimados
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="metric-label">Ganancia Estimada</div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="metric-value">
                ${salesData[selectedPeriod].profit.toLocaleString()}
              </div>
              <div className="metric-change">Margen estimado: 25%</div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="metric-label">Órdenes</div>
                <ShoppingCart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="metric-value">
                {salesData[selectedPeriod].orders}
              </div>
              <div className="metric-change">
                <TrendingDown className="h-3 w-3 text-erp-error-600" />
                -3% vs período anterior
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="metric-label">Productos Top</div>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                {topProducts.slice(0, 2).map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate text-gray-700">{product.name}</span>
                    <span className="font-medium text-gray-900">{product.sold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alertas Inteligentes */}
          <div className="lg:col-span-2">
            <div className="dashboard-card">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Alertas Inteligentes</h3>
                </div>
                <p className="text-sm text-gray-600">Tu asistente virtual detectó estas situaciones importantes</p>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-card ${
                        alert.priority === 'high' ? 'alert-high' : 
                        alert.priority === 'medium' ? 'alert-medium' : 'alert-low'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{alert.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <span
                              className={`modern-badge mt-2 ${
                                alert.priority === 'high' ? 'badge-error' : 
                                alert.priority === 'medium' ? 'badge-warning' : 'badge-success'
                              }`}
                            >
                              {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div>
            <div className="dashboard-card">
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Acciones Rápidas</h3>
                <p className="text-sm text-gray-600">Accede rápidamente a las funciones más usadas</p>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate(`/sales/${currentBusiness?.id}`)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Nueva Venta</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate(`/products/${currentBusiness?.id}`)}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-xs">Nuevo Producto</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate(`/customers/${currentBusiness?.id}`)}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Añadir Cliente</span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate(`/tasks/${currentBusiness?.id}`)}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Asignar Tarea</span>
                  </button>
                  <button 
                    className="quick-action-btn col-span-2"
                    onClick={() => navigate(`/import/${currentBusiness?.id}`)}
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Importar desde Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tareas del Día */}
          <div className="dashboard-card">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tareas del Día</h3>
                  <p className="text-sm text-gray-600">Gestiona las tareas pendientes del equipo</p>
                </div>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => navigate(`/tasks/${currentBusiness?.id}`)}
                >
                  Ver todas
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`task-status-dot ${
                            task.estado === 'completada' ? 'task-status-completed' :
                            task.estado === 'en_progreso' ? 'task-status-in-progress' : 'task-status-pending'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`modern-badge ${getTaskPriorityColor(task.prioridad)}`}>
                                {task.prioridad}
                              </span>
                              <span className="text-xs text-gray-500">
                                {task.fecha_fin ? new Date(task.fecha_fin).toLocaleDateString() : 'Sin fecha'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`modern-badge ${getStatusColor(task.estado)}`}>
                          {task.estado === 'completada' ? 'Completada' :
                           task.estado === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Clock className="h-12 w-12 mx-auto mb-4" />
                    <p className="mb-4">No hay tareas registradas</p>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => navigate(`/tasks/${currentBusiness?.id}`)}
                    >
                      Crear primera tarea
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ventas Recientes */}
          <div className="dashboard-card">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ventas Recientes</h3>
                  <p className="text-sm text-gray-600">Últimas transacciones registradas</p>
                </div>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => navigate(`/sales-reports/${currentBusiness?.id}`)}
                >
                  Ver reportes
                </button>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <div key={sale.id} className="sale-item">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sale.product}</p>
                          <p className="text-xs text-gray-500">{sale.client} • {sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${sale.amount.toLocaleString()}</p>
                          <span className={`modern-badge ${sale.invoiced ? 'badge-success' : 'badge-warning'}`}>
                            {sale.invoiced ? 'Facturado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                    <p className="mb-4">No hay ventas registradas</p>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => navigate(`/sales/${currentBusiness?.id}`)}
                    >
                      Registrar primera venta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Tareas */}
        {taskStats && (
          <div className="dashboard-card">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas de Tareas</h3>
              <p className="text-sm text-gray-600">Resumen del desempeño del equipo</p>
            </div>
            <div className="px-6 pb-6">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value text-gray-900">{taskStats.total || 0}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value text-green-600">{taskStats.completadas || 0}</div>
                  <div className="stat-label">Completadas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value text-yellow-600">{taskStats.en_progreso || 0}</div>
                  <div className="stat-label">En Progreso</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value text-red-600">{taskStats.pendientes || 0}</div>
                  <div className="stat-label">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Productos Top */}
        {topProducts.length > 0 && (
          <div className="dashboard-card">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos Destacados</h3>
              <p className="text-sm text-gray-600">Productos con mejor rendimiento estimado</p>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="sale-item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="product-rank">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sold} ventas estimadas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">${product.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Ingresos est.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}