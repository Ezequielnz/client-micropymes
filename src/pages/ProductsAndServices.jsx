import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, serviceAPI, categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import { useUserPermissions } from '../hooks/useUserPermissions';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { useBusinessContext } from '../contexts/BusinessContext';
import CatalogUpload from '../components/CatalogUpload';

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
  const columnCount = activeTab === 'products' ? (canEdit || canDelete ? 9 : 8) : (canEdit || canDelete ? 6 : 5);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Vista móvil - Cards */}
      <div className="block md:hidden">
        {currentData.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">
            No hay {activeTab === 'products' ? 'productos' : 'servicios'} registrados
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentData.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                  <span className="text-lg font-semibold text-blue-600">${item.price?.toFixed(2) || '0.00'}</span>
                </div>
                {item.description && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description}</p>
                )}
                {activeTab === 'products' ? (
                  <div className="text-xs text-gray-700 mb-2">
                    <span className="font-medium">Compra:</span> {typeof item.purchasePrice === 'number' ? `$${item.purchasePrice.toFixed(2)}` : '—'}
                  </div>
                ) : (
                  <div className="text-xs text-gray-700 mb-2">
                    <span className="font-medium">Costo:</span> {typeof item.cost === 'number' ? `$${item.cost.toFixed(2)}` : '—'}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{getCategoryName(item.category)}</span>
                  {activeTab === 'products' && (
                    <span>Stock: {item.stock} {item.unit}</span>
                  )}
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex gap-2 mt-3">
                    {canEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(item.id, item.name)}
                        className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                Código
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                Nombre
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                Descripción
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                Precio
              </th>
              {activeTab === 'products' ? (
                <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                  Precio Compra
                </th>
              ) : (
                <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                  Costo
                </th>
              )}
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                Categoría
              </th>
              {activeTab === 'products' && (
                <>
                  <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">
                    Unidad
                  </th>
                </>
              )}
              {(canEdit || canDelete) && (
                <th className="px-4 py-3 text-center border-b border-gray-200 text-gray-700 font-medium text-sm">
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
                  className="px-4 py-8 text-center text-gray-500 italic"
                >
                  No hay {activeTab === 'products' ? 'productos' : 'servicios'} registrados
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {activeTab === 'products' && (
                    <td className="px-4 py-3 text-gray-900 text-sm">{item.code}</td>
                  )}
                  <td className="px-4 py-3 text-gray-900 text-sm">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">{item.description}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm font-medium">${item.price?.toFixed(2) || '0.00'}</td>
                  {activeTab === 'products' ? (
                    <td className="px-4 py-3 text-gray-900 text-sm">{typeof item.purchasePrice === 'number' ? `$${item.purchasePrice.toFixed(2)}` : '—'}</td>
                  ) : (
                    <td className="px-4 py-3 text-gray-900 text-sm">{typeof item.cost === 'number' ? `$${item.cost.toFixed(2)}` : '—'}</td>
                  )}
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {getCategoryName(item.category)}
                  </td>
                  {activeTab === 'products' && (
                    <>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.stock}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.unit}</td>
                    </>
                  )}
                  {(canEdit || canDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(item.id, item.name)}
                            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const ProductsAndServices = () => {
  const queryClient = useQueryClient();

  // ✅ FIXED: Use BusinessContext instead of useParams
  const { currentBusiness, currentBranch, branches, branchesLoading } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const branchId = currentBranch?.id ?? null;
  const branchSelectionRequired = !branchesLoading && (branches?.length ?? 0) > 1;
  const branchReady = !branchSelectionRequired || !!branchId;
  const branchParams = branchId ? { branch_id: branchId } : undefined;

  // Get permissions
  const { canEdit, canDelete, canView, isLoading: permissionsLoading } = useUserPermissions(businessId);

  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    purchasePrice: '',
    category: '',
    stock: '',
    unit: '',
    code: ''
  });
  const [modalError, setModalError] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // ✅ Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // ✅ Search Handlers
  const handleSearch = useCallback(() => {
    setActiveSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // ✅ OPTIMIZED: Memoized permissions for products
  const canEditProducts = useMemo(() => canEdit('productos'), [canEdit]);
  const canDeleteProducts = useMemo(() => canDelete('productos'), [canDelete]);
  const canViewProducts = useMemo(() => canView('productos'), [canView]);

  // ✅ FIXED: Better loading and undefined handling
  const businessGuard = !currentBusiness ? (
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
  ) : null;

  const branchesLoadingGuard = branchesLoading ? (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        textAlign: 'center',
        padding: '48px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p style={{ color: '#6b7280' }}>Cargando sucursales...</p>
      </div>
    </div>
  ) : null;

  const branchSelectionGuard = branchSelectionRequired && !branchReady ? (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        textAlign: 'center',
        padding: '48px 0',
        backgroundColor: '#fefce8',
        borderRadius: '8px',
        border: '1px solid #fde68a'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#854d0e', marginBottom: '8px' }}>
          Selecciona una sucursal
        </h3>
        <p style={{ color: '#a16207', marginBottom: '24px' }}>
          Elige una sucursal desde el selector superior para continuar gestionando productos y servicios.
        </p>
      </div>
    </div>
  ) : null;

  const permissionsGuard = permissionsLoading ? (
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
  ) : null;

  const noAccessGuard = !permissionsLoading && !canViewProducts ? (
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
  ) : null;

  const queriesEnabled = Boolean(businessId && currentBusiness && branchReady);

  // ✅ OPTIMIZED: React Query for data fetching with smart caching - Only when businessId is available
  const {
    data: products = [],
    isLoading: loadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products', businessId, branchId],
    queryFn: () => productAPI.getProducts(businessId, branchParams),
    enabled: queriesEnabled, // Only fetch when context is ready
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const {
    data: services = [],
    isLoading: loadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ['services', businessId, branchId],
    queryFn: () => serviceAPI.getServices(businessId, branchParams),
    enabled: queriesEnabled, // Only fetch when context is ready
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: categories = [],
    isLoading: loadingCategories
  } = useQuery({
    queryKey: ['categories', businessId, branchId],
    queryFn: () => categoryAPI.getCategories(businessId),
    enabled: queriesEnabled, // Only fetch when context is ready
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
      purchasePrice: item.precio_compra,
      category: item.categoria_id,
      stock: item.stock_actual,
      unit: item.unidades || '',
      code: item.codigo || ''
    }));
  }, [products]);

  const processedServices = useMemo(() => {
    return services.map(item => ({
      ...item,
      name: item.nombre,
      price: item.precio,
      cost: item.costo,
      category: item.categoria_id
    }));
  }, [services]);

  // ✅ OPTIMIZED: Smart current data selection with Search Filtering
  const currentData = useMemo(() => {
    let data = activeTab === 'products' ? processedProducts : processedServices;

    if (activeSearchQuery.trim()) {
      const query = activeSearchQuery.toLowerCase().trim();
      data = data.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        // For products, also check code
        const codeMatch = activeTab === 'products' && (item.code || '').toLowerCase().includes(query);

        return nameMatch || descMatch || codeMatch;
      });
    }

    return data;
  }, [activeTab, processedProducts, processedServices, activeSearchQuery]);

  // ✅ OPTIMIZED: Computed loading state
  const isLoading = useMemo(() => {
    if (activeTab === 'products') {
      return loadingProducts || loadingCategories;
    }
    return loadingServices;
  }, [activeTab, loadingProducts, loadingServices, loadingCategories]);

  // ✅ OPTIMIZED: Computed error state
  const currentError = useMemo(() => {
    if (activeTab === 'products') return productsError;
    return servicesError;
  }, [activeTab, productsError, servicesError]);

  // ✅ OPTIMIZED: Mutations with optimistic updates
  const createProductMutation = useMutation({
    mutationFn: (payload) => productAPI.createProduct(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId, branchId]);
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }) => productAPI.updateProduct(businessId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId, branchId]);
      handleCloseModal();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productAPI.deleteProduct(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products', businessId, branchId]);
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload) => serviceAPI.createService(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId, branchId]);
      handleCloseModal();
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => serviceAPI.updateService(businessId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId, branchId]);
      handleCloseModal();
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => serviceAPI.deleteService(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', businessId, branchId]);
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => categoryAPI.createCategory(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories', businessId, branchId]);
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
      setModalError(null); // Clear previous errors
      if (activeTab === 'products') {
        payload.precio_venta = parseFloat(formData.price) || 0;
        payload.stock_actual = parseInt(formData.stock) || 0;
        payload.codigo = formData.code || '';
        payload.unidades = formData.unit || '';
        if (formData.purchasePrice !== '') {
          payload.precio_compra = parseFloat(formData.purchasePrice);
        }

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
      // Extract error message from backend response
      const errorMessage = error.response?.data?.detail || error.message || 'Error al guardar. Por favor intenta de nuevo.';
      setModalError(errorMessage);
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
      purchasePrice: item.precio_compra !== undefined && item.precio_compra !== null ? item.precio_compra.toString() : '',
      category: item.category || item.categoria_id || '',
      stock: item.stock?.toString() || item.stock_actual?.toString() || '',
      unit: item.unit || item.unidades || '',
      code: item.code || item.codigo || ''
    });
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setModalError(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      purchasePrice: '',
      category: '',
      stock: '',
      unit: '',
      code: ''
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

  const guardToShow =
    businessGuard ||
    branchesLoadingGuard ||
    branchSelectionGuard ||
    permissionsGuard ||
    noAccessGuard;

  if (guardToShow) {
    return guardToShow;
  }

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


      {/* Search Bar - Optimized to only trigger on Enter/Button */}
      {/* Search Bar - Optimized to only trigger on Enter/Button */}
      {console.log("Rendering Search Bar", { searchQuery, activeSearchQuery })}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <input
          type="text"
          placeholder={activeTab === 'products' ? "Buscar producto por código, nombre o descripción..." : "Buscar servicio por nombre o descripción..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
            backgroundColor: 'white'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 25px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Buscar
        </button>
        {activeSearchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveSearchQuery('');
            }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#e2e6ea',
              color: '#333',
              border: '1px solid #d3d9df',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: '20px' }}>
        {canEditProducts && (
          <div className="flex gap-2">
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

            {activeTab === 'products' && (
              <button
                onClick={() => setShowUploadModal(true)}
                disabled={isMutating}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isMutating ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  opacity: isMutating ? 0.6 : 1
                }}
              >
                Importar PDF
              </button>
            )}
          </div>
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
      {
        showModal && (
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

              {modalError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #ef4444',
                  color: '#b91c1c',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {activeTab === 'products' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                      Código
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                )}

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

                {activeTab === 'products' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                      Precio de compra
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
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
                )}

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Categoría
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
        )
      }

      {/* Category Modal */}
      {
        showCategoryModal && (
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
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, nombre: e.target.value })}
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
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, descripcion: e.target.value })}
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
        )
      }

      {/* Upload Modal */}
      {
        showUploadModal && (
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <CatalogUpload
                businessId={businessId}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                  queryClient.invalidateQueries(['products', businessId, branchId]);
                  setShowUploadModal(false);
                }}
              />
            </div>
          </div>
        )
      }
    </div >
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
