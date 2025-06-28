import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Menu,
  X,
  ArrowLeft,
  Loader2,
  Package
} from 'lucide-react';

/**
 * Categories component for managing product categories for a specific business.
 * Allows users to view, add, edit, and delete categories within a business context.
 * It fetches category data from the API and handles form submissions for CRUD operations.
 */
function Categories() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
   * Requires businessId from URL.
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
        setError('You do not have permission to view categories for this business.');
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
   * Requires businessId from URL.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    console.log('Form submission started');
    console.log('Business ID:', businessId);
    console.log('Category form data:', categoryForm);
    
    if (!categoryForm.nombre.trim()) {
      setFormError('Category name cannot be empty.');
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
      
      console.log('Sending category data:', categoryData);
      
      let result;
      if (isEditing && currentCategory) {
        console.log('Updating category:', currentCategory.id);
        result = await categoryAPI.updateCategory(businessId, currentCategory.id, categoryData); 
      } else {
        console.log('Creating new category');
        result = await categoryAPI.createCategory(businessId, categoryData);
      }
      
      console.log('API result:', result);
      
      setCategoryForm({ nombre: '', descripcion: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      setShowForm(false);
      await fetchCategories();
      
      console.log('Category operation completed successfully');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating category' : 'Error creating category');
      if (err.response?.status === 403) {
        setFormError('You do not have permission to edit categories for this business.');
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
    if (window.confirm('Are you sure you want to delete this category?')) {
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
          setError('You do not have permission to delete categories for this business.');
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BizFlow Pro
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/home')}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}`)}
                  className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/products`)}
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Productos
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/home')}
                  className="w-full text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}`)}
                  className="w-full text-gray-700"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/products`)}
                  className="w-full text-gray-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Productos
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Gestión de Categorías
                </h1>
                <p className="text-lg text-gray-600">
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
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Category Form */}
          {showForm && (
            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-blue-600" />
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Modifica los datos de la categoría' : 'Completa la información de la nueva categoría'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                      Nombre de la categoría *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={categoryForm.nombre}
                      onChange={handleFormChange}
                      required
                      placeholder="Ej: Electrónicos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción
                    </Label>
                    <Input
                      id="descripcion"
                      name="descripcion"
                      type="text"
                      value={categoryForm.descripcion}
                      onChange={handleFormChange}
                      placeholder="Descripción opcional de la categoría"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading || !businessId}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-blue-600" />
                Categorías ({categories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !categories.length ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg font-medium">Cargando categorías...</span>
                  </div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron categorías
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Aún no tienes categorías registradas. ¡Crea tu primera categoría!
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Categoría
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(category => (
                    <Card key={category.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {category.nombre}
                        </CardTitle>
                        {category.descripcion && (
                          <CardDescription className="text-sm text-gray-600">
                            {category.descripcion}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
              <h3 className="text-2xl font-bold">BizFlow Pro</h3>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              La plataforma de gestión empresarial más avanzada para micro y pequeñas empresas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProtectedCategories() {
  return (
    <PermissionGuard requiredModule="categorias" requiredAction="ver">
      <Categories />
    </PermissionGuard>
  );
}
