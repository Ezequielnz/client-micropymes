import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, serviceAPI, categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import { useUserPermissions } from '../hooks/useUserPermissions';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { useBusinessContext } from '../contexts/BusinessContext';

// Memoized component to avoid inline component recreation
const OptimizedTable = React.memo(({ 
  currentData, 
  activeTab, 
  categories, 
  onEdit, 
  onDelete, 
  loading,
  canEdit,
  canDelete 
}) => {
  const getCategoryName = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.nombre || 'Sin categoría';
  }, [categories]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#666' }}>Cargando...</p>
      </div>
    );
  }

  // Calculate column count for empty state
  const columnCount = activeTab === 'products' ? (canEdit || canDelete ? 6 : 5) : (canEdit || canDelete ? 5 : 4);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#333' }}>
              Nombre
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#333' }}>
              Descripción
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#333' }}>
              Precio
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#333' }}>
              Categoría
            </th>
            {activeTab === 'products' && (
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#333' }}>
                Stock
              </th>
            )}
            {(canEdit || canDelete) && (
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', color: '#333' }}>
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td 
                colSpan={columnCount}
                style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#666',
                  fontStyle: 'italic'
                }}
              >
                No hay {activeTab === 'products' ? 'productos' : 'servicios'} registrados
              </td>
            </tr>
          ) : (
            currentData.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', color: '#333' }}>{item.name}</td>
                <td style={{ padding: '12px', color: '#333' }}>{item.description}</td>
                <td style={{ padding: '12px', color: '#333' }}>${item.price?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: '12px', color: '#333' }}>
                  {getCategoryName(item.category)}
                </td>
                {activeTab === 'products' && (
                  <td style={{ padding: '12px', color: '#333' }}>{item.stock} {item.unit}</td>
                )}
                {(canEdit || canDelete) && (
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {canEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          fontSize: '12px'
                        }}
                      >
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

const ProductsAndServices = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // ✅ FIXED: Use BusinessContext instead of useParams
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // Get permissions
  const { canEdit, canDelete, canView, isLoading: permissionsLoading } = useUserPermissions(businessId);

  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stock: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // ✅ OPTIMIZED: Memoized permissions for products
  const canEditProducts = useMemo(() => canEdit('productos'), [canEdit]);
  const canDeleteProducts = useMemo(() => canDelete('productos'), [canDelete]);
  const canViewProducts = useMemo(() => canView('productos'), [canView]);

  // ✅ FIXED: Better loading and undefined handling
  if (!currentBusiness) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
            No hay negocio seleccionado
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Por favor selecciona un negocio desde el menú superior para gestionar productos y servicios.
          </p>
        </div>
      </div>
    );
  }

  // Show loading while permissions are being fetched
  if (permissionsLoading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Cargando permisos...</p>
        </div>
      </div>
    );
  }

  // Check if user can view products at all
  if (!canViewProducts) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 0',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#991b1b', marginBottom: '8px' }}>
            Acceso denegado
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '24px' }}>
            No tienes permisos para ver productos y servicios.
          </p>
        </div>
      </div>
    );
  }

  // ✅ OPTIMIZED: React Query for data fetching with smart caching - Only when businessId is available
  const { 
    data: products = [], 
    isLoading: loadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => productAPI.getProducts(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { 
    data: services = [], 
    isLoading: loadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ['services', businessId],
    queryFn: () => serviceAPI.getServices(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { 
    data: categories = [], 
    isLoading: loadingCategories
  } = useQuery({
    queryKey: ['categories', businessId],
    queryFn: () => categoryAPI.getCategories(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 10 * 60 * 1000, // Categories change less frequently
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Memoized data transformation
  const processedProducts = useMemo(() => {
    return products.map(item => ({
          ...item,
          name: item.nombre,
          price: item.precio_venta,
          category: item.categoria_id,
          stock: item.stock_actual,
          unit: item.codigo || ''
    }));
  }, [products]);

  const processedServices = useMemo(() => {
    return services.map(item => ({
          ...item,
          name: item.nombre,
          price: item.precio,
          category: item.categoria_id
    }));
  }, [services]);

  // ✅ OPTIMIZED: Smart current data selection
  const currentData = useMemo(() => {
    return activeTab === 'products' ? processedProducts : processedServices;
  }, [activeTab, processedProducts, processedServices]);

  // ✅ OPTIMIZED: Computed loading state
  const isLoading = useMemo(() => {
    if (activeTab === 'products') return loadingProducts;
    return loadingServices;
  }, [activeTab, loadingProducts, loadingServices]);

  // ✅ OPTIMIZED: Computed error state
  const currentError = useMemo(() => {
    if (activeTab === 'products') return productsError;
    return servicesError;
  }, [activeTab, productsError, servicesError]);

  // ✅ OPTIMIZED: Mutations with optimistic updates
  const createProductMutation = useMutation({
    mutationFn: (payload) => productAPI.createProduct(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId]);
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }) => productAPI.updateProduct(businessId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId]);
      handleCloseModal();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId]);
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload) => serviceAPI.createService(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId]);
      handleCloseModal();
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => serviceAPI.updateService(businessId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId]);
      handleCloseModal();
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => serviceAPI.deleteService(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId]);
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => categoryAPI.createCategory(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories', businessId]);
      setCategoryFormData({ nombre: '', descripcion: '' });
      setShowCategoryModal(false);
    }
  });

  // ✅ OPTIMIZED: Memoized handlers
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!businessId) return;

      // Map frontend form fields to backend expected fields
      const payload = {
        nombre: formData.name,
        descripcion: formData.description,
        categoria_id: formData.category || null,
        business_id: businessId
      };

    try {
      if (activeTab === 'products') {
        payload.precio_venta = parseFloat(formData.price) || 0;
        payload.stock_actual = parseInt(formData.stock) || 0;
        payload.codigo = formData.unit || '';
        
        if (editingItem) {
          await updateProductMutation.mutateAsync({ id: editingItem.id, payload });
        } else {
          await createProductMutation.mutateAsync(payload);
        }
      } else {
        payload.precio = parseFloat(formData.price) || 0;
        
        if (editingItem) {
          await updateServiceMutation.mutateAsync({ id: editingItem.id, payload });
        } else {
          await createServiceMutation.mutateAsync(payload);
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      // Error handling could be improved with toast notifications
    }
  }, [formData, businessId, activeTab, editingItem, createProductMutation, updateProductMutation, createServiceMutation, updateServiceMutation]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    try {
      if (activeTab === 'products') {
        await deleteProductMutation.mutateAsync(id);
      } else {
        await deleteServiceMutation.mutateAsync(id);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }, [activeTab, deleteProductMutation, deleteServiceMutation]);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || item.nombre || '',
      description: item.description || item.descripcion || '',
      price: item.price?.toString() || item.precio_venta?.toString() || item.precio?.toString() || '',
      category: item.category || item.categoria_id || '',
      stock: item.stock?.toString() || item.stock_actual?.toString() || '',
      unit: item.unit || item.codigo || ''
    });
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      unit: ''
    });
  }, []);

  const handleCreateCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!businessId || !categoryFormData.nombre.trim()) return;

    try {
      await createCategoryMutation.mutateAsync({
        nombre: categoryFormData.nombre.trim(),
        descripcion: categoryFormData.descripcion.trim()
      });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }, [businessId, categoryFormData, createCategoryMutation]);

  const handleCloseCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    setCategoryFormData({ nombre: '', descripcion: '' });
  }, []);

  // Determine if any mutation is loading
  const isMutating = createProductMutation.isPending || 
                    updateProductMutation.isPending || 
                    deleteProductMutation.isPending ||
                    createServiceMutation.isPending || 
                    updateServiceMutation.isPending || 
                    deleteServiceMutation.isPending ||
                    createCategoryMutation.isPending;

  const currentErrorMessage = useMemo(() => {
    if (currentError) {
      if (currentError.response?.status === 401) {
        return 'No tienes autorización para acceder a este negocio. Por favor verifica tu sesión.';
      } else if (currentError.response?.status === 404) {
        return `No se encontró el endpoint para ${activeTab === 'products' ? 'productos' : 'servicios'}. Verifica la configuración del servidor.`;
      } else {
        return `Error al cargar ${activeTab === 'products' ? 'productos' : 'servicios'}: ${currentError.message}`;
      }
    }
    return '';
  }, [currentError, activeTab]);

  return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            Productos y Servicios
          </h1>
          <p style={{ color: '#666' }}>
            Gestiona los productos y servicios de tu negocio
          </p>
        </div>

      {currentErrorMessage && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
          {currentErrorMessage}
          </div>
        )}

        {/* Tabs */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ borderBottom: '2px solid #e5e5e5' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: activeTab === 'products' ? '#007bff' : 'transparent',
                color: activeTab === 'products' ? 'white' : '#333',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('services')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'services' ? '#007bff' : 'transparent',
                color: activeTab === 'services' ? 'white' : '#333',
                border: 'none',
                borderRadius: '5px 5px 0 0',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Servicios
            </button>
          </div>
        </div>

        {/* Add Button */}
        <div style={{ marginBottom: '20px' }}>
        {canEditProducts && (
          <button
            onClick={() => setShowModal(true)}
            disabled={isMutating}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isMutating ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: isMutating ? 0.6 : 1
            }}
          >
            + Agregar {activeTab === 'products' ? 'Producto' : 'Servicio'}
          </button>
        )}
        </div>

      {/* ✅ OPTIMIZED: Memoized table component */}
      <OptimizedTable
        currentData={currentData}
        activeTab={activeTab}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        canEdit={canEditProducts}
        canDelete={canDeleteProducts}
      />

      {/* Modal - keeping original structure but with optimized handlers */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>
                {editingItem ? 'Editar' : 'Agregar'} {activeTab === 'products' ? 'Producto' : 'Servicio'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Categoría
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#333'
                      }}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                    disabled={isMutating}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '4px',
                      cursor: isMutating ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      minWidth: '40px',
                      opacity: isMutating ? 0.6 : 1
                      }}
                      title="Agregar nueva categoría"
                    >
                      +
                    </button>
                  </div>
                </div>

                {activeTab === 'products' && (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#333'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                        Unidad
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="ej: kg, unidades, litros"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#333'
                        }}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                  disabled={isMutating}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                    cursor: isMutating ? 'not-allowed' : 'pointer',
                    opacity: isMutating ? 0.6 : 1
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                  disabled={isMutating}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                    cursor: isMutating ? 'not-allowed' : 'pointer',
                    opacity: isMutating ? 0.6 : 1
                    }}
                  >
                  {isMutating ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>
              Agregar Categoría
              </h2>
              
              <form onSubmit={handleCreateCategory}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.nombre}
                    onChange={(e) => setCategoryFormData({...categoryFormData, nombre: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Descripción
                  </label>
                  <textarea
                    value={categoryFormData.descripcion}
                    onChange={(e) => setCategoryFormData({...categoryFormData, descripcion: e.target.value})}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                  disabled={createCategoryMutation.isPending}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                    cursor: createCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: createCategoryMutation.isPending ? 0.6 : 1
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                  disabled={createCategoryMutation.isPending}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                    cursor: createCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: createCategoryMutation.isPending ? 0.6 : 1
                    }}
                  >
                  {createCategoryMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default function ProtectedProductsAndServices() {
  return (
    <Layout activeSection="products">
    <PermissionGuard requiredModule="inventario" requiredAction="ver">
      <ProductsAndServices />
    </PermissionGuard>
    </Layout>
  );
}