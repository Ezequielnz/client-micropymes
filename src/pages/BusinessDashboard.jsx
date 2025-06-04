import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { businessAPI, authAPI } from '../utils/api';
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
  Activity
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

      // Simular estadísticas (aquí irían las llamadas reales a la API)
      setStats({
        totalProducts: 45,
        totalCustomers: 128,
        totalSales: 234,
        monthlyRevenue: 15420.50,
        lowStockProducts: 8,
        pendingOrders: 12
      });

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    
    navigate('/login');
    
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/home')}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
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
                Dashboard de {business?.nombre}
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
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-green-600 mt-1">+12% este mes</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  <p className="text-sm text-green-600 mt-1">+8% este mes</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSales}</p>
                  <p className="text-sm text-green-600 mt-1">+15% este mes</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">+22% este mes</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/products`)}
                  >
                    <Package className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Gestionar Productos</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/customers`)}
                  >
                    <Users className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Ver Clientes</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/pos`)}
                  >
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Punto de Venta</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/categories`)}
                  >
                    <Tag className="h-6 w-6 text-orange-600" />
                    <span className="text-sm">Categorías</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/users`)}
                  >
                    <Shield className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm">Gestionar Usuarios</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => navigate(`/business/${businessId}/reports`)}
                  >
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm">Reportes</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => alert('Próximamente: Configuración AFIP')}
                  >
                    <Receipt className="h-6 w-6 text-red-600" />
                    <span className="text-sm">Config. AFIP</span>
                  </Button>
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
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Stock bajo
                      </p>
                      <p className="text-sm text-orange-600">
                        {stats.lowStockProducts} productos con stock bajo
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
                        {stats.pendingOrders} pedidos por procesar
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Ventas del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de ventas</p>
                  <p className="text-sm text-gray-400">Próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Productos más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Análisis de productos</p>
                  <p className="text-sm text-gray-400">Próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nueva venta registrada</p>
                  <p className="text-sm text-gray-600">Venta #234 por $1,250.00</p>
                </div>
                <span className="text-sm text-gray-500">Hace 2 horas</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Producto agregado</p>
                  <p className="text-sm text-gray-600">Nuevo producto "Laptop HP" agregado al inventario</p>
                </div>
                <span className="text-sm text-gray-500">Hace 4 horas</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nuevo cliente registrado</p>
                  <p className="text-sm text-gray-600">María González se registró como cliente</p>
                </div>
                <span className="text-sm text-gray-500">Ayer</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BusinessDashboard; 