import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, businessAPI } from '../utils/api';
import { 
  Building2, 
  Plus, 
  Package, 
  Tag, 
  Users, 
  ShoppingCart,
  LogOut,
  Loader2,
  User,
  Mail,
  Shield,
  Bell,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  ArrowRight,
  Activity,
  Target,
  Zap,
  UserCheck,
  UserX,
  XCircle
} from 'lucide-react';

// Componente Button simple sin dependencias externas
const SimpleButton = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Componente Card simple
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

function Home() {
  const [user, setUser] = useState(null);
  const [businessCount, setBusinessCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  // Función manual para cargar datos del centro de notificaciones
  const loadData = async () => {
    console.log('Loading notification center data...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user data and business summary...');
      
      const userData = await authAPI.getCurrentUser();
      console.log('User data received:', userData);
      setUser(userData);
      
      const businessesData = await businessAPI.getBusinesses();
      console.log('Businesses data received:', businessesData);
      setBusinessCount(businessesData?.length || 0);
      
      // Cargar notificaciones reales de todos los negocios
      const allNotifications = [];
      for (const business of businessesData || []) {
        try {
          const businessNotifications = await businessAPI.getNotifications(business.id);
          allNotifications.push(...businessNotifications.map(notif => ({
            ...notif,
            businessName: business.nombre,
            businessId: business.id
          })));
        } catch (error) {
          console.error(`Error loading notifications for business ${business.id}:`, error);
        }
      }
      
      // Convertir notificaciones de aprobación a formato del UI
      const formattedNotifications = allNotifications.map(notif => {
        if (notif.type === 'approval_request') {
          return {
            id: notif.id,
            type: 'approval',
            title: notif.title,
            message: `${notif.message} en "${notif.businessName}"`,
            time: new Date(notif.time).toLocaleString(),
            icon: UserCheck,
            color: 'blue',
            data: notif.data
          };
        }
        return notif;
      });
      
      setNotifications(formattedNotifications);
      setDataLoaded(true);
      console.log('Notification center data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Si hay un error con el token, redirigir al login
      if (error.response?.status === 401) {
        console.log('Unauthorized, removing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
        navigate('/login');
      } else {
        console.log('Non-auth error, staying on page');
        setError(error.message || 'Error loading data');
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('Home component mounted');
    
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Verificar estado de aprobación automáticamente
    const checkApprovalStatus = async () => {
      try {
        const businessesData = await businessAPI.getBusinesses();
        if (!businessesData || businessesData.length === 0) {
          console.log('No approved businesses found, redirecting to pending approval');
          navigate('/pending-approval');
          return;
        }
        console.log('User has approved businesses, can access home');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('User pending approval, redirecting');
          navigate('/pending-approval');
        } else if (error.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.clear();
          navigate('/login');
        }
      }
    };
    
    checkApprovalStatus();
  }, [navigate]);

  const handleLogout = () => {
    // Limpiar completamente el localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear(); // Limpia todo el localStorage por seguridad
    
    // Navegar al login
    navigate('/login');
    
    // Opcional: recargar la página para asegurar que no quede estado residual
    window.location.href = '/login';
  };

  const handleApproveUser = async (notification) => {
    try {
      await businessAPI.approveUser(notification.data.business_id, notification.data.usuario_negocio_id);
      // Recargar notificaciones
      await loadData();
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Error al aprobar usuario');
    }
  };

  const handleRejectUser = async (notification) => {
    try {
      await businessAPI.rejectUser(notification.data.business_id, notification.data.usuario_negocio_id);
      // Recargar notificaciones
      await loadData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Error al rechazar usuario');
    }
  };
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-lg font-medium mb-4">
            Error: {error}
          </div>
          <div className="space-y-3">
            <SimpleButton onClick={() => window.location.reload()} className="w-full">
              Recargar página
            </SimpleButton>
            <SimpleButton onClick={loadData} variant="outline" className="w-full">
              Reintentar
            </SimpleButton>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
              <h1 className="text-2xl font-bold text-gray-900">BizFlow Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SimpleButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/my-businesses')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Mis Negocios
              </SimpleButton>
              <SimpleButton 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </SimpleButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Notificaciones</h1>
          <p className="text-lg text-gray-600 mb-6">
            Mantente al día con las novedades de tus negocios
          </p>
          
          {!dataLoaded && !loading && (
            <SimpleButton onClick={loadData} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Activity className="h-4 w-4 mr-2" />
              Cargar Notificaciones
            </SimpleButton>
          )}
        </div>

        {/* Quick Stats */}
        {dataLoaded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mis Negocios</p>
                    <p className="text-3xl font-bold text-gray-900">{businessCount}</p>
                    <p className="text-sm text-blue-600 mt-1">Activos</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notificaciones</p>
                    <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                    <p className="text-sm text-orange-600 mt-1">Pendientes</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuario</p>
                    <p className="text-lg font-bold text-gray-900">{user?.nombre || 'Usuario'}</p>
                    <p className="text-sm text-green-600 mt-1">Conectado</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access */}
        {dataLoaded && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Acceso Rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SimpleButton
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-blue-50"
                    onClick={() => navigate('/my-businesses')}
                  >
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Mis Negocios</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-green-50"
                    onClick={() => navigate('/create-business')}
                  >
                    <Plus className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Crear Negocio</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-purple-50"
                    onClick={() => alert('Próximamente: Reportes Globales')}
                  >
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Reportes</span>
                  </SimpleButton>
                  
                  <SimpleButton
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-orange-50"
                    onClick={() => alert('Próximamente: Configuración')}
                  >
                    <Shield className="h-6 w-6 text-orange-600" />
                    <span className="text-sm">Configuración</span>
                  </SimpleButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications */}
        {dataLoaded && notifications.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Notificaciones Recientes
                  </CardTitle>
                  <SimpleButton variant="ghost" size="sm">
                    Ver todas
                  </SimpleButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    const colorClasses = {
                      blue: 'bg-blue-50 border-blue-200 text-blue-800',
                      green: 'bg-green-50 border-green-200 text-green-800',
                      orange: 'bg-orange-50 border-orange-200 text-orange-800',
                      red: 'bg-red-50 border-red-200 text-red-800'
                    };
                    
                    return (
                      <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border ${colorClasses[notification.color]}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[notification.color]}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          
                          {/* Botones de acción para notificaciones de aprobación */}
                          {notification.type === 'approval' && (
                            <div className="flex gap-2 mt-3">
                              <SimpleButton
                                onClick={() => handleApproveUser(notification)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprobar
                              </SimpleButton>
                              <SimpleButton
                                onClick={() => handleRejectUser(notification)}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-3 py-1"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rechazar
                              </SimpleButton>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {dataLoaded && notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600 mb-6">
              No tienes notificaciones pendientes en este momento.
            </p>
            <SimpleButton 
              onClick={() => navigate('/my-businesses')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Ir a Mis Negocios
            </SimpleButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 