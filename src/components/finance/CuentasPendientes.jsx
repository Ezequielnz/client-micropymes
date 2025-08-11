import React, { useState } from 'react';
import PermissionGuard from '../PermissionGuard';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { useFinanceData } from '../../hooks/useFinanceData';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Building,
  X,
  Filter
} from 'lucide-react';
import { PageLoader } from '../LoadingSpinner';

const CuentasPendientes = () => {
  const { currentBusiness } = useBusinessContext();
  const {
    cuentasPendientes,
    loading,
    error,
    createCuentaPendiente,
    updateCuentaPendiente,
    deleteCuentaPendiente,
    refreshCuentasPendientes
  } = useFinanceData(currentBusiness);

  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [activeTab, setActiveTab] = useState('cobrar');
  const [filters, setFilters] = useState({
    estado: '',
    vencimiento_desde: '',
    vencimiento_hasta: ''
  });
  const [formData, setFormData] = useState({
    tipo: 'por_cobrar',
    cliente_id: '',
    proveedor_nombre: '',
    monto: '',
    fecha_vencimiento: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    descripcion: '',
    observaciones: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cuentaData = {
        ...formData,
        monto: parseFloat(formData.monto),
        cliente_id: formData.cliente_id || null,
        proveedor_nombre: formData.proveedor_nombre || null
      };
      if (editingCuenta) {
        await updateCuentaPendiente.mutateAsync({ id: editingCuenta.id, data: cuentaData });
      } else {
        await createCuentaPendiente.mutateAsync(cuentaData);
      }
      setShowModal(false);
      setEditingCuenta(null);
      resetForm();
    } catch (err) {
      console.error('Error saving account:', err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
      return;
    }
    try {
      await deleteCuentaPendiente.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: activeTab === 'cobrar' ? 'por_cobrar' : 'por_pagar',
      cliente_id: '',
      proveedor_nombre: '',
      monto: '',
      fecha_vencimiento: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      descripcion: '',
      observaciones: ''
    });
  };

  const openEditModal = (cuenta) => {
    setEditingCuenta(cuenta);
    setFormData({
      tipo: cuenta.tipo,
      cliente_id: cuenta.cliente_id || '',
      proveedor_nombre: cuenta.proveedor_nombre || '',
      monto: cuenta.monto.toString(),
      fecha_vencimiento: cuenta.fecha_vencimiento,
      fecha_emision: cuenta.fecha_emision,
      estado: cuenta.estado,
      descripcion: cuenta.descripcion,
      observaciones: cuenta.observaciones || ''
    });
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getStatusColor = (estado, diasVencimiento) => {
    if (estado === 'pagado') return 'text-green-600 bg-green-100';
    if (estado === 'vencido' || diasVencimiento < 0) return 'text-red-600 bg-red-100';
    if (diasVencimiento <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getStatusText = (estado, diasVencimiento) => {
    if (estado === 'pagado') return 'Pagado';
    if (estado === 'vencido' || diasVencimiento < 0) return 'Vencido';
    if (diasVencimiento === 0) return 'Vence hoy';
    if (diasVencimiento <= 7) return `Vence en ${diasVencimiento} días`;
    return 'Pendiente';
  };

  // Filtrar cuentas pendientes por tipo
  const cuentasCobrar = cuentasPendientes?.filter(c => c.tipo === 'por_cobrar') || [];
  const cuentasPagar = cuentasPendientes?.filter(c => c.tipo === 'por_pagar') || [];
  
  const currentData = activeTab === 'cobrar' ? cuentasCobrar : cuentasPagar;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cuentas Pendientes</h2>
        <PermissionGuard resource="cuentas_pendientes" action="edit">
          <button
            onClick={() => {
              resetForm();
              setEditingCuenta(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !important"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cobrar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cobrar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Por Cobrar ({cuentasCobrar.length})
            </button>
            <button
              onClick={() => setActiveTab('pagar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pagar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Por Pagar ({cuentasPagar.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento desde</label>
            <input
              type="date"
              value={filters.vencimiento_desde}
              onChange={(e) => setFilters({...filters, vencimiento_desde: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento hasta</label>
            <input
              type="date"
              value={filters.vencimiento_hasta}
              onChange={(e) => setFilters({...filters, vencimiento_hasta: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentData.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No hay cuentas {activeTab === 'cobrar' ? 'por cobrar' : 'por pagar'} registradas
            </li>
          ) : (
            currentData.map((cuenta) => (
              <li key={cuenta.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {activeTab === 'cobrar' ? (
                        <User className="h-6 w-6 text-green-600" />
                      ) : (
                        <Building className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {cuenta.cliente_nombre || cuenta.proveedor_nombre || 'Sin nombre'}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cuenta.estado, cuenta.dias_vencimiento)}`}>
                          {getStatusText(cuenta.estado, cuenta.dias_vencimiento)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>{cuenta.descripcion}</span>
                        <span className="ml-2">• Vence: {formatDate(cuenta.fecha_vencimiento)}</span>
                        {cuenta.dias_vencimiento !== undefined && cuenta.estado !== 'pagado' && (
                          <span className="ml-2">
                            • {cuenta.dias_vencimiento >= 0 ? `${cuenta.dias_vencimiento} días` : `${Math.abs(cuenta.dias_vencimiento)} días vencido`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(cuenta.monto)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Emitido: {formatDate(cuenta.fecha_emision)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {cuenta.estado === 'pendiente' && (
                        <button
                          onClick={() => handleMarkAsPaid(cuenta.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Marcar como pagado"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <PermissionGuard resource="cuentas_pendientes" action="edit">
                        <button
                          onClick={() => openEditModal(cuenta)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard resource="cuentas_pendientes" action="delete">
                        <button
                          onClick={() => handleDelete(cuenta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="por_cobrar">Por Cobrar</option>
                  <option value="por_pagar">Por Pagar</option>
                </select>
              </div>

              {formData.tipo === 'por_cobrar' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                  <input
                    type="text"
                    value={formData.proveedor_nombre}
                    onChange={(e) => setFormData({...formData, proveedor_nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del proveedor"
                    required={formData.tipo === 'por_pagar'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Emisión *</label>
                <input
                  type="date"
                  value={formData.fecha_emision}
                  onChange={(e) => setFormData({...formData, fecha_emision: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de la cuenta"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones adicionales"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !important"
                >
                  {editingCuenta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuentasPendientes;
