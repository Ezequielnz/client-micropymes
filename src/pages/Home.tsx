import React, { useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useBusinessesQuery } from '../hooks/useBusinesses';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { useBusinessContext } from '../contexts/BusinessContext';
import { PageLoader } from '../components/LoadingSpinner';
import {
  Building2,
  Plus,
  RefreshCw
} from 'lucide-react';

// Lazy load new dashboard components
const BusinessStatusAlert = lazy(() => import('../components/dashboard/BusinessStatusAlert'));
const AttentionRequired = lazy(() => import('../components/dashboard/AttentionRequired'));
const TodaySummaryCards = lazy(() => import('../components/dashboard/TodaySummaryCards'));
const SalesSparkline = lazy(() => import('../components/dashboard/SalesSparkline'));
const InventoryHealthWidget = lazy(() => import('../components/dashboard/InventoryHealthWidget'));
const QuickActions = lazy(() => import('../components/dashboard/QuickActions'));

// Internal component that uses BusinessContext
const HomeContent: React.FC = () => {
  const navigate = useNavigate();

  // Get current business from context
  const { currentBusiness } = useBusinessContext();

  const {
    data: businesses = [],
    isLoading: businessesLoading,
    error: businessesQueryError,
    refetch: refetchBusinesses,
  } = useBusinessesQuery(true);

  // Usa el nuevo hook con React Query
  const {
    data: dashboardData,
    loading: dataLoading,
    error: dataError,
    refreshData,
    lastUpdate
  } = useDashboardData(currentBusiness);

  // Memoized computed states
  const shouldShowError = useMemo(() => {
    if (!businessesQueryError) {
      return false;
    }
    const status = (businessesQueryError as any)?.response?.status;
    return status !== 401 && status !== 403;
  }, [businessesQueryError]);

  const isLoading = useMemo(() => {
    return businessesLoading;
  }, [businessesLoading]);

  const hasBusinesses = useMemo(() => {
    return businesses.length > 0;
  }, [businesses.length]);

  const hasCurrentBusiness = useMemo(() => {
    return !!currentBusiness;
  }, [currentBusiness]);

  // Verificar token al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Manejar estados de error específicos de autenticación/aprobación
  useEffect(() => {
    if (!businessesQueryError) {
      return;
    }
    const status = (businessesQueryError as any)?.response?.status;
    if (status === 403) {
      navigate('/pending-approval');
    } else if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.clear();
      navigate('/login');
    }
  }, [businessesQueryError, navigate]);

  // Navigation handlers
  const handleCreateBusiness = useCallback(() => {
    navigate('/business-users');
  }, [navigate]);

  const handleReload = useCallback(() => {
    refetchBusinesses();
  }, [refetchBusinesses]);

  const handleGoToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // Memoized current date string
  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Memoized last update time string
  const lastUpdateString = useMemo(() => {
    return lastUpdate ? lastUpdate.toLocaleTimeString('es-AR') : '';
  }, [lastUpdate]);

  // Handle error state
  if (shouldShowError) {
    const queryErrorMessage =
      (businessesQueryError as any)?.response?.data?.detail ||
      businessesQueryError?.message ||
      'Error al verificar el estado de aprobación';

    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg font-medium mb-4">
            Error: {queryErrorMessage}
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
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate w-full max-w-[180px] sm:max-w-xs md:max-w-full">
                {currentBusiness?.nombre || 'tu negocio'} 
                <span className="hidden sm:inline"> | {currentDateString}</span>
              </p>
            </div>
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

      {/* Main Content */}
      <div className="max-w-full md:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
        {!hasBusinesses ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Bienvenido/a a OperixML!</h3>
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
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un negocio</h3>
            <p className="text-gray-500 mb-6">Elige un negocio del menú superior para ver su dashboard</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Error handling for dashboard data */}
            {dataError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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

            {/* Loading indicator for data refresh */}
            {dataLoading && !dashboardData && (
              <div className="flex items-center justify-center py-12">
                <PageLoader message="Cargando resumen del negocio..." variant="primary" />
              </div>
            )}

            {/* Render Dashboard Components when data is available */}
            {dashboardData && (
              <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded-lg mb-6"></div>}>
                <BusinessStatusAlert status={dashboardData.status} />
                
                <AttentionRequired alerts={dashboardData.alerts} />
                
                <TodaySummaryCards summary={dashboardData.today_summary} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Left Column: Trend (Takes 1/3) */}
                  <div className="lg:col-span-1">
                    <SalesSparkline data={dashboardData.sales_trend} />
                  </div>
                  
                  {/* Right Column: Quick Actions (Takes 2/3) */}
                  <div className="lg:col-span-2">
                    <QuickActions currentBusiness={currentBusiness} />
                  </div>
                </div>

                <InventoryHealthWidget health={dashboardData.inventory_health} />
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
