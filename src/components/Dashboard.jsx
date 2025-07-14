import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Users,
  FileText,
  Plus,
  Upload,
  Activity,
  Clock,
  Target,
  Zap,
  LogOut,
  Building2,
  LayoutDashboard,
  Warehouse,
  Settings,
  ChevronDown,
  CheckCircle,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { salesAPI, tasksAPI, productAPI, customerAPI, authAPI, businessAPI } from '../utils/api';
import { PageLoader } from './LoadingSpinner';

// Componentes UI simples
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

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
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

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'businesses', label: 'Negocios', icon: Building2, onClick: () => navigate('/business-users') },
    { 
      id: 'inventory', 
      label: 'Inventario', 
      icon: Package, 
      hasDropdown: true,
      subItems: [
        { id: 'products-list', label: 'Productos y Servicios', icon: Package, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/products-and-services`) },
        { id: 'categories', label: 'Categorías', icon: Warehouse, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/categories`) }
      ]
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart, 
      hasDropdown: true,
      subItems: [
        { id: 'pos', label: 'POS', icon: ShoppingCart, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/pos`) },
        { id: 'reports', label: 'Reporte de Ventas', icon: Activity, onClick: () => safeNavigate(`/business/${currentBusiness?.id}/reports`) }
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
                  {(showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory') ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  {isDisabled && (
                    <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                  )}
                </button>
                
                {((showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory')) && item.subItems && (
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

// Main Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para datos reales
  const [dashboardStats, setDashboardStats] = useState({
    total_sales: 0,
    estimated_profit: 0,
    new_customers: 0
  });
  const [topItems, setTopItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pendientes: 0,
    completadas: 0,
    en_progreso: 0
  });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [healthCheckResult, setHealthCheckResult] = useState(null);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

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
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessData = async () => {
    if (!currentBusiness?.id) return;

    try {
      setStatsLoading(true);
      
      // Cargar estadísticas del dashboard
      const statsResponse = await salesAPI.getDashboardStatsV2(currentBusiness.id);
      if (statsResponse) {
        setDashboardStats(statsResponse[selectedPeriod] || {
          total_sales: 0,
          estimated_profit: 0,
          new_customers: 0
        });
        setTopItems(statsResponse.top_items || []);
      }

      // Cargar otros datos en paralelo
      const [
        recentSalesData,
        taskStatsData,
        productsData,
        customersData
      ] = await Promise.allSettled([
        salesAPI.getRecentSales(currentBusiness.id),
        tasksAPI.getTaskStats(currentBusiness.id),
        productAPI.getProducts(currentBusiness.id),
        customerAPI.getCustomers(currentBusiness.id)
      ]);

      if (recentSalesData.status === 'fulfilled') {
        setRecentSales(Array.isArray(recentSalesData.value) ? recentSalesData.value.slice(0, 5) : []);
      }
      
      if (taskStatsData.status === 'fulfilled') {
        setTaskStats(taskStatsData.value || { total: 0, pendientes: 0, completadas: 0, en_progreso: 0 });
      }
      
      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value || []);
      }
      
      if (customersData.status === 'fulfilled') {
        setCustomers(customersData.value || []);
      }

    } catch (error) {
      console.error('Error loading business data:', error);
      setError('Error al cargar los datos del negocio');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleBusinessChange = (business) => {
    setCurrentBusiness(business);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const performHealthCheck = async () => {
    if (!currentBusiness?.id) return;
    
    setHealthCheckLoading(true);
    setHealthCheckResult(null);
    
    try {
      const startTime = Date.now();
      const result = await salesAPI.healthCheck(currentBusiness.id);
      const endTime = Date.now();
      
      setHealthCheckResult({
        ...result,
        frontend_time: `${endTime - startTime}ms`,
        status: 'success'
      });
    } catch (error) {
      const endTime = Date.now();
      setHealthCheckResult({
        status: 'error',
        error: error.message,
        frontend_time: `${endTime - startTime}ms`
      });
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const statCards = [
    {
      title: 'Ventas del Mes',
      value: formatCurrency(dashboardStats.total_sales || 0),
      description: 'Total acumulado este mes',
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Facturas Emitidas',
      value: '0',
      description: 'Próximamente disponible',
      icon: FileText,
      trend: 'N/A',
      trendUp: false
    },
    {
      title: 'Productos Activos',
      value: products.length.toString(),
      description: 'Productos en catálogo',
      icon: Package,
      trend: `+${products.length}`,
      trendUp: true
    },
    {
      title: 'Clientes Registrados',
      value: customers.length.toString(),
      description: 'Total de clientes',
      icon: Users,
      trend: `+${customers.length}`,
      trendUp: true
    }
  ];

  const renderDashboardContent = () => (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Dashboard - {currentBusiness?.nombre || 'Sin negocio'}
        </h2>
            <p className="text-gray-600">
          Resumen ejecutivo de {currentBusiness?.tipo || 'negocio'} | {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

        {/* Resultados del Diagnóstico */}
        {healthCheckResult && (
          <div className="mb-8">
            <div className={`rounded-lg p-4 border ${
              healthCheckResult.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {healthCheckResult.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-semibold ${
                  healthCheckResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  Diagnóstico de Conectividad
                </h3>
              </div>
              
              {healthCheckResult.status === 'success' ? (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600">Ventas:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.ventas_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Productos:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.productos_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Backend:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.response_time}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Frontend:</span>
                      <span className="ml-2 font-medium">{healthCheckResult.frontend_time}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="text-red-700">
                    <strong>Error:</strong> {healthCheckResult.error}
                  </div>
                  <div className="text-gray-600">
                    Tiempo transcurrido: {healthCheckResult.frontend_time}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setHealthCheckResult(null)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      {/* Controles de período y diagnóstico */}
      <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
            onClick={() => setSelectedPeriod('today')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'today' 
                ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Hoy
              </button>
              <button
            onClick={() => setSelectedPeriod('week')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'week' 
                ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semana
              </button>
              <button
            onClick={() => setSelectedPeriod('month')}
                disabled={statsLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedPeriod === 'month' 
                ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Mes
              </button>
          </div>

        <Button
          onClick={performHealthCheck}
          disabled={healthCheckLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {healthCheckLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <Activity className="w-4 h-4" />
          )}
          Diagnóstico
        </Button>
            </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    {stat.description}
                  </p>
                  <Badge variant={stat.trendUp ? "default" : "secondary"} className="text-xs">
                    <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendUp ? '' : 'rotate-180'}`} />
                    {stat.trend}
                  </Badge>
              </div>
              </CardContent>
            </Card>
          );
        })}
            </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
              onClick={() => navigate(`/business/${currentBusiness?.id}/pos`)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
              <span className="text-sm font-medium text-gray-900">Nueva Venta</span>
            </button>

            <Button
              onClick={() => navigate(`/business/${currentBusiness?.id}/products-and-services`)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Ver Productos
            </Button>

            <Button
              onClick={() => navigate(`/business/${currentBusiness?.id}/customers`)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Ver Clientes
            </Button>

            <Button
              onClick={() => navigate(`/business/${currentBusiness?.id}/products-and-services`)}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Productos
            </Button>
                  </div>
        </CardContent>
      </Card>

      {/* Productos Top y Ventas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Productos Top
            </CardTitle>
            <CardDescription>
              Productos más vendidos este {selectedPeriod === 'today' ? 'día' : selectedPeriod === 'week' ? 'semana' : 'mes'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topItems.length > 0 ? (
              topItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                      <p className="text-xs text-gray-500">Vendidos: {item.cantidad_total}</p>
              </div>
            </div>
                  <Badge variant="default">
                    {formatCurrency(item.precio_venta || 0)}
                  </Badge>
          </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay datos de productos para este período</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ventas Recientes
            </CardTitle>
            <CardDescription>
              Últimas transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Venta #{sale.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.fecha_venta)}
                      </p>
                    </div>
                    </div>
                  <Badge variant="success">
                    {formatCurrency(sale.total)}
                  </Badge>
                    </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay ventas registradas aún</p>
                </div>
            )}
          </CardContent>
        </Card>
              </div>
            </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'products':
        return (
          <div className="flex-1 p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos y Servicios
            </h2>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <p className="text-gray-600">
                Redirigiendo a la gestión de productos...
              </p>
          </div>
        </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
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
          {renderContent()}
        </main>
      </div>
    </div>
  );
}