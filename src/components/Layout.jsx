import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LogOut,
  Building2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  BarChart3
} from 'lucide-react';
import { authAPI, businessAPI } from '../utils/api';
import { BusinessContext, useBusinessContext } from '../contexts/BusinessContext';
import { useAuth } from '../contexts/AuthContext';

// Export useBusinessContext for backward compatibility
export { useBusinessContext };

// Componente Button reutilizable
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
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

// Sidebar Component
const Sidebar = ({ activeSection, setActiveSection, currentBusiness }) => {
  const navigate = useNavigate();
  const [showSalesDropdown, setShowSalesDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  
  // Helper function to safely navigate with business validation
  const safeNavigate = (path) => {
    if (!currentBusiness?.id) {
      console.error('No business selected for navigation');
      alert('Por favor selecciona un negocio antes de continuar');
      return;
    }
    navigate(path);
  };
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onClick: () => navigate('/home') },
    { id: 'businesses', label: 'Negocios', icon: Building2, onClick: () => navigate('/business-users') },
    { 
      id: 'inventory', 
      label: 'Inventario', 
      icon: Package, 
      hasDropdown: true,
      subItems: [
        { id: 'products', label: 'Productos y Servicios', icon: Package, onClick: () => safeNavigate('/products-and-services') },
        { id: 'categories', label: 'Categorías', icon: BarChart3, onClick: () => safeNavigate('/categories') }
      ]
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart, 
      hasDropdown: true,
      subItems: [
        { id: 'pos', label: 'POS', icon: ShoppingCart, onClick: () => safeNavigate('/pos') },
        { id: 'reports', label: 'Reporte de Ventas', icon: BarChart3, onClick: () => safeNavigate('/reports') }
      ]
    },
    { id: 'clients', label: 'Clientes', icon: Users, onClick: () => safeNavigate('/customers') },
    { id: 'tasks', label: 'Tareas', icon: Clock, onClick: () => safeNavigate('/tasks') },
    { id: 'billing', label: 'Facturación', icon: FileText, disabled: true },
    { id: 'finances', label: 'Finanzas', icon: DollarSign, onClick: () => safeNavigate('/finanzas') },
    { id: 'settings', label: 'Configuración', icon: Settings, disabled: true },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40" style={{ backgroundColor: '#ffffff' }}>
      <div className="p-6 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: '#f8fafc' }}>
  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-2xl">O</span>
  </div>
  <div>
    <h1 className="text-2xl font-bold text-blue-700">OperixML</h1>
    <p className="text-sm text-gray-600 mt-1">Sistema de Gestión</p>
  </div>
</div>
      
      <nav className="flex-1 p-4 space-y-2" style={{ backgroundColor: '#ffffff' }}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || (item.subItems && item.subItems.some(subItem => activeSection === subItem.id));
          const isDisabled = item.disabled;
          
          if (item.hasDropdown) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (isDisabled) return;
                    if (item.id === 'sales') {
                      setShowSalesDropdown(!showSalesDropdown);
                    } else if (item.id === 'inventory') {
                      setShowInventoryDropdown(!showInventoryDropdown);
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? "text-blue-700 shadow-sm"
                      : isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  style={{
                    backgroundColor: isActive ? '#dbeafe' : isDisabled ? 'transparent' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isDisabled) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isDisabled) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className={`h-5 w-5 transition-colors ${
                    isActive ? "text-blue-600" : isDisabled ? "text-gray-400" : "text-gray-500"
                  }`} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {((showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory')) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  {isDisabled && (
                    <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                  )}
                </button>
                
                {(((showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory')) && item.subItems) && (
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeSection === subItem.id;
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            if (subItem.onClick) {
                              subItem.onClick();
                            } else {
                              setActiveSection(subItem.id);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                            isSubActive
                              ? "text-blue-700 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          style={{
                            backgroundColor: isSubActive ? '#dbeafe' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.target.style.backgroundColor = '#f1f5f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                          title={!currentBusiness?.id ? 'Selecciona un negocio para acceder' : ''}
                        >
                          <SubIcon className={`h-4 w-4 transition-colors ${
                            isSubActive ? "text-blue-600" : "text-gray-500"
                          }`} />
                          <span className="font-medium text-sm">{subItem.label}</span>
                          {!currentBusiness?.id && (
                            <span className="ml-auto text-xs text-orange-500">Sin negocio</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isDisabled) return;
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveSection(item.id);
                }
              }}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? "text-blue-700 shadow-sm"
                  : isDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              style={{
                backgroundColor: isActive ? '#dbeafe' : isDisabled ? 'transparent' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isDisabled) {
                  e.target.style.backgroundColor = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isDisabled) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              title={!currentBusiness?.id && ['products', 'clients', 'tasks'].includes(item.id) ? 'Selecciona un negocio para acceder' : ''}
            >
              <Icon className={`h-5 w-5 transition-colors ${
                isActive ? "text-blue-600" : isDisabled ? "text-gray-400" : "text-gray-500"
              }`} />
              <span className="font-medium">{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-xs text-gray-400">Próximamente</span>
              )}
              {!currentBusiness?.id && ['products', 'clients', 'tasks'].includes(item.id) && (
                <span className="ml-auto text-xs text-orange-500">Sin negocio</span>
              )}
            </button>
          );
        })}
        
        {/* Botón de cerrar sesión inmediatamente después de los items del sidebar */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.clear();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-gray-700 hover:text-blue-600 transition-colors"
          style={{ backgroundColor: '#ffffff' }}
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 mt-auto" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-xs text-gray-500 text-center">
          © 2025 MicroPymes v2.1
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ currentBusiness, businesses, onBusinessChange, onLogout, setSidebarOpen }) => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBusinessDropdown && !event.target.closest('.business-dropdown')) {
        setShowBusinessDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBusinessDropdown]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6" style={{ backgroundColor: '#ffffff' }}>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="md:hidden mr-4 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Negocio actual */}
      <div className="flex items-center ml-4 sm:ml-6">
          <span className="hidden sm:inline font-medium text-gray-700 mr-1">
            Negocio:
          </span>
          <div className="relative business-dropdown">
            <button
              onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg transition-colors"
              style={{ 
                backgroundColor: '#f8fafc',
                borderColor: '#d1d5db'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
              }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-semibold text-blue-600 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                  {currentBusiness?.nombre || 'Seleccionar negocio'}
                </span>
                {currentBusiness?.tipo && (
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    ({currentBusiness.tipo})
                  </span>
                )}
              </div>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            </button>
            
            {showBusinessDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                style={{ 
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  zIndex: 9999
                }}
              >
                <div className="py-1">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => {
                        onBusinessChange(business);
                        setShowBusinessDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors text-gray-900 hover:bg-gray-50 bg-white"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#111827',
                        border: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <span 
                        className="font-medium text-gray-900 bg-transparent"
                        style={{ 
                          color: '#111827',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {business.nombre}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      {/* El botón de cerrar sesión se ha movido al fondo del sidebar */}
    </header>
  );
};

// Layout Component Principal
const Layout = ({ children, activeSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Función para determinar la sección activa basándose en la URL
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    
    if (path.includes('/finanzas')) return 'finances';
    if (path.includes('/products-and-services')) return 'products';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/pos')) return 'pos';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/customers')) return 'clients';
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/business-users')) return 'businesses';
    if (path.includes('/home')) return 'dashboard';
    
    return 'dashboard'; // Por defecto
  };
  
  // Determinar la sección activa
  const currentActiveSection = activeSection || getActiveSectionFromPath();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Solo cargar businesses, el usuario ya está disponible en AuthContext
      const businessesData = await businessAPI.getBusinesses();
      
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

  const handleBusinessChange = (business) => {
    setCurrentBusiness(business);
    // Invalidate permissions cache when business changes
    queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
    // Also invalidate other business-specific data
    queryClient.invalidateQueries({ queryKey: ['products', business.id] });
    queryClient.invalidateQueries({ queryKey: ['services', business.id] });
    queryClient.invalidateQueries({ queryKey: ['customers', business.id] });
    queryClient.invalidateQueries({ queryKey: ['categories', business.id] });
    queryClient.invalidateQueries({ queryKey: ['tasks', business.id] });
  };

  const handleLogout = () => {
    // Esta función ahora se implementa directamente en el botón del sidebar
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{ currentBusiness, businesses, handleBusinessChange }}>
      <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
        {/* Sidebar responsive */}
        <div>
    {/* Overlay para móvil */}
    <div
      className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
      onClick={() => setSidebarOpen(false)}
      aria-hidden="true"
    ></div>
    <div
      className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0`}
    >
      <Sidebar 
        activeSection={currentActiveSection}
        setActiveSection={() => {}}
        currentBusiness={currentBusiness}
      />
      {/* Botón cerrar en móvil */}
      <button
        className="absolute top-4 right-4 md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(false)}
        aria-label="Cerrar menú"
      >
        <svg className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
  {/* Contenido principal */}
  <div className="flex-1 min-w-0 overflow-x-hidden">
    <Header
      currentBusiness={currentBusiness}
      businesses={businesses}
      onBusinessChange={handleBusinessChange}
      onLogout={handleLogout}
      setSidebarOpen={setSidebarOpen}
    />
    <main className="flex-1 min-w-0">
      {children}
    </main>
  </div>
</div>
    </BusinessContext.Provider>
  );
};

export default Layout; 