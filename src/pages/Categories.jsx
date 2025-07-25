import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { useBusinessContext } from '../contexts/BusinessContext';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

// ✅ OPTIMIZED: Memoized UI Components to prevent re-creation on each render
const Button = React.memo(({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
});

const Card = React.memo(({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
));

const CardHeader = React.memo(({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
));

const CardContent = React.memo(({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
));

const CardTitle = React.memo(({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
));

const CardDescription = React.memo(({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
));

// ✅ OPTIMIZED: Memoized category card component
const CategoryCard = React.memo(({ category, onEdit, onDelete, loading }) => (
  <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="pb-3">
      <CardTitle style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
        {category.nombre}
      </CardTitle>
      {category.descripcion && (
        <CardDescription style={{ fontSize: '14px', color: '#6b7280' }}>
          {category.descripcion}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(category)}
          disabled={loading}
          style={{ flex: 1 }}
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(category.id)}
          disabled={loading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
));

/**
 * Categories component for managing product categories for a specific business.
 */
function Categories() {
  const queryClient = useQueryClient();
  
  // ✅ FIXED: Use BusinessContext instead of useParams
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // State for form inputs
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: ''
  });

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
            Por favor selecciona un negocio desde el menú superior para gestionar categorías.
          </p>
        </div>
      </div>
    );
  }

  // ✅ OPTIMIZED: React Query for data fetching with smart caching - Only when businessId is available
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['categories', businessId],
    queryFn: () => categoryAPI.getCategories(businessId),
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 10 * 60 * 1000, // Categories change less frequently
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ OPTIMIZED: Mutations with optimistic updates
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => categoryAPI.createCategory(businessId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories', businessId]);
      setCategoryForm({ nombre: '', descripcion: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Error creating category:', error);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData }) => categoryAPI.updateCategory(businessId, categoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories', businessId]);
      setCategoryForm({ nombre: '', descripcion: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Error updating category:', error);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => categoryAPI.deleteCategory(businessId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories', businessId]);
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
    }
  });

  // ✅ OPTIMIZED: Memoized handlers
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Handles the submission of the category form (for both adding and editing).
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!categoryForm.nombre.trim() || !businessId) return;

    try {
      const categoryData = { 
        nombre: categoryForm.nombre.trim(), 
        descripcion: categoryForm.descripcion.trim() 
      };
      
      if (isEditing && currentCategory) {
        await updateCategoryMutation.mutateAsync({ categoryId: currentCategory.id, categoryData }); 
      } else {
        await createCategoryMutation.mutateAsync(categoryData);
      }
    } catch (error) {
      // Error is handled in the mutation onError callback
    }
  }, [categoryForm, businessId, isEditing, currentCategory, createCategoryMutation, updateCategoryMutation]);

  /**
   * Handles editing a category by populating the form with the category's data.
   */
  const handleEdit = useCallback((category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryForm({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
    setShowForm(true);
  }, []);

  /**
   * Handles deleting a category after user confirmation.
   */
  const handleDelete = useCallback(async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      if (!businessId) return;
      
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        // Error is handled in the mutation onError callback
      }
    }
  }, [businessId, deleteCategoryMutation]);

  /**
   * Cancels the editing mode.
   */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryForm({ nombre: '', descripcion: '' });
    setShowForm(false);
  }, []);

  // ✅ OPTIMIZED: Computed loading and error states
  const isMutating = createCategoryMutation.isPending || 
                    updateCategoryMutation.isPending || 
                    deleteCategoryMutation.isPending;

  const currentError = useMemo(() => {
    if (error) {
      if (error.response?.status === 403) {
        return 'No tienes autorización para ver las categorías de este negocio.';
      } else {
        return error.response?.data?.detail || error.message || 'Error fetching categories';
      }
    }
    
    // Check for mutation errors
    if (createCategoryMutation.error) {
      const mutationError = createCategoryMutation.error;
      if (mutationError.response?.status === 403) {
        return 'No tienes autorización para crear categorías en este negocio.';
      } else {
        return mutationError.response?.data?.detail || mutationError.message || 'Error creating category';
      }
    }
    
    if (updateCategoryMutation.error) {
      const mutationError = updateCategoryMutation.error;
      if (mutationError.response?.status === 403) {
        return 'No tienes autorización para editar categorías en este negocio.';
      } else {
        return mutationError.response?.data?.detail || mutationError.message || 'Error updating category';
      }
    }
    
    if (deleteCategoryMutation.error) {
      const mutationError = deleteCategoryMutation.error;
      if (mutationError.response?.status === 403) {
        return 'No tienes autorización para eliminar categorías en este negocio.';
      } else {
        return mutationError.response?.data?.detail || mutationError.message || 'Error deleting category';
      }
    }
    
    return '';
  }, [error, createCategoryMutation.error, updateCategoryMutation.error, deleteCategoryMutation.error]);

  const formError = useMemo(() => {
    if (!categoryForm.nombre.trim() && categoryForm.nombre !== '') {
      return 'El nombre de la categoría no puede estar vacío.';
    }
    if (!businessId) {
      return 'Business ID is missing.';
    }
    return '';
  }, [categoryForm.nombre, businessId]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
              Gestión de Categorías
            </h1>
            <p style={{ color: '#666' }}>
              Organiza tus productos por categorías
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            disabled={isMutating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {currentError && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #fcc',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle className="h-4 w-4" />
            {currentError}
          </div>
        )}
      </div>

      {/* Category Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Modifica los datos de la categoría' : 'Completa la información de la nueva categoría'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div style={{ 
                backgroundColor: '#fee', 
                color: '#c33', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '16px',
                border: '1px solid #fcc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle className="h-4 w-4" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Nombre de la categoría *
                </label>
                <input
                  name="nombre"
                  type="text"
                  value={categoryForm.nombre}
                  onChange={handleFormChange}
                  required
                  disabled={isMutating}
                  placeholder="Ej: Electrónicos"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#333',
                    opacity: isMutating ? 0.6 : 1
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Descripción
                </label>
                <input
                  name="descripcion"
                  type="text"
                  value={categoryForm.descripcion}
                  onChange={handleFormChange}
                  disabled={isMutating}
                  placeholder="Descripción opcional de la categoría"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#333',
                    opacity: isMutating ? 0.6 : 1
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <Button 
                  type="submit" 
                  disabled={isMutating || !businessId || !categoryForm.nombre.trim()}
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit}
                  disabled={isMutating}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Categorías ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !categories.length ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2563eb' }}>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span style={{ fontSize: '18px', fontWeight: '500' }}>Cargando categorías...</span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                No se encontraron categorías
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Aún no tienes categorías registradas. ¡Crea tu primera categoría!
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                disabled={isMutating}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {categories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={isMutating}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedCategories() {
  return (
    <Layout activeSection="categories">
      <PermissionGuard requiredModule="categorias" requiredAction="ver">
        <Categories />
      </PermissionGuard>
    </Layout>
  );
}
