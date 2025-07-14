import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        { id: 'products', label: 'Productos y Servicios', icon: Package, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/products-and-services`) },
        { id: 'categories', label: 'Categorías', icon: BarChart3, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/categories`) }
      ]
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart, 
      hasDropdown: true,
      subItems: [
        { id: 'pos', label: 'POS', icon: ShoppingCart, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/pos`) },
        { id: 'reports', label: 'Reporte de Ventas', icon: BarChart3, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/reports`) }
      ]
    },
    { id: 'clients', label: 'Clientes', icon: Users, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/customers`) },
    { id: 'tasks', label: 'Tareas', icon: Clock, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/tasks`) },
    { id: 'billing', label: 'Facturación', icon: FileText, disabled: true },
    { id: 'finances', label: 'Finanzas', icon: DollarSign, disabled: true },
    { id: 'settings', label: 'Configuración', icon: Settings, disabled: true },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40" style={{ backgroundColor: '#ffffff' }}>
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
        <h1 className="text-2xl font-bold text-gray-900">
          MicroPymes
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Sistema de Gestión
        </p>
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
      </nav>
      
      <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-xs text-gray-500 text-center">
          © 2025 MicroPymes v2.1
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ currentBusiness, businesses, onBusinessChange, onLogout }) => {
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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span className="font-medium text-gray-700">
            Negocio actual:
          </span>
          <div className="relative business-dropdown">
            <button
              onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
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
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-600">
                  {currentBusiness?.nombre || 'Seleccionar negocio'}
                </span>
                {currentBusiness?.tipo && (
                  <span className="text-xs text-gray-500">
                    ({currentBusiness.tipo})
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {showBusinessDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#ffffff' }}>
                <div className="py-1">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => {
                        onBusinessChange(business);
                        setShowBusinessDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="font-medium">{business.nombre}</span>
                      <span className="text-xs text-gray-500">({business.tipo})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};

// Layout Component Principal
const Layout = ({ children, activeSection = 'dashboard' }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

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

  const handleBusinessChange = (business) => {
    setCurrentBusiness(business);
  };

  const handleLogout = () => {
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={() => {}}
        currentBusiness={currentBusiness}
      />
      
      <div className="flex-1 ml-64">
        <Header
          currentBusiness={currentBusiness}
          businesses={businesses}
          onBusinessChange={handleBusinessChange}
          onLogout={handleLogout}
        />
        
        <main className="flex-1">
          {React.cloneElement(children, { currentBusiness })}
        </main>
      </div>
    </div>
  );
};

export default Layout; 