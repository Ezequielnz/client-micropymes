import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useFinanceData } from '../hooks/useFinanceData';
import { useUserPermissions } from '../hooks/useUserPermissions'; // Permisos
import { PageLoader } from '../components/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Eye,
  FileText,
  CreditCard,
  RefreshCw
} from 'lucide-react';

// Lazy load finance components
const FinanzasMovimientos = lazy(() => import('../components/finance/FinanzasMovimientos'));
const FinanzasCategorias = lazy(() => import('../components/finance/FinanzasCategorias'));
const CuentasPendientes = lazy(() => import('../components/finance/CuentasPendientes'));
const FlujoCajaChart = lazy(() => import('../components/finance/FlujoCajaChart'));
const FinanceDashboard = lazy(() => import('../components/finance/FinanceDashboard'));

const FinanzasContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movimientoAction, setMovimientoAction] = useState(null); // Para comunicar acciones al componente de movimientos
  const { currentBusiness, currentBranch, branches, branchesLoading } = useBusinessContext();
  const navigate = useNavigate();
  const branchId = currentBranch?.id ?? null;
  const branchSelectionRequired = !branchesLoading && (branches?.length ?? 0) > 1;
  const branchReady = !branchSelectionRequired || !!branchId;

  // Permisos: helpers para controlar acceso
  const {
    canView,
    canEdit,
    canDelete,
    canAssign,
    hasFullAccess,
    isAdmin,
    isCreator,
    hasPermission
  } = useUserPermissions(currentBusiness?.id);

  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getFirstDayOfMonthStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const [period, setPeriod] = useState('mes'); // 'mes', 'trimestre', 'año', 'personalizado'
  const [customDates, setCustomDates] = useState({
    desde: getFirstDayOfMonthStr(),
    hasta: getTodayStr()
  });

  const getPeriodDates = useCallback((periodType) => {
    const now = new Date();
    let desde = '';
    let hasta = '';

    if (periodType === 'mes') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      
      desde = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      hasta = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    } else if (periodType === 'trimestre') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const quarterStartMonth = Math.floor(month / 3) * 3;
      const lastMonthOfQuarter = quarterStartMonth + 2;
      const lastDay = new Date(year, lastMonthOfQuarter + 1, 0);

      desde = `${year}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
      hasta = `${year}-${String(lastMonthOfQuarter + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    } else if (periodType === 'año') {
      const year = now.getFullYear();
      desde = `${year}-01-01`;
      hasta = `${year}-12-31`;
    }
    return { desde, hasta };
  }, []);

  const dateRange = useMemo(() => {
    if (period === 'personalizado') {
      return {
        desde: customDates.desde,
        hasta: customDates.hasta
      };
    }
    return getPeriodDates(period);
  }, [period, customDates, getPeriodDates]);

  // Estado y hooks para datos de finanzas
  const {
    stats, movimientos, cuentasPendientes,
    loading: isLoading, error: dataError, lastUpdate,
    refreshData
  } = useFinanceData(currentBusiness, { 
    branchId, 
    branchReady,
    fecha_desde: dateRange.desde,
    fecha_hasta: dateRange.hasta
  });

  // ✅ OPTIMIZED: Memoized format functions to prevent recreation on every render
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && dateString.length === 10) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // ✅ OPTIMIZED: Memoized computed states
  const shouldShowError = useMemo(() => {
    return dataError && !isLoading;
  }, [dataError, isLoading]);

  // Redirect if no business selected
  useEffect(() => {
    if (!currentBusiness) {
      navigate('/my-businesses');
    }
  }, [currentBusiness, navigate]);

  if (!currentBusiness) {
    return <PageLoader />;
  }

  if (branchesLoading) {
    return <PageLoader />;
  }

  if (branchSelectionRequired && !branchReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-yellow-900">Selecciona una sucursal</h2>
          <p className="mt-2 text-sm text-yellow-800">
            Elegí una sucursal desde el selector superior para ver los datos financieros asociados.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Resumen',
      icon: DollarSign,
      component: null // Renderizado inline
    },
    {
      id: 'flujo-caja',
      name: 'Flujo de Caja',
      icon: TrendingUp,
      component: FlujoCajaChart
    },
    {
      id: 'movimientos',
      name: 'Movimientos',
      icon: FileText,
      component: FinanzasMovimientos
    },
    {
      id: 'categorias',
      name: 'Categorías',
      icon: Eye,
      component: FinanzasCategorias
    },
    {
      id: 'cuentas',
      name: 'Cuentas Pendientes',
      icon: CreditCard,
      component: CuentasPendientes
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FlujoCajaChart;

  // Funciones para los accesos directos del dashboard
  const handleAddIngreso = () => {
    setMovimientoAction({ type: 'add', tipoMovimiento: 'ingreso' });
    setActiveTab('movimientos');
  };

  const handleAddEgreso = () => {
    setMovimientoAction({ type: 'add', tipoMovimiento: 'egreso' });
    setActiveTab('movimientos');
  };

  const handleViewMovimientos = () => {
    setActiveTab('movimientos');
  };

  const handleViewCuentasPendientes = () => {
    setActiveTab('cuentas');
  };

  // Limpiar la acción después de que se procese
  const clearMovimientoAction = () => {
    setMovimientoAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col items-start gap-2 pl-0">
            <div className="text-left w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finanzas</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Gestiona los ingresos, egresos y flujo de caja de {currentBusiness.nombre}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 md:space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-2 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                      bg-white !bg-opacity-100 !bg-transparent
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 !text-blue-600'
                        : 'border-transparent text-gray-500 !text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        -ml-0.5 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5
                        ${activeTab === tab.id
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Period Selector Card */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'mes', label: 'Mes Actual' },
              { id: 'trimestre', label: 'Trimestre' },
              { id: 'año', label: 'Año' },
              { id: 'personalizado', label: 'Rango Personalizado' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  period === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          {period === 'personalizado' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 uppercase font-semibold">Desde:</span>
                <input
                  type="date"
                  value={customDates.desde}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, desde: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 uppercase font-semibold">Hasta:</span>
                <input
                  type="date"
                  value={customDates.hasta}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, hasta: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
            <span className="font-medium">Período: </span>
            <span className="font-semibold text-gray-700">
              {dateRange.desde ? formatDate(dateRange.desde) : 'Inicio'}
            </span>
            <span> al </span>
            <span className="font-semibold text-gray-700">
              {dateRange.hasta ? formatDate(dateRange.hasta) : 'Fin'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {shouldShowError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error al cargar datos: {dataError}
                  </p>
                  <button
                    onClick={refreshData}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          <Suspense fallback={<PageLoader />}>
            {activeTab === 'dashboard' ? (
              <FinanceDashboard 
                stats={stats}
                movimientos={movimientos}
                cuentasPendientes={cuentasPendientes}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onAddIngreso={handleAddIngreso}
                onAddEgreso={handleAddEgreso}
                onViewMovimientos={handleViewMovimientos}
                onViewCuentasPendientes={handleViewCuentasPendientes}
                refreshData={refreshData}
                lastUpdate={lastUpdate}
                isLoading={isLoading}
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                canAssign={canAssign}
                hasFullAccess={hasFullAccess}
                isAdmin={isAdmin}
                isCreator={isCreator}
                hasPermission={hasPermission}
                fechaDesde={dateRange.desde}
                fechaHasta={dateRange.hasta}
              />
            ) : activeTab === 'flujo-caja' ? (
              <FlujoCajaChart 
                businessId={currentBusiness.id} 
                onAddIngreso={handleAddIngreso} 
                onAddEgreso={handleAddEgreso} 
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                hasFullAccess={hasFullAccess}
                fechaDesde={dateRange.desde}
                fechaHasta={dateRange.hasta}
              />
            ) : activeTab === 'movimientos' ? (
              <FinanzasMovimientos 
                businessId={currentBusiness.id} 
                movimientoAction={movimientoAction} 
                onActionProcessed={clearMovimientoAction} 
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                canAssign={canAssign}
                hasFullAccess={hasFullAccess}
                isAdmin={isAdmin}
                isCreator={isCreator}
                hasPermission={hasPermission}
                fechaDesde={dateRange.desde}
                fechaHasta={dateRange.hasta}
              />
            ) : (
              <ActiveComponent 
                businessId={currentBusiness.id} 
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                canAssign={canAssign}
                hasFullAccess={hasFullAccess}
                isAdmin={isAdmin}
                isCreator={isCreator}
                hasPermission={hasPermission}
                fechaDesde={dateRange.desde}
                fechaHasta={dateRange.hasta}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const Finanzas = () => {
  return (
    <Layout>
      <FinanzasContent />
    </Layout>
  );
};

export default Finanzas;
