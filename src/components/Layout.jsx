import React, { useState, useEffect, useCallback } from 'react';
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
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  BarChart3,
  Truck,
  ArrowLeftRight
} from 'lucide-react';
import { businessAPI } from '../utils/api';
import { BusinessContext } from '../contexts/BusinessContext';

const BranchBadge = ({ branch }) => {
  if (!branch?.is_main) {
    return null;
  }
  return (
    <span className="px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full uppercase flex-shrink-0 whitespace-nowrap">
      Principal
    </span>
  );
};

// Sidebar Component
const Sidebar = ({
  activeSection,
  setActiveSection,
  currentBusiness,
  currentBranch,
  branches,
  branchesLoading,
  businesses,
  branchError,
  onBusinessChange,
  onBranchChange,
}) => {
  const navigate = useNavigate();
  const [showSalesDropdown, setShowSalesDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [showPurchasesDropdown, setShowPurchasesDropdown] = useState(false);
  // Helper function to safely navigate with business validation
  const safeNavigate = (path) => {
    if (!currentBusiness?.id) {
      console.error('No business selected for navigation');
      alert('Por favor selecciona un negocio antes de continuar');
      return;
    }
    if (
      !currentBranch?.id &&
      Array.isArray(branches) &&
      branches.length > 1 &&
      !branchesLoading
    ) {
      console.warn('Branch selection required before navigating.');
      alert('Por favor selecciona una sucursal antes de continuar');
      return;
    }
    navigate(path);
  };
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onClick: () => navigate('/home') },
    { id: 'businesses', label: 'Negocios', icon: Building2, onClick: () => navigate('/business-users') },
    {
      id: 'sales',
      label: 'Ventas',
      icon: ShoppingCart,
      hasDropdown: true,
      subItems: [
        { id: 'pos', label: 'Ventas POS', icon: ShoppingCart, onClick: () => safeNavigate('/pos') },
        { id: 'reports', label: 'Reporte de ventas', icon: BarChart3, onClick: () => safeNavigate('/reports') }
      ]
    },
    {
      id: 'purchasesMenu',
      label: 'Compras',
      icon: ShoppingCart,
      hasDropdown: true,
      subItems: [
        { id: 'purchases', label: 'Órdenes de compra', icon: ShoppingCart, onClick: () => safeNavigate('/compras') },
        { id: 'suppliers', label: 'Proveedores', icon: Truck, onClick: () => safeNavigate('/proveedores') }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      hasDropdown: true,
      subItems: [
        { id: 'products', label: 'Productos y servicios', icon: Package, onClick: () => safeNavigate('/products-and-services') },
        { id: 'categories', label: 'Categorías', icon: BarChart3, onClick: () => safeNavigate('/categories') }
      ]
    },
    { id: 'stock-transfers', label: 'Transferencias', icon: ArrowLeftRight, onClick: () => safeNavigate('/stock-transfers') },
    { id: 'clients', label: 'Clientes', icon: Users, onClick: () => safeNavigate('/customers') },
    { id: 'finances', label: 'Finanzas', icon: BarChart3, onClick: () => safeNavigate('/finanzas') },
    { id: 'tasks', label: 'Tareas', icon: Clock, onClick: () => safeNavigate('/tasks') },
    { id: 'billing', label: 'Facturación (próximamente)', icon: FileText, disabled: true },
    { id: 'settings', label: 'Configuración', icon: Settings, onClick: () => safeNavigate('/settings/branch-preferences') },
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
                    } else if (item.id === 'purchasesMenu') {
                      setShowPurchasesDropdown(!showPurchasesDropdown);
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
                  {((showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory') || (showPurchasesDropdown && item.id === 'purchasesMenu')) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  {isDisabled && (
                    <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                  )}
                </button>
                
                {(((showSalesDropdown && item.id === 'sales') || (showInventoryDropdown && item.id === 'inventory') || (showPurchasesDropdown && item.id === 'purchasesMenu')) && item.subItems) && (
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
              title={!currentBusiness?.id && ['products', 'clients', 'finances', 'tasks'].includes(item.id) ? 'Selecciona un negocio para acceder' : ''}
            >
              <Icon className={`h-5 w-5 transition-colors ${
                isActive ? "text-blue-600" : isDisabled ? "text-gray-400" : "text-gray-500"
              }`} />
              <span className="font-medium">{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-xs text-gray-400">Próximamente</span>
              )}
              {!currentBusiness?.id && ['products', 'clients', 'finances', 'tasks'].includes(item.id) && (
                <span className="ml-auto text-xs text-orange-500">Sin negocio</span>
              )}
            </button>
          );
        })}
        
        {/* Boton de cerrar sesion inmediatamente despues de los items del sidebar */}
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
          2025 MicroPymes v2.1
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({
  currentBusiness,
  businesses,
  currentBranch,
  branches,
  branchesLoading,
  branchError,
  onBusinessChange,
  onBranchChange,
  setSidebarOpen,
}) => {
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBusinessDropdown && !event.target.closest('.business-dropdown')) {
        setShowBusinessDropdown(false);
      }
      if (showBranchDropdown && !event.target.closest('.branch-dropdown')) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBusinessDropdown, showBranchDropdown]);

  const renderBusinessSelector = (variant = 'desktop') => {
    const isMobile = variant === 'mobile';
    const widthClasses = isMobile ? 'flex-1 min-w-0' : 'min-w-[12rem] max-w-[16rem]';
    const dropdownWidth = isMobile ? 'w-full' : 'w-full min-w-[12rem]';
    const containerClasses = isMobile
      ? 'relative business-dropdown flex-1 min-w-0'
      : 'relative business-dropdown inline-flex';

    return (
      <div className={containerClasses}>
        <button
          onClick={() => setShowBusinessDropdown((open) => !open)}
          className={`flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100 ${widthClasses}`}
          aria-haspopup="true"
          aria-expanded={showBusinessDropdown}
        >
          <span className="font-semibold text-blue-600 text-sm truncate">
            {currentBusiness?.nombre || 'Seleccionar negocio'}
          </span>
          {!isMobile && currentBusiness?.tipo && (
            <span className="text-xs text-gray-500 hidden xl:inline">
              ({currentBusiness.tipo})
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </button>

        {showBusinessDropdown && (
          <div
            className={`absolute top-full left-0 mt-1 ${dropdownWidth} max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
          >
            <div className="py-1">
              {businesses.map((business) => {
                const isActive = business.id === currentBusiness?.id;
                return (
                  <button
                    key={business.id}
                    onClick={() => {
                      onBusinessChange(business);
                      setShowBusinessDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium truncate">{business.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBranchSelector = (variant = 'desktop') => {
    const isMobile = variant === 'mobile';
    const widthClasses = isMobile ? 'flex-1 min-w-0' : 'min-w-[11.5rem] max-w-[15rem]';
    const dropdownWidth = isMobile ? 'w-full' : 'w-full min-w-[11.5rem]';
    const containerClasses = isMobile
      ? 'relative branch-dropdown flex-1 min-w-0'
      : 'relative branch-dropdown inline-flex';

    if (branchesLoading) {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-slate-100 text-gray-600 ${widthClasses}`}>
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Cargando...</span>
        </div>
      );
    }

    if (branchError) {
      return (
        <div className={`px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg ${widthClasses}`}>
          {branchError}
        </div>
      );
    }

    if (!branches?.length) {
      return (
        <div className={`px-3 py-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg ${widthClasses}`}>
          Sin sucursal asignada
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <button
          onClick={() => setShowBranchDropdown((open) => !open)}
          className={`flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100 ${widthClasses}`}
          aria-haspopup="true"
          aria-expanded={showBranchDropdown}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-semibold text-sm text-blue-600 truncate">
              {currentBranch?.nombre || 'Seleccionar sucursal'}
            </span>
            <BranchBadge branch={currentBranch} />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </button>

        {showBranchDropdown && (
          <div className={`absolute top-full left-0 mt-1 ${dropdownWidth} max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50`}>
            <div className="py-1">
              {branches.map((branch) => {
                const isActive = branch.id === currentBranch?.id;
                return (
                  <button
                    key={branch.id}
                    onClick={() => {
                      onBranchChange(branch);
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium truncate">{branch.nombre}</span>
                    <BranchBadge branch={branch} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2" style={{ backgroundColor: '#ffffff' }}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Boton hamburguesa solo en movil */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <svg className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-1 items-center gap-2 min-w-0 lg:hidden">
          {renderBusinessSelector('mobile')}
          {renderBranchSelector('mobile')}
        </div>

        <div className="hidden lg:flex items-end gap-4 ml-auto">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Negocio
            </span>
            {renderBusinessSelector('desktop')}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sucursal
            </span>
            {renderBranchSelector('desktop')}
          </div>
        </div>
      </div>
    </header>
  );
};

// Layout Component Principal
const Layout = ({ children, activeSection }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchError, setBranchError] = useState(null);
  const [branchSettings, setBranchSettings] = useState(null);
  const [branchSettingsLoading, setBranchSettingsLoading] = useState(false);
  const [branchSettingsError, setBranchSettingsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const ACTIVE_BUSINESS_STORAGE_KEY = 'activeBusinessId';
  const getBranchStorageKey = useCallback(
    (businessId) => (businessId ? `activeBranch:${businessId}` : null),
    []
  );
  const invalidateQueriesForBusiness = useCallback(
    (businessId) => {
      if (!businessId) {
        return;
      }
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(businessId),
      });
    },
    [queryClient]
  );
  const loadBranchSettings = useCallback(
    async (businessIdParam) => {
      const targetBusinessId = businessIdParam || currentBusiness?.id;
      if (!targetBusinessId) {
        setBranchSettings(null);
        setBranchSettingsError(null);
        return;
      }

      setBranchSettingsLoading(true);
      try {
        const response = await businessAPI.getBranchSettings(targetBusinessId);
        setBranchSettings(response || null);
        setBranchSettingsError(null);
      } catch (apiError) {
        console.error('Error loading branch settings:', apiError);
        const status = apiError?.response?.status;
        if (status === 404) {
          setBranchSettings(null);
          setBranchSettingsError(null);
        } else {
          setBranchSettings(null);
          setBranchSettingsError('No se pudo cargar la configuración del negocio.');
        }
      } finally {
        setBranchSettingsLoading(false);
      }
    },
    [currentBusiness?.id]
  );
  const applyBranchSelection = useCallback(
    (branch, businessIdOverride = null) => {
      const targetBusinessId = businessIdOverride || currentBusiness?.id;
      setCurrentBranch(branch);

      if (targetBusinessId) {
        const storageKey = getBranchStorageKey(targetBusinessId);
        if (branch?.id && storageKey) {
          localStorage.setItem(storageKey, branch.id);
        } else if (storageKey) {
          localStorage.removeItem(storageKey);
        }
        invalidateQueriesForBusiness(targetBusinessId);
      }
    },
    [currentBusiness?.id, getBranchStorageKey, invalidateQueriesForBusiness]
  );
  const loadBranches = useCallback(
    async (businessId) => {
      if (!businessId) {
        setBranches([]);
        setBranchError(null);
        applyBranchSelection(null, null);
        return;
      }

      try {
        setBranchesLoading(true);
        setBranchError(null);
        const branchList = await businessAPI.getBranches(businessId);
        const normalizedBranches = Array.isArray(branchList) ? branchList : [];
        setBranches(normalizedBranches);

        if (normalizedBranches.length === 0) {
          applyBranchSelection(null, businessId);
          return;
        }

        const storageKey = getBranchStorageKey(businessId);
        const storedBranchId = storageKey ? localStorage.getItem(storageKey) : null;
        const storedBranch = storedBranchId
          ? normalizedBranches.find((branch) => branch.id === storedBranchId)
          : null;
        const mainBranch = normalizedBranches.find((branch) => branch.is_main);
        const nextBranch = storedBranch || mainBranch || normalizedBranches[0];

        applyBranchSelection(nextBranch || null, businessId);
      } catch (loadError) {
        console.error('Error loading branches:', loadError);
        setBranches([]);
        setBranchError(
          loadError?.response?.data?.detail ||
          loadError?.message ||
          'No se pudieron cargar las sucursales.'
        );
        applyBranchSelection(null, businessId);
      } finally {
        setBranchesLoading(false);
      }
    },
    [applyBranchSelection, getBranchStorageKey]
  );
  const handleBranchChange = useCallback(
    (branch) => {
      applyBranchSelection(branch || null, currentBusiness?.id);
    },
    [applyBranchSelection, currentBusiness?.id]
  );
  const refreshBranches = useCallback(
    async (businessId = null) => {
      const targetBusinessId = businessId || currentBusiness?.id;
      if (targetBusinessId) {
        await loadBranches(targetBusinessId);
      }
    },
    [currentBusiness?.id, loadBranches]
  );
  const refreshBranchSettings = useCallback(
    async (businessId = null) => {
      const targetBusinessId = businessId || currentBusiness?.id;
      await loadBranchSettings(targetBusinessId);
    },
    [currentBusiness?.id, loadBranchSettings]
  );
  
  // Función para determinar la sección activa basándose en la URL
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    
    if (path.includes('/finanzas')) return 'finances';
    if (path.includes('/products-and-services')) return 'products';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/proveedores')) return 'suppliers';
    if (path.includes('/stock-transfers')) return 'stock-transfers';
    if (path.includes('/compras')) return 'purchases';
    if (path.includes('/pos')) return 'pos';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/customers')) return 'clients';
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/business-users')) return 'businesses';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/home')) return 'dashboard';
    
    return 'dashboard'; // Por defecto
  };
  
  // Determinar la sección activa
  const currentActiveSection = activeSection || getActiveSectionFromPath();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      // Solo cargar businesses, el usuario ya está disponible en AuthContext
      const businessesData = await businessAPI.getBusinesses();
      
      setBusinesses(businessesData);
      
      // Seleccionar el primer negocio por defecto
      if (businessesData && businessesData.length > 0) {
        const storedBusinessId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
        const storedBusiness = storedBusinessId
          ? businessesData.find((business) => business.id === storedBusinessId)
          : null;
        const selectedBusiness = storedBusiness || businessesData[0];

        setCurrentBusiness(selectedBusiness);
        if (selectedBusiness?.id) {
          localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, selectedBusiness.id);
          await loadBranches(selectedBusiness.id);
          await loadBranchSettings(selectedBusiness.id);
        }
      } else {
        setCurrentBusiness(null);
        setBranches([]);
        setCurrentBranch(null);
        setBranchSettings(null);
        setBranchSettingsError(null);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadBranches]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleBusinessChange = (business) => {
    setCurrentBusiness(business);

    if (business?.id) {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, business.id);
      setBranches([]);
      applyBranchSelection(null, business.id);
      loadBranches(business.id);
      loadBranchSettings(business.id);
      invalidateQueriesForBusiness(business.id);
    } else {
      localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
      setBranches([]);
      applyBranchSelection(null, null);
      setBranchSettings(null);
      setBranchSettingsError(null);
    }

    // Invalidate permissions cache when business changes
    queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
    // Also invalidate other business-specific data
    queryClient.invalidateQueries({ queryKey: ['products', business.id] });
    queryClient.invalidateQueries({ queryKey: ['services', business.id] });
    queryClient.invalidateQueries({ queryKey: ['customers', business.id] });
    queryClient.invalidateQueries({ queryKey: ['categories', business.id] });
    queryClient.invalidateQueries({ queryKey: ['tasks', business.id] });
    queryClient.invalidateQueries({ queryKey: ['purchases', business.id] });
    queryClient.invalidateQueries({ queryKey: ['suppliers', business.id] });
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
    <BusinessContext.Provider
      value={{
        currentBusiness,
        currentBranch,
        businesses,
        branches,
        branchesLoading,
        branchError,
        branchSettings,
        branchSettingsLoading,
        branchSettingsError,
        handleBusinessChange,
        handleBranchChange,
        refreshBranches,
        refreshBranchSettings,
      }}
    >
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
        currentBranch={currentBranch}
        branches={branches}
        branchesLoading={branchesLoading}
      />
      {/* Boton cerrar en movil */}
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
      currentBranch={currentBranch}
      branches={branches}
      branchesLoading={branchesLoading}
      branchError={branchError}
      onBusinessChange={handleBusinessChange}
      onBranchChange={handleBranchChange}
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

