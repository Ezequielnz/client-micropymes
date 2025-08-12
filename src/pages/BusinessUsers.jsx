import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI, authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Componentes UI simples
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
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

function BusinessUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    nombre: '',
    tipo: '',
    descripcion: ''
  });
  const [creating, setCreating] = useState(false);

  const businessTypes = [
    'Comercio',
    'Servicio',
    'Restaurante',
    'Tienda',
    'Consultorio',
    'Taller',
    'Otro'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // El usuario ya está disponible en AuthContext
      if (!currentUser) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      // Cargar negocios del usuario
      const businessData = await businessAPI.getBusinesses();
      setBusinesses(businessData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    
    if (!newBusiness.nombre.trim() || !newBusiness.tipo) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setCreating(true);
      await businessAPI.createBusiness(newBusiness);
      setNewBusiness({ nombre: '', tipo: '', descripcion: '' });
      setShowCreateForm(false);
      await loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error creating business:', err);
      alert('Error al crear el negocio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBusiness = async (businessId, businessName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el negocio "${businessName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await businessAPI.deleteBusiness(businessId);
      await loadData(); // Recargar la lista
    } catch (err) {
      console.error('Error deleting business:', err);
      alert('Error al eliminar el negocio: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <Layout activeSection="businesses">
        <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <PageLoader />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout activeSection="businesses">
        <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="card max-w-md mx-auto">
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={loadData} className="flex-1">
                  Reintentar
                </Button>
                <Button onClick={() => navigate('/home')} variant="outline" className="flex-1">
                  Volver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeSection="businesses">
      <div className="flex-1 bg-gray-50 min-h-screen overflow-hidden">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 h-14 md:h-16 min-w-0">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mis Negocios</h1>
                <p className="text-sm text-gray-600">Gestiona tus negocios registrados</p>
              </div>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Nuevo Negocio
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        
          {/* Formulario de creación */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Crear Nuevo Negocio</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBusiness} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        value={newBusiness.nombre}
                        onChange={(e) => setNewBusiness(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Ej: Mi Tienda"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Negocio *
                      </label>
                      <select
                        value={newBusiness.tipo}
                        onChange={(e) => setNewBusiness(prev => ({ ...prev, tipo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newBusiness.descripcion}
                      onChange={(e) => setNewBusiness(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      rows="3"
                      placeholder="Descripción opcional del negocio"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear Negocio'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewBusiness({ nombre: '', tipo: '', descripcion: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Negocios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Mis Negocios ({businesses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes negocios registrados</h3>
                  <p className="text-gray-500 mb-6">Crea tu primer negocio para comenzar a gestionar tus productos y ventas</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear mi primer negocio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {businesses.map((business) => (
                    <div key={business.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{business.nombre}</h3>
                            <p className="text-sm text-gray-500">{business.tipo}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteBusiness(business.id, business.nombre)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar negocio"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {business.descripcion && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {business.descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Activo
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          ID: {business.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default BusinessUsers;