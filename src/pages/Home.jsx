import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, businessAPI } from '../utils/api';
import Dashboard from '../components/Dashboard';
import { PageLoader } from '../components/LoadingSpinner';
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
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Componente Card simple
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
        setDataLoaded(true);
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
          <div className="text-erp-error text-lg font-medium mb-4">
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
    return <PageLoader message="Cargando datos del usuario..." variant="primary" />;
  }

  // Si los datos están cargados, mostrar el Dashboard
  if (dataLoaded) {
    return <Dashboard />;
  }

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-erp-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-erp-primary rounded-lg mr-3"></div>
              <h1 className="text-2xl font-bold text-erp-neutral-900">MicroPymes</h1>
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
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-erp-primary"></div>
          </div>
          <h1 className="text-2xl font-bold text-erp-neutral-900 mb-2">Verificando acceso...</h1>
          <p className="text-erp-neutral-600">
            Preparando tu dashboard personalizado
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home; 