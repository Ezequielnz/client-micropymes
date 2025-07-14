import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Simple UI Components
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
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
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

/**
 * Categories component for managing product categories for a specific business.
 */
function Categories() {
  const { businessId } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  // State for form inputs
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: ''
  });

  /**
   * Fetches categories for the current business from the server.
   */
  const fetchCategories = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching categories';
      if (err.response?.status === 403) {
        setError('No tienes autorización para ver las categorías de este negocio.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the submission of the category form (for both adding and editing).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!categoryForm.nombre.trim()) {
      setFormError('El nombre de la categoría no puede estar vacío.');
      return;
    }
    if (!businessId) {
      setFormError('Business ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const categoryData = { 
        nombre: categoryForm.nombre.trim(), 
        descripcion: categoryForm.descripcion.trim() 
      };
      
      if (isEditing && currentCategory) {
        await categoryAPI.updateCategory(businessId, currentCategory.id, categoryData); 
      } else {
        await categoryAPI.createCategory(businessId, categoryData);
      }
      
      setCategoryForm({ nombre: '', descripcion: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      setShowForm(false);
      await fetchCategories();
      
    } catch (err) {
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating category' : 'Error creating category');
      if (err.response?.status === 403) {
        setFormError('No tienes autorización para editar categorías en este negocio.');
      } else {
        setFormError(specificError);
      }
      console.error(isEditing ? 'Error updating category:' : 'Error creating category:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles editing a category by populating the form with the category's data.
   */
  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryForm({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
    setShowForm(true);
    setFormError('');
  };

  /**
   * Handles deleting a category after user confirmation.
   */
  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      if (!businessId) {
        setError('Business ID is missing.');
        return;
      }
      setLoading(true);
      try {
        await categoryAPI.deleteCategory(businessId, categoryId);
        await fetchCategories();
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Error deleting category';
        if (err.response?.status === 403) {
          setError('No tienes autorización para eliminar categorías en este negocio.');
        } else {
          setError(errorMessage);
        }
        console.error('Error deleting category:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Cancels the editing mode.
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryForm({ nombre: '', descripcion: '' });
    setShowForm(false);
    setFormError('');
  };

  return (
    <Layout activeSection="categories">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          {error && (
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
              {error}
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
                    placeholder="Ej: Electrónicos"
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

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Descripción
                  </label>
                  <input
                    name="descripcion"
                    type="text"
                    value={categoryForm.descripcion}
                    onChange={handleFormChange}
                    placeholder="Descripción opcional de la categoría"
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

                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                  <Button 
                    type="submit" 
                    disabled={loading || !businessId}
                  >
                    {loading ? (
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
                    disabled={loading}
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
            {loading && !categories.length ? (
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
                          onClick={() => handleEdit(category)}
                          disabled={loading}
                          style={{ flex: 1 }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function ProtectedCategories() {
  return (
    <PermissionGuard requiredModule="categorias" requiredAction="ver">
      <Categories />
    </PermissionGuard>
  );
}
