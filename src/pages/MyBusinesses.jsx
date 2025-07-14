import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, businessAPI } from '../utils/api';
import PageHeader from '../components/PageHeader';
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
  ArrowLeft,
  Eye,
  Settings,
  MoreVertical,
  Calendar,
  Activity,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';

// Componente Button simple sin dependencias externas
const SimpleButton = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
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

// Componente Modal de confirmación
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, businessName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-3">{message}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 font-medium">"{businessName}"</p>
            <p className="text-red-600 text-sm mt-1">
              Esta acción eliminará permanentemente:
            </p>
            <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
              <li>Todos los productos</li>
              <li>Todas las categorías</li>
              <li>Todos los clientes</li>
              <li>Todas las ventas</li>
              <li>Toda la configuración</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <SimpleButton 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancelar
          </SimpleButton>
          <SimpleButton 
            variant="destructive" 
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </SimpleButton>
        </div>
      </div>
    </div>
  );
};

function MyBusinesses() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, business: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
  // Función manual para cargar datos
  const loadData = async () => {
    console.log('Loading businesses data...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user data and businesses...');
      
      // Cargar datos secuencialmente para evitar timeouts
      const userData = await authAPI.getCurrentUser();
      console.log('User data received:', userData);
      setUser(userData);
      
      // Esperar un poco antes de la siguiente petición
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const businessesData = await businessAPI.getBusinesses();
      console.log('Businesses data received:', businessesData);
      setBusinesses(businessesData || []);
      
      setDataLoaded(true);
      console.log('Data fetching completed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Manejo específico para timeouts
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError('La conexión tardó demasiado tiempo. Verifica tu conexión a internet e intenta nuevamente.');
      } else if (error.response?.status === 401) {
        console.log('Unauthorized, removing token and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
        navigate('/login');
      } else {
        console.log('Non-auth error, staying on page');
        const errorMessage = error.response?.data?.detail || error.message || 'Error loading data';
        setError(errorMessage);
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('MyBusinesses component mounted');
    
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Cargar datos automáticamente
    loadData();
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
  
  // Función para manejar el menú desplegable
  const toggleMenu = (businessId) => {
    setOpenMenuId(openMenuId === businessId ? null : businessId);
  };

  // Función para cerrar el menú cuando se hace clic fuera
  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Función para abrir el modal de confirmación
  const openDeleteModal = (business) => {
    setDeleteModal({ isOpen: true, business });
    setOpenMenuId(null); // Cerrar el menú
  };

  // Función para cerrar el modal de confirmación
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, business: null });
  };

  // Función para eliminar el negocio
  const handleDeleteBusiness = async () => {
    if (!deleteModal.business) return;

    setDeleting(true);
    try {
      await businessAPI.deleteBusiness(deleteModal.business.id);
      
      // Actualizar la lista de negocios eliminando el negocio borrado
      setBusinesses(prev => prev.filter(b => b.id !== deleteModal.business.id));
      
      // Cerrar el modal
      closeDeleteModal();
      
      console.log(`Business ${deleteModal.business.id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting business:', error);
      
      // Mostrar error específico
      const errorMessage = error.response?.data?.detail || error.message || 'Error al eliminar el negocio';
      setError(errorMessage);
      
      // Cerrar el modal incluso si hay error para que el usuario pueda ver el mensaje
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  // Función de debug temporal
  const debugBusinesses = async () => {
    if (!user) return;
    
    try {
      console.log('🐛 DEBUG: Checking businesses for user:', user.id);
      const response = await fetch(`http://localhost:8000/api/v1/businesses/debug/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const debugData = await response.json();
      console.log('🐛 DEBUG DATA:', debugData);
      alert(`Debug info logged to console. Total relationships: ${debugData.total_relationships}, Total businesses: ${debugData.total_businesses}`);
    } catch (error) {
      console.error('🐛 DEBUG ERROR:', error);
    }
  };

  // Función de reparación
  const repairBusinesses = async () => {
    if (!user) return;
    
    try {
      console.log('🔧 REPAIR: Starting repair for user:', user.id);
      const response = await fetch(`http://localhost:8000/api/v1/businesses/repair/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const repairData = await response.json();
      console.log('🔧 REPAIR DATA:', repairData);
      
      if (repairData.relationships_repaired > 0) {
        alert(`¡Reparación exitosa! Se crearon ${repairData.relationships_repaired} relaciones faltantes.`);
        // Recargar los datos
        loadData();
      } else {
        alert('No se encontraron negocios huérfanos para reparar.');
      }
    } catch (error) {
      console.error('🔧 REPAIR ERROR:', error);
      alert('Error durante la reparación. Revisa la consola.');
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
    <div className="page-container">
      <PageHeader 
        title="Mis Negocios"
        subtitle="Gestiona todos tus negocios desde un solo lugar"
        icon={Building2}
        backPath="/home"
        userName={user?.nombre || 'Usuario'}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Negocios</h1>
              <p className="text-lg text-gray-600">
                Gestiona todos tus negocios desde un solo lugar
              </p>
            </div>
            <div className="flex gap-3">
              {user && (
                <SimpleButton 
                  variant="outline" 
                  size="sm"
                  onClick={debugBusinesses}
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                >
                  🐛 Debug
                </SimpleButton>
              )}
              {user && (
                <SimpleButton 
                  variant="outline" 
                  size="sm"
                  onClick={repairBusinesses}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  🔧 Reparar
                </SimpleButton>
              )}
              <SimpleButton 
                onClick={() => navigate('/create-business')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Negocio
              </SimpleButton>
            </div>
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
        </div>

        {/* Businesses Section */}
        {dataLoaded && (
          <div className="mb-8">
            {businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div key={business.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {business.nombre || 'Sin nombre'}
                          </h3>
                          {business.descripcion && (
                            <p className="text-gray-600 text-sm">
                              {business.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Creado: {new Date(business.creada_en).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <SimpleButton 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleMenu(business.id)}
                            className="bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-gray-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </SimpleButton>
                          
                          {/* Menú desplegable */}
                          {openMenuId === business.id && (
                            <>
                              {/* Overlay para cerrar el menú */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={closeMenu}
                              ></div>
                              
                              {/* Menú */}
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      closeMenu();
                                      alert('Próximamente: Editar negocio');
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 border-none outline-none"
                                    style={{ color: '#374151', backgroundColor: 'white' }}
                                  >
                                    <Edit className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-700">Editar Negocio</span>
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(business)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 border-none outline-none"
                                    style={{ color: '#dc2626', backgroundColor: 'white' }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600">Eliminar Negocio</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/products`)}
                          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Productos
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/services`)}
                          className="text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Servicios
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/customers`)}
                          className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Clientes
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/pos`)}
                          className="text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          POS
                        </SimpleButton>
                      </div>
                      
                      {/* Main Actions */}
                      <div className="space-y-2">
                        <SimpleButton 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Panel de Control
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Próximamente: Configuración del negocio')}
                          className="w-full text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </SimpleButton>
                      </div>
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

        {/* Stats Summary */}
        {dataLoaded && businesses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Resumen General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
                <p className="text-sm text-gray-600">Negocios Activos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Total Productos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Total Clientes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteModal.isOpen && (
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBusiness}
          title="Eliminar Negocio"
          message="¿Estás seguro de que quieres eliminar este negocio?"
          businessName={deleteModal.business?.nombre || ''}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}

export default MyBusinesses; 