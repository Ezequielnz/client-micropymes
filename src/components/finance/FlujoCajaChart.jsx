import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  PlusCircle,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { PageLoader } from '../LoadingSpinner';

const FlujoCajaChart = ({ businessId, onAddIngreso, onAddEgreso }) => {
  const [flujoCaja, setFlujoCaja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const fetchFlujoCaja = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/businesses/${businessId}/finanzas/flujo-caja?mes=${selectedMonth}&anio=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar el flujo de caja');
      }

      const data = await response.json();
      setFlujoCaja(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cash flow:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchFlujoCaja();
    }
  }, [businessId, selectedMonth, selectedYear]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const calculateTotals = () => {
    if (!flujoCaja?.flujo_diario) return { totalIngresos: 0, totalEgresos: 0, saldoFinal: 0 };
    
    const totalIngresos = flujoCaja.flujo_diario.reduce((sum, day) => sum + parseFloat(day.ingresos || 0), 0);
    const totalEgresos = flujoCaja.flujo_diario.reduce((sum, day) => sum + parseFloat(day.egresos || 0), 0);
    const saldoFinal = flujoCaja.flujo_diario[flujoCaja.flujo_diario.length - 1]?.saldo_acumulado || 0;
    
    return { totalIngresos, totalEgresos, saldoFinal };
  };

  const { totalIngresos, totalEgresos, saldoFinal } = calculateTotals();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Flujo de Caja</h2>
        <div className="flex flex-wrap gap-2 sm:gap-2">
          {/* Accesos directos para agregar ingresos y egresos */}
          {onAddIngreso && (
            <button
              onClick={onAddIngreso}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-grow sm:flex-grow-0"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <ArrowUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Nuevo Ingreso
            </button>
          )}
          {onAddEgreso && (
            <button
              onClick={onAddEgreso}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-grow sm:flex-grow-0"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <ArrowDown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Nuevo Egreso
            </button>
          )}
          <button
            onClick={fetchFlujoCaja}
            disabled={refreshing}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex-grow sm:flex-grow-0"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
        <div className="flex flex-row items-start gap-4 justify-start">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 text-black"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="text-black">
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 text-black"
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year} className="text-black">
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Ingresos
                </dt>
                <dd className="text-base sm:text-lg font-medium text-green-600">
                  {formatCurrency(totalIngresos)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Egresos
                </dt>
                <dd className="text-base sm:text-lg font-medium text-red-600">
                  {formatCurrency(totalEgresos)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className={`h-8 w-8 ${saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Saldo Final
                </dt>
                <dd className={`text-base sm:text-lg font-medium ${saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(saldoFinal)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Flujo Diario - {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          
          {error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : !flujoCaja?.flujo_diario || flujoCaja.flujo_diario.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay datos de flujo de caja para este período
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Egresos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Diario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flujoCaja.flujo_diario.map((day, index) => {
                    const saldoDiario = parseFloat(day.ingresos || 0) - parseFloat(day.egresos || 0);
                    const hasMovement = parseFloat(day.ingresos || 0) > 0 || parseFloat(day.egresos || 0) > 0;
                    
                    return (
                      <tr 
                        key={index} 
                        className={hasMovement ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {formatDate(day.fecha)}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600">
                          {parseFloat(day.ingresos || 0) > 0 ? formatCurrency(day.ingresos) : '-'}
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600">
                          {parseFloat(day.egresos || 0) > 0 ? formatCurrency(day.egresos) : '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          saldoDiario > 0 ? 'text-green-600' : 
                          saldoDiario < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {saldoDiario !== 0 ? formatCurrency(saldoDiario) : '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          parseFloat(day.saldo_acumulado || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(day.saldo_acumulado)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Simple Chart Visualization */}
      {flujoCaja?.flujo_diario && flujoCaja.flujo_diario.length > 0 && (
        <div className="mt-4 sm:mt-6 md:mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-3 py-3 sm:px-4 sm:py-5 md:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
              Visualización del Saldo Acumulado
            </h3>
            <div className="relative h-48 sm:h-64 bg-gray-50 rounded-lg p-2 sm:p-4 overflow-x-auto">
              <div className="flex items-end justify-between h-full space-x-1 min-w-full">
                {flujoCaja.flujo_diario.map((day, index) => {
                  const maxSaldo = Math.max(...flujoCaja.flujo_diario.map(d => Math.abs(parseFloat(d.saldo_acumulado || 0))));
                  const height = maxSaldo > 0 ? Math.abs(parseFloat(day.saldo_acumulado || 0)) / maxSaldo * 100 : 0;
                  const isPositive = parseFloat(day.saldo_acumulado || 0) >= 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center group relative">
                      <div 
                        className={`w-2 ${isPositive ? 'bg-blue-500' : 'bg-red-500'} rounded-t transition-all duration-200 group-hover:opacity-80`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                        {new Date(day.fecha).getDate()}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {formatDate(day.fecha)}<br/>
                        Saldo: {formatCurrency(day.saldo_acumulado)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Zero line */}
              <div className="absolute left-0 right-0 bottom-8 border-t border-gray-300"></div>
            </div>
            <div className="mt-2 text-sm text-gray-500 text-center">
              Cada barra representa el saldo acumulado por día. Azul = positivo, Rojo = negativo.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlujoCajaChart;
