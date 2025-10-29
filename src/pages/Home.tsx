import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI } from '../utils/api';
import { useDashboardData } from '../hooks/useDashboardData';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { useBusinessContext, type Business } from '../contexts/BusinessContext';
import { PageLoader } from '../components/LoadingSpinner';
import {
  Building2,
  Plus,
  RefreshCw,
  Bell,
  Send
} from 'lucide-react';

// Lazy load dashboard components for better performance
const DashboardStats = lazy(() => import('../components/dashboard/DashboardStats'));
const QuickActions = lazy(() => import('../components/dashboard/QuickActions'));
const TopProducts = lazy(() => import('../components/dashboard/TopProducts'));
const RecentSales = lazy(() => import('../components/dashboard/RecentSales'));
const MonitoringDashboard = lazy(() => import('../components/dashboard/MonitoringDashboard'));

// Internal component that uses BusinessContext
const HomeContent: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const navigate = useNavigate();

  // Get current business from context
  const { currentBusiness } = useBusinessContext();

  // ✅ OPTIMIZED: Usar el hook personalizado para datos del dashboard con React Query
  const {
    loading: dataLoading,
    error: dataError,
    refreshData,
    lastUpdate,
    stats,
    topItems,
    recentSales,
    products,
    customers
  } = useDashboardData(currentBusiness, selectedPeriod);

  // ✅ OPTIMIZED: Memoized format functions to prevent recreation on every render
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // ✅ OPTIMIZED: Memoized computed states
  const shouldShowError = useMemo(() => {
    return error && error.response?.status !== 401 && error.response?.status !== 403;
  }, [error]);

  const isLoading = useMemo(() => {
    return loading;
  }, [loading]);

  const hasBusinesses = useMemo(() => {
    return businesses.length > 0;
  }, [businesses.length]);

  const hasCurrentBusiness = useMemo(() => {
    return !!currentBusiness;
  }, [currentBusiness]);

  // ✅ OPTIMIZED: Memoized loadInitialData function
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await businessAPI.getBusinesses();
      setBusinesses((response as Business[]) || []);
      
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      setError(error);
      
      if (error?.response?.status === 403) {
        navigate('/pending-approval');
      } else if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Efecto para cargar datos iniciales (solo verificar token y obtener negocios)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadInitialData();
  }, [loadInitialData, navigate]);

  // ✅ OPTIMIZED: Memoized handlePeriodChange function
  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);

  // ✅ OPTIMIZED: Memoized navigation handlers
  const handleCreateBusiness = useCallback(() => {
    navigate('/business-users');
  }, [navigate]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleGoToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSendOrder = useCallback(async () => {
    try {
      setSendStatus('sending');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSendStatus('sent');
    } catch (e) {
      console.error('Error al enviar pedido:', e);
      setSendStatus('idle');
    }
  }, []);

  // ✅ OPTIMIZED: Memoized period buttons data
  const periodButtons = useMemo(() => [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' }
  ], []);

  // ✅ OPTIMIZED: Memoized current date string
  const currentDateString = useMemo(() => {
    // Solo día, mes y día de la semana (sin año)
    return new Date().toLocaleDateString('es-AR', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  // ✅ OPTIMIZED: Memoized last update time string
  const lastUpdateString = useMemo(() => {
    return lastUpdate ? lastUpdate.toLocaleTimeString('es-AR') : '';
  }, [lastUpdate]);

  // Handle error state
  if (shouldShowError) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg font-medium mb-4">
            Error: {error.response?.data?.detail || error.message || 'Error al verificar el estado de aprobación'}
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleReload}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
            <button 
              onClick={handleGoToLogin}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <PageLoader message="Verificando acceso..." variant="primary" />
      </div>
    );
  }

  // Dashboard content
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Page Header - Optimizado para móvil */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate w-full max-w-[180px] sm:max-w-xs md:max-w-full">
                {currentBusiness?.nombre || 'tu negocio'} {/* Nombre del negocio siempre visible */}
                <span className="hidden sm:inline"> | {currentDateString}</span> {/* Fecha oculta en móvil muy pequeño */}
              </p>
            </div>
            {/* Refresh button - Visible solo en tablet/desktop */}
            {hasCurrentBusiness && (
              <div className="flex items-center ml-2">
                <span className="hidden sm:inline-block text-xs text-gray-500 mr-2">
                  {lastUpdateString && `Actualizado: ${lastUpdateString}`}
                </span>
                <button
                  onClick={refreshData}
                  disabled={dataLoading}
                  className="inline-flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                  aria-label="Refrescar datos"
                >
                  <RefreshCw className={`h-3 w-3 ${dataLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline ml-1">Refrescar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Optimizado para móvil */}
      <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
        {!hasBusinesses ? (
          // No businesses state
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Bienvenido a MicroPymes!</h3>
            <p className="text-gray-500 mb-6">Para comenzar, crea tu primer negocio</p>
            <button
              onClick={handleCreateBusiness}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear mi primer negocio
            </button>
          </div>
        ) : !hasCurrentBusiness ? (
          // No business selected state
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un negocio</h3>
            <p className="text-gray-500 mb-6">Elige un negocio del menú superior para ver su dashboard</p>
          </div>
        ) : (
          // Dashboard with selected business
          <div className="space-y-6">
            {/* Error handling for dashboard data */}
            {dataError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="font-medium">Error al cargar datos:</span>
                  <span>{dataError}</span>
                  <button
                    onClick={refreshData}
                    className="ml-auto text-sm underline hover:no-underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Notificaciones - stock bajo */}
            <div className="w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-2 flex-1">
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-blue-900">
                      En 10 días te quedarás sin stock de tu producto: <span className="font-semibold">Silla Eames</span>. ¿Quiéres que haga un pedido a tu proveedor?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendOrder}
                      disabled={sendStatus === 'sending' || sendStatus === 'sent'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Send className={`h-4 w-4 ${sendStatus === 'sending' ? 'animate-pulse' : ''}`} />
                      {sendStatus === 'sent' ? 'Enviado' : sendStatus === 'sending' ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
                {sendStatus === 'sent' && (
                  <p className="mt-2 text-xs sm:text-sm text-green-700">
                    Pedido enviado al proveedor. Te avisaremos cuando lo confirme.
                  </p>
                )}
              </div>
            </div>

            {/* Period Controls - Optimizado para móvil */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Período:</span>
              <div className="flex items-center gap-1 sm:gap-2 flex-1 max-w-[220px] sm:max-w-none">
                {periodButtons.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => handlePeriodChange(period.key)}
                    disabled={dataLoading}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 flex-1 ${
                      selectedPeriod === period.key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading indicator for data refresh */}
            {dataLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Actualizando datos del dashboard...
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div></div>}>
              <DashboardStats
                dashboardStats={stats}
                products={products}
                customers={customers}
                formatCurrency={formatCurrency}
              />
            </Suspense>

            {/* Quick Actions */}
            <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <QuickActions currentBusiness={currentBusiness} />
            </Suspense>

            {/* Top Products and Recent Sales - Optimizado para móvil */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <TopProducts
                  topItems={topItems}
                  selectedPeriod={selectedPeriod}
                  formatCurrency={formatCurrency}
                />
              </Suspense>
              
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <RecentSales
                  recentSales={recentSales}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </Suspense>
            </div>

            {/* AI/ML Monitoring Dashboard - Phase 5 */}
            {currentBusiness?.id && (
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <MonitoringDashboard tenantId={currentBusiness.id} />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Home component that wraps HomeContent with Layout
const Home: React.FC = () => {
  return (
    <Layout activeSection="dashboard">
      <HomeContent />
    </Layout>
  );
};

export default Home;
