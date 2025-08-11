import React, { useState } from 'react';
import PermissionGuard from '../PermissionGuard';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  X,
  Tag
} from 'lucide-react';
import { PageLoader } from '../LoadingSpinner';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { useFinanceData } from '../../hooks/useFinanceData';

const FinanzasCategorias = () => {
  const { currentBusiness } = useBusinessContext();
  const {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refreshCategorias
  } = useFinanceData(currentBusiness);

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'ingreso',
    activo: true
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await updateCategoria.mutateAsync({ id: editingCategoria.id, data: formData });
      } else {
        await createCategoria.mutateAsync(formData);
      }
      setShowModal(false);
      setEditingCategoria(null);
      resetForm();
    } catch (err) {
      console.error('Error saving category:', err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }
    try {
      await deleteCategoria.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'ingreso',
      activo: true
    });
  };

  const openEditModal = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      tipo: categoria.tipo,
      activo: categoria.activo
    });
    setShowModal(true);
  };

  const filteredCategorias = categorias.filter(categoria => {
    if (!filter) return true;
    return categoria.tipo === filter;
  });

  const categoriasIngresos = filteredCategorias.filter(c => c.tipo === 'ingreso');
  const categoriasEgresos = filteredCategorias.filter(c => c.tipo === 'egreso');

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categorías Financieras</h2>
        <PermissionGuard resource="categorias_financieras" action="edit">
          <button
            onClick={() => {
              resetForm();
              setEditingCategoria(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !important"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </button>
        </PermissionGuard>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === '' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todas ({categorias.length})
          </button>
          <button
            onClick={() => setFilter('ingreso')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'ingreso' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Ingresos ({categoriasIngresos.length})
          </button>
          <button
            onClick={() => setFilter('egreso')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'egreso' 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Egresos ({categoriasEgresos.length})
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay categorías {filter ? `de ${filter}` : ''} registradas
          </div>
        ) : (
          filteredCategorias.map((categoria) => (
            <div key={categoria.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {categoria.tipo === 'ingreso' ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{categoria.nombre}</h3>
                    <p className="text-sm text-gray-500">{categoria.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <PermissionGuard resource="categorias_financieras" action="edit">
                    <button
                      onClick={() => openEditModal(categoria)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard resource="categorias_financieras" action="delete">
                    <button
                      onClick={() => handleDelete(categoria.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  categoria.tipo === 'ingreso' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {categoria.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  categoria.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {categoria.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción de la categoría"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Categoría activa
                </label>
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
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanzasCategorias;
