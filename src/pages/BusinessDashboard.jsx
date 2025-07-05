import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { businessAPI, authAPI, salesAPI, tasksAPI } from '../utils/api';
import {
  Building2,
  Package,
  Tag,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  ArrowLeft,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Receipt,
  PieChart,
  Activity,
  Wrench,
  UserCheck,
  ClipboardList
} from 'lucide-react';

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

function BusinessDashboard() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlySalesData, setMonthlySalesData] = useState(null);
  const [topProductsData, setTopProductsData] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [taskNotifications, setTaskNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [businessId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del usuario
      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Cargar datos del negocio
      const businessData = await businessAPI.getBusinessById(businessId);
      setBusiness(businessData);

      // Obtener rol del usuario actual en este negocio
      try {
        const businessUsers = await businessAPI.getBusinessUsers(businessId);
        const currentUserInBusiness = businessUsers.find(u => u.usuario?.email === userData.email);
        setUserRole(currentUserInBusiness?.rol || 'empleado');
        setUserPermissions(currentUserInBusiness?.permisos || {});
      } catch (err) {
        console.error('Error loading user role:', err);
        setUserRole('empleado'); // Default role
        setUserPermissions({}); // Default permissions
      }

      // Cargar estadísticas reales desde la API
      try {
        const statsData = await salesAPI.getDashboardStats(businessId);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        // Fallback to default values if stats fail to load
        setStats({
          totalProducts: 0,
          totalCustomers: 0,
          totalSales: 0,
          monthlyRevenue: 0,
          lowStockProducts: 0,
          pendingOrders: 0
        });
      }

      // Cargar actividad reciente
      try {
        const activityData = await salesAPI.getRecentActivity();
        setRecentActivity(activityData.actividades || []);
      } catch (err) {
        console.error('Error loading recent activity:', err);
        setRecentActivity([]);
      }

      // Cargar datos de gráfico de ventas mensuales
      try {
        const monthlySales = await salesAPI.getMonthlySalesChart();
        setMonthlySalesData(monthlySales);
      } catch (err) {
        console.error('Error loading monthly sales chart:', err);
        setMonthlySalesData(null);
      }

      // Cargar datos de productos más vendidos
      try {
        const topProducts = await salesAPI.getTopProductsChart();
        setTopProductsData(topProducts);
      } catch (err) {
        console.error('Error loading top products chart:', err);
        setTopProductsData(null);
      }

      // Cargar tareas del usuario
      try {
        const tasksData = await tasksAPI.getTasks(businessId, {
          por_pagina: 5,
          estado: 'pendiente,en_progreso'
        });
        
        setUserTasks(tasksData.tareas || []);
        
        // Filtrar tareas asignadas al usuario actual para notificaciones
        // Comparar usando el email del usuario ya que es único y está disponible en ambos objetos
        const userTaskNotifications = (tasksData.tareas || [])
          .filter(task => {
            // Solo mostrar notificaciones si la tarea está asignada al usuario actual
            // y no es el creador de la tarea
            return task.asignada_a && 
                   task.asignada_a.email === userData.email &&
                   task.asignada_a.email !== (task.creada_por?.email || '');
          })
          .slice(0, 3); // Máximo 3 notificaciones
        setTaskNotifications(userTaskNotifications);
      } catch (err) {
        console.error('Error loading user tasks:', err);
        setUserTasks([]);
        setTaskNotifications([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar permisos
  const hasPermission = (module, action = 'ver') => {
    if (userRole === 'admin') return true;
    return userPermissions?.[`puede_${action}_${module}`] || false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    
    navigate('/login');
    
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="flex items-center gap-3 text-mp-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-mp-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mp-text mb-2">Error</h3>
            <p className="text-mp-text-secondary mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={loadDashboardData} className="w-full">
                Reintentar
              </Button>
              <Button onClick={() => navigate('/home')} variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/home')}
                className="text-mp-text-secondary hover:text-mp-primary hover:bg-mp-primary-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-mp-primary rounded-lg mr-3 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {business?.nombre || 'Mi Negocio'}
                  </h1>
                  <p className="text-sm text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Hola, {user?.nombre || 'Usuario'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Panel de control de {business?.nombre}
              </h2>
              <p className="text-gray-600 mt-1">
                Resumen general de tu negocio y métricas importantes
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Acción rápida
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {hasPermission('productos') && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                    <p className="text-sm text-mp-success mt-1">+12% este mes</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <Package className="h-6 w-6 text-mp-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('clientes') && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
                    <p className="text-sm text-green-600 mt-1">+8% este mes</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('ventas') && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ventas</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSales || 0}</p>
                    <p className="text-sm text-green-600 mt-1">+15% este mes</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('ventas') && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(stats.monthlyRevenue || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">+22% este mes</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Tasks Section */}
        {userTasks.filter(task => 
          task.asignada_a && task.asignada_a.email === user?.email
        ).length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-orange-600" />
                    Mis tareas pendientes
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/business/${businessId}/tasks`)}
                  >
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTasks
                    .filter(task => task.asignada_a && task.asignada_a.email === user?.email)
                    .slice(0, 3)
                    .map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate">{task.titulo}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
                          task.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                          task.prioridad === 'media' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.prioridad}
                        </span>
                      </div>
                      {task.descripcion && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.descripcion}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          task.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          task.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.estado === 'en_progreso' ? 'En progreso' : 
                           task.estado === 'pendiente' ? 'Pendiente' : task.estado}
                        </span>
                        {task.fecha_fin && (
                          <span>
                            {new Date(task.fecha_fin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Accesos Directos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {hasPermission('productos') && (
                    <Button
                      variant="outline"
                      className="h-24 flex-col space-y-3 text-center"
                      onClick={() => navigate(`/business/${businessId}/products-and-services`)}
                    >
                      <Package className="h-8 w-8 text-blue-600" />
                      <span className="text-base font-medium">Productos y Servicios</span>
                    </Button>
                  )}
                  
                  {hasPermission('ventas') && (
                    <Button
                      variant="outline"
                      className="h-24 flex-col space-y-3 text-center"
                      onClick={() => navigate(`/business/${businessId}/pos`)}
                    >
                      <ShoppingCart className="h-8 w-8 text-purple-600" />
                      <span className="text-base font-medium">Ventas (POS)</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-3 text-center"
                    onClick={() => navigate(`/business/${businessId}/tasks`)}
                  >
                    <ClipboardList className="h-8 w-8 text-orange-600" />
                    <span className="text-base font-medium">Tareas</span>
                  </Button>
                  
                  {hasPermission('clientes') && (
                    <Button
                      variant="outline"
                      className="h-24 flex-col space-y-3 text-center"
                      onClick={() => navigate(`/business/${businessId}/customers`)}
                    >
                      <Users className="h-8 w-8 text-green-600" />
                      <span className="text-base font-medium">Clientes</span>
                    </Button>
                  )}
                  
                  {/* Usuarios - Solo visible para admins */}
                  {userRole === 'admin' && (
                    <Button
                      variant="outline"
                      className="h-24 flex-col space-y-3 text-center"
                      onClick={() => navigate(`/business/${businessId}/users`)}
                    >
                      <UserCheck className="h-8 w-8 text-indigo-600" />
                      <span className="text-base font-medium">Usuarios</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Notificaciones de tareas asignadas */}
                  {taskNotifications.length > 0 && taskNotifications.map((task, index) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <ClipboardList className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">
                          Tarea asignada: {task.titulo}
                        </p>
                        <p className="text-sm text-orange-600">
                          {task.fecha_fin ? `Vence: ${new Date(task.fecha_fin).toLocaleDateString()}` : 'Sin fecha límite'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-100"
                        onClick={() => navigate(`/business/${businessId}/tasks`)}
                      >
                        Ver
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Stock bajo
                      </p>
                      <p className="text-sm text-orange-600">
                        {stats.lowStockProducts || 0} productos con stock bajo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Pedidos pendientes
                      </p>
                      <p className="text-sm text-blue-600">
                        {stats.pendingOrders || 0} pedidos por procesar
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Sistema actualizado
                      </p>
                      <p className="text-sm text-green-600">
                        Todas las funciones operativas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Analytics */}
        {hasPermission('ventas') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Ventas del Mes
                  {monthlySalesData && (
                    <span className="text-sm font-normal text-gray-500">
                      ({monthlySalesData.mes})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlySalesData && monthlySalesData.datos.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{monthlySalesData.total_ventas}</p>
                        <p className="text-sm text-blue-600">Ventas totales</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          ${monthlySalesData.total_ingresos.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">Ingresos totales</p>
                      </div>
                    </div>
                    <div className="h-32 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Últimos días con ventas:</p>
                      <div className="flex flex-wrap gap-2">
                        {monthlySalesData.datos.slice(-7).map((dia, index) => (
                          <div key={index} className="bg-white px-2 py-1 rounded text-xs">
                            <span className="font-medium">Día {dia.dia}:</span> {dia.ventas} ventas
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sin ventas este mes</p>
                      <p className="text-sm text-gray-400">Realiza tu primera venta para ver estadísticas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Productos más Vendidos
                  {topProductsData && (
                    <span className="text-sm font-normal text-gray-500">
                      ({topProductsData.periodo})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProductsData && topProductsData.datos.length > 0 ? (
                  <div className="space-y-3">
                    {topProductsData.datos.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.nombre}</p>
                            <p className="text-sm text-gray-600 capitalize">{item.tipo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{item.cantidad_total}</p>
                          <p className="text-sm text-gray-600">vendidos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sin datos de ventas</p>
                      <p className="text-sm text-gray-400">Realiza ventas para ver productos populares</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((actividad, index) => {
                  const getIcon = (tipo) => {
                    switch (tipo) {
                      case 'venta': return <ShoppingCart className="h-5 w-5 text-green-600" />;
                      case 'producto': return <Package className="h-5 w-5 text-blue-600" />;
                      case 'cliente': return <Users className="h-5 w-5 text-purple-600" />;
                      default: return <Activity className="h-5 w-5 text-gray-600" />;
                    }
                  };

                  const getColorClass = (color) => {
                    switch (color) {
                      case 'green': return 'bg-green-100';
                      case 'blue': return 'bg-blue-100';
                      case 'purple': return 'bg-purple-100';
                      default: return 'bg-gray-100';
                    }
                  };

                  const formatearFecha = (fechaStr) => {
                    try {
                      const fecha = new Date(fechaStr);
                      const ahora = new Date();
                      const diferencia = ahora - fecha;
                      const horas = Math.floor(diferencia / (1000 * 60 * 60));
                      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

                      if (dias > 0) {
                        return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
                      } else if (horas > 0) {
                        return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
                      } else {
                        return 'Hace menos de 1 hora';
                      }
                    } catch (error) {
                      return 'Recientemente';
                    }
                  };

                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClass(actividad.color)}`}>
                        {getIcon(actividad.tipo)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{actividad.titulo}</p>
                        <p className="text-sm text-gray-600">{actividad.descripcion}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatearFecha(actividad.fecha)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay actividad reciente</p>
                <p className="text-sm text-gray-400">La actividad aparecerá aquí cuando realices acciones en tu negocio</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BusinessDashboard; 