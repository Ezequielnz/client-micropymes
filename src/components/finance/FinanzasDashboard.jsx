import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Plus,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PageLoader } from '../LoadingSpinner';

const FinanzasDashboard = ({ businessId }) => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResumen = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/v1/businesses/${businessId}/finanzas/resumen`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el resumen financiero');
      }

      const data = await response.json();
      setResumen(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching financial summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchResumen();
    }
  }, [businessId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchResumen}
                className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ingresosChange = calculatePercentageChange(resumen?.ingresos_mes, resumen?.ingresos_mes_anterior);
  const egresosChange = calculatePercentageChange(resumen?.egresos_mes, resumen?.egresos_mes_anterior);

  return (
    <div className="p-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h2>
        <button
          onClick={fetchResumen}
          disabled={refreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ingresos del mes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Ingresos del Mes
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(resumen?.ingresos_mes)}
                </dd>
                {resumen?.ingresos_mes_anterior !== undefined && (
                  <dd className={`text-sm ${ingresosChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ingresosChange >= 0 ? '+' : ''}{ingresosChange.toFixed(1)}% vs mes anterior
                  </dd>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Egresos del mes */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Egresos del Mes
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(resumen?.egresos_mes)}
                </dd>
                {resumen?.egresos_mes_anterior !== undefined && (
                  <dd className={`text-sm ${egresosChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {egresosChange >= 0 ? '+' : ''}{egresosChange.toFixed(1)}% vs mes anterior
                  </dd>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Saldo actual */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className={`h-8 w-8 ${resumen?.saldo_actual >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Saldo del Mes
                </dt>
                <dd className={`text-lg font-medium ${resumen?.saldo_actual >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  {formatCurrency(resumen?.saldo_actual)}
                </dd>
                <dd className="text-sm text-gray-500">
                  Ingresos - Egresos
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Mes actual */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Período
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </dd>
                <dd className="text-sm text-gray-500">
                  Mes actual
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 !important"
            onClick={() => {
              // TODO: Open add income modal
              console.log('Add income');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ingreso
          </button>
          
          <button 
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 !important"
            onClick={() => {
              // TODO: Open add expense modal
              console.log('Add expense');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Egreso
          </button>
          
          <button 
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !important"
            onClick={() => {
              // TODO: Navigate to movements
              console.log('View movements');
            }}
          >
            Ver Movimientos
          </button>
          
          <button 
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !important"
            onClick={() => {
              // TODO: Navigate to pending accounts
              console.log('View pending accounts');
            }}
          >
            Cuentas Pendientes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanzasDashboard;
