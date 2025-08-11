import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const FinanceDashboard = ({
  stats,
  movimientos,
  cuentasPendientes,
  formatCurrency,
  formatDate,
  onAddIngreso,
  onAddEgreso,
  onViewMovimientos,
  onViewCuentasPendientes,
  refreshData,
  lastUpdate,
  isLoading
}) => {
  // ✅ OPTIMIZED: Memoized computed data
  const recentMovimientos = useMemo(() => {
    return movimientos
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);
  }, [movimientos]);

  const pendingCuentas = useMemo(() => {
    return cuentasPendientes
      .filter(cuenta => cuenta.estado === 'pendiente')
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
      .slice(0, 5);
  }, [cuentasPendientes]);

  const balanceColor = useMemo(() => {
    if (stats.balance > 0) return 'text-green-600';
    if (stats.balance < 0) return 'text-red-600';
    return 'text-gray-600';
  }, [stats.balance]);

  const balanceIcon = useMemo(() => {
    if (stats.balance > 0) return TrendingUp;
    if (stats.balance < 0) return TrendingDown;
    return DollarSign;
  }, [stats.balance]);

  const BalanceIcon = balanceIcon;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header con botón de refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resumen Financiero</h2>
          {lastUpdate && lastUpdate instanceof Date && !isNaN(lastUpdate.getTime()) && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {formatDate(lastUpdate.toISOString())} a las {lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Ingresos */}
        <div className="overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-emerald-600 truncate">
                    Total Ingresos
                  </dt>
                  <dd className="text-lg font-medium text-emerald-800">
                    {formatCurrency(stats.total_ingresos)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-rose-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-rose-600 truncate">
                    Total Egresos
                  </dt>
                  <dd className="text-lg font-medium text-rose-800">
                    {formatCurrency(stats.total_egresos)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BalanceIcon className={`h-6 w-6 ${balanceColor.replace('text-', 'text-').replace('-600', '-500')}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Balance
                  </dt>
                  <dd className={`text-lg font-medium ${balanceColor.replace('-600', '-700')}`}>
                    {formatCurrency(stats.balance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Cuentas Pendientes */}
        <div className="overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-600 truncate">
                    Cuentas Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-amber-800">
                    {formatCurrency(stats.cuentas_pendientes)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onAddIngreso}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ingreso
          </button>
          <button
            onClick={onAddEgreso}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Egreso
          </button>
          <button
            onClick={onViewMovimientos}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Movimientos
          </button>
          <button
            onClick={onViewCuentasPendientes}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Cuentas
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos Recientes */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Movimientos Recientes</h3>
              <button
                onClick={onViewMovimientos}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {recentMovimientos.length > 0 ? (
                recentMovimientos.map((movimiento) => (
                  <div key={movimiento.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
                        movimiento.tipo === 'ingreso' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                          {movimiento.descripcion}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(movimiento.fecha)}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(Math.abs(movimiento.monto))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay movimientos recientes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cuentas Pendientes */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cuentas Pendientes</h3>
              <button
                onClick={onViewCuentasPendientes}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {pendingCuentas.length > 0 ? (
                pendingCuentas.map((cuenta) => (
                  <div key={cuenta.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-3 ${
                        cuenta.tipo === 'cobrar' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                          {cuenta.descripcion}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vence: {formatDate(cuenta.fecha_vencimiento)}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      cuenta.tipo === 'cobrar' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(cuenta.monto)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay cuentas pendientes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
