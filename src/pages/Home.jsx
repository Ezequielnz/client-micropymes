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
  Shield
} from 'lucide-react';

// Componente Button simple sin dependencias externas
const SimpleButton = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
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

function Home() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  
  // Función manual para cargar datos
  const loadData = async () => {
    console.log('Loading data manually...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user data and businesses...');
      
      const userData = await authAPI.getCurrentUser();
      console.log('User data received:', userData);
      setUser(userData);
      
      const businessesData = await businessAPI.getBusinesses();
      console.log('Businesses data received:', businessesData);
      setBusinesses(businessesData || []);
      
      setDataLoaded(true);
      console.log('Data fetching completed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Si hay un error con el token, redirigir al login
      if (error.response?.status === 401) {
        console.log('Unauthorized, removing token and redirecting to login');
        localStorage.removeItem('token');
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
    
    console.log('Token found, ready to load data when requested');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
      {/* Simple Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
              <h1 className="text-2xl font-bold text-gray-900">BizFlow Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/create-business">
                <SimpleButton variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Negocio
                </SimpleButton>
              </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600 mb-6">
            Gestiona tus negocios desde un solo lugar
          </p>
          
          {!dataLoaded && !loading && (
            <SimpleButton onClick={loadData} className="bg-blue-600 hover:bg-blue-700 text-white">
              Cargar mis datos
            </SimpleButton>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Usuario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">
                    {(user.nombre || 'N/A')} {(user.apellido || '')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-medium text-gray-900 capitalize">{user.rol || 'usuario'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Businesses Section */}
        {dataLoaded && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Negocios</h2>
              <Link to="/create-business">
                <SimpleButton className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Negocio
                </SimpleButton>
              </Link>
            </div>

            {businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div key={business.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {business.nombre || 'Sin nombre'}
                          </h3>
                          {business.descripcion && (
                            <p className="text-gray-600 text-sm">
                              {business.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/products`)}
                          className="text-gray-700 hover:text-blue-600"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Productos
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/categories`)}
                          className="text-gray-700 hover:text-green-600"
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Categorías
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/customers`)}
                          className="text-gray-700 hover:text-purple-600"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Clientes
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/pos`)}
                          className="text-gray-700 hover:text-orange-600"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          POS
                        </SimpleButton>
                      </div>
                      
                      <SimpleButton 
                        size="sm"
                        onClick={() => navigate(`/business/${business.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Ver Dashboard
                      </SimpleButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes negocios registrados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea tu primer negocio para comenzar a gestionar productos, clientes y ventas.
                  </p>
                  <Link to="/create-business">
                    <SimpleButton className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Mi Primer Negocio
                    </SimpleButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 