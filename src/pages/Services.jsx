import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { serviceAPI, categoryAPI } from '../utils/api';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  AlertTriangle,
  DollarSign,
  Archive,
  Tag,
  Menu,
  X,
  ArrowLeft,
  Loader2,
  Search,
  Clock
} from 'lucide-react';

const initialFormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracion_minutos: '',
  categoria_id: '',
  activo: true
};

/**
 * Services component for managing business services.
 * Allows users to view, add, edit, delete, and filter services.
 */
function Services() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  // State for category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: ''
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  
  // State for service form
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(initialFormState);

  const fetchServices = useCallback(async (categoryId = selectedCategory) => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const data = await serviceAPI.getServices(businessId, params);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching services';
      if (err.response?.status === 403) {
        setError('You do not have permission to view services for this business.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    if (!businessId) {
      return;
    }
    try {
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [businessId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!businessId) {
      setFormError('Business ID is missing.');
      return;
    }
    if (!serviceForm.nombre || !serviceForm.precio || !serviceForm.categoria_id) {
      setFormError('Please fill all required fields: Name, Price, and Category.');
      return;
    }

    setLoading(true);
    try {
      const serviceData = { 
        nombre: serviceForm.nombre.trim(), 
        descripcion: serviceForm.descripcion.trim(), 
        precio: parseFloat(serviceForm.precio), 
        duracion_minutos: serviceForm.duracion_minutos ? parseInt(serviceForm.duracion_minutos, 10) : null,
        categoria_id: serviceForm.categoria_id,
        activo: serviceForm.activo
      };

      if (isEditing && currentService) {
        await serviceAPI.updateService(businessId, currentService.id, serviceData);
      } else {
        await serviceAPI.createService(businessId, serviceData);
      }

      await fetchServices();
      setShowForm(false);
      setServiceForm(initialFormState);
      setIsEditing(false);
      setCurrentService(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error saving service';
      setFormError(errorMessage);
      console.error('Error saving service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setServiceForm({
      nombre: service.nombre || '',
      descripcion: service.descripcion || '',
      precio: service.precio?.toString() || '',
      duracion_minutos: service.duracion_minutos?.toString() || '',
      categoria_id: service.categoria_id || '',
      activo: service.activo !== undefined ? service.activo : true
    });
    setIsEditing(true);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setLoading(true);
    try {
      await serviceAPI.deleteService(businessId, serviceId);
      await fetchServices();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error deleting service';
      setError(errorMessage);
      console.error('Error deleting service:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setServiceForm(initialFormState);
    setIsEditing(false);
    setCurrentService(null);
    setFormError('');
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    
    if (!categoryForm.nombre.trim()) {
      setCategoryError('Category name is required.');
      return;
    }

    setCategoryLoading(true);
    try {
      const categoryData = {
        nombre: categoryForm.nombre.trim(),
        descripcion: categoryForm.descripcion.trim()
      };

      await categoryAPI.createCategory(businessId, categoryData);
      await fetchCategories();
      setShowCategoryModal(false);
      setCategoryForm({ nombre: '', descripcion: '' });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error creating category';
      setCategoryError(errorMessage);
      console.error('Error creating category:', err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const cancelCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryForm({ nombre: '', descripcion: '' });
    setCategoryError('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  const filteredServices = services.filter(service =>
    service.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes) => {
    if (!minutes) return 'No especificada';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/business/${businessId}`)}
                className="flex items-center space-x-2 bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Panel</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Services</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowCategoryModal(true)}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
              >
                <Tag className="h-4 w-4" />
                <span>Add Category</span>
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Service</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b shadow-sm">
          <div className="px-4 py-2 space-y-2">
            <Button
              onClick={() => {
                setShowCategoryModal(true);
                setIsMenuOpen(false);
              }}
              variant="outline"
              size="sm"
              className="w-full flex items-center space-x-2"
            >
              <Tag className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory 
                    ? "No services match your current filters." 
                    : "Get started by adding your first service."}
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.nombre}</CardTitle>
                        <CardDescription className="mt-1">
                          {getCategoryName(service.categoria_id)}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.descripcion && (
                      <p className="text-sm text-gray-600 mb-3">{service.descripcion}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${service.precio?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {service.duracion_minutos && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Duration:</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              {formatDuration(service.duracion_minutos)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge variant={service.activo ? "default" : "secondary"}>
                          {service.activo ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </h2>
              
              {formError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-gray-700">Nombre del Servicio *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={serviceForm.nombre}
                    onChange={handleFormChange}
                    required
                    className="text-gray-900"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-gray-700">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={serviceForm.descripcion}
                    onChange={handleFormChange}
                    rows={3}
                    className="text-gray-900"
                  />
                </div>

                <div>
                  <Label htmlFor="precio" className="text-gray-700">Precio *</Label>
                  <Input
                    id="precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={serviceForm.precio}
                    onChange={handleFormChange}
                    required
                    className="text-gray-900"
                  />
                </div>

                <div>
                  <Label htmlFor="duracion_minutos" className="text-gray-700">Duración (minutos)</Label>
                  <Input
                    id="duracion_minutos"
                    name="duracion_minutos"
                    type="number"
                    min="0"
                    value={serviceForm.duracion_minutos}
                    onChange={handleFormChange}
                    className="text-gray-900"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria_id" className="text-gray-700">Categoría *</Label>
                  <Select
                    value={serviceForm.categoria_id}
                    onValueChange={(value) => setServiceForm(prev => ({ ...prev, categoria_id: value }))}
                  >
                    <SelectTrigger className="text-gray-900">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={serviceForm.activo}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, activo: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="activo" className="text-gray-700">Activo</Label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isEditing ? 'Actualizar Servicio' : 'Agregar Servicio'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
              
              {categoryError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{categoryError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="category-nombre">Category Name *</Label>
                  <Input
                    id="category-nombre"
                    name="nombre"
                    value={categoryForm.nombre}
                    onChange={handleCategoryFormChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category-descripcion">Description</Label>
                  <Textarea
                    id="category-descripcion"
                    name="descripcion"
                    value={categoryForm.descripcion}
                    onChange={handleCategoryFormChange}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={categoryLoading} className="flex-1">
                    {categoryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Add Category
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelCategoryModal} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services; 