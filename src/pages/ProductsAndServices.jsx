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
import { productAPI, serviceAPI, categoryAPI } from '../utils/api';
import ImportProducts from '../components/ImportProducts';
import { 
  Package, 
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
  Upload,
  Clock,
  BarChart3,
  ShoppingBag
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 10;

const initialProductFormState = {
  nombre: '',
  descripcion: '',
  codigo: '',
  precio_venta: '',
  precio_compra: '',
  stock_actual: '',
  stock_minimo: '',
  categoria_id: '',
  activo: true
};

const initialServiceFormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracion_minutos: '',
  categoria_id: '',
  activo: true
};

/**
 * ProductsAndServices component for managing both products and services in a unified interface.
 * Similar to Contabilium's approach of having both in the same page.
 */
function ProductsAndServices() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Main data states
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter and search states
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'productos' | 'servicios'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: ''
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  
  // Product/Service form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [itemType, setItemType] = useState('producto'); // 'producto' | 'servicio'
  const [productForm, setProductForm] = useState(initialProductFormState);
  const [serviceForm, setServiceForm] = useState(initialServiceFormState);
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Item type selection modal
  const [showItemTypeModal, setShowItemTypeModal] = useState(false);

  // Fetch functions
  const fetchProducts = useCallback(async (categoryId = selectedCategory) => {
    if (!businessId) return;
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const data = await productAPI.getProducts(businessId, params);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  }, [businessId, selectedCategory]);

  const fetchServices = useCallback(async (categoryId = selectedCategory) => {
    if (!businessId) return;
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      const data = await serviceAPI.getServices(businessId, params);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    }
  }, [businessId, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [businessId]);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchProducts(),
        fetchServices(),
        fetchCategories()
      ]);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching data';
      if (err.response?.status === 403) {
        setError('You do not have permission to view this data.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, fetchProducts, fetchServices, fetchCategories]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Only refetch if we don't have data or if category changed
    const shouldFetchProducts = activeTab === 'productos' || activeTab === 'todos';
    const shouldFetchServices = activeTab === 'servicios' || activeTab === 'todos';
    
    if (shouldFetchProducts && (products.length === 0 || selectedCategory !== '')) {
      fetchProducts();
    }
    if (shouldFetchServices && (services.length === 0 || selectedCategory !== '')) {
      fetchServices();
    }
  }, [activeTab, selectedCategory, fetchProducts, fetchServices, products.length, services.length]);

  // Event handlers
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedCategory('');
    // Don't reset loading state when changing tabs if we already have data
  };

  const handleAddNew = (type = null) => {
    if (!type) {
      // Show item type selection modal
      setShowItemTypeModal(true);
      return;
    }
    
    setItemType(type);
    setIsEditing(false);
    setCurrentItem(null);
    setShowForm(true);
    setFormError('');
    setShowItemTypeModal(false);
    
    if (type === 'producto') {
      setProductForm(initialProductFormState);
    } else {
      setServiceForm(initialServiceFormState);
    }
  };

  const handleItemTypeSelection = (type) => {
    handleAddNew(type);
  };

  const handleEdit = (item, type) => {
    setCurrentItem(item);
    setItemType(type);
    setIsEditing(true);
    setShowForm(true);
    setFormError('');
    
    if (type === 'producto') {
      setProductForm({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        codigo: item.codigo || '',
        precio_venta: item.precio_venta?.toString() || '',
        precio_compra: item.precio_compra?.toString() || '',
        stock_actual: item.stock_actual?.toString() || '',
        stock_minimo: item.stock_minimo?.toString() || '',
        categoria_id: item.categoria_id || '',
        activo: item.activo !== undefined ? item.activo : true
      });
    } else {
      setServiceForm({
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        precio: item.precio?.toString() || '',
        duracion_minutos: item.duracion_minutos?.toString() || '',
        categoria_id: item.categoria_id || '',
        activo: item.activo !== undefined ? item.activo : true
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (itemType === 'producto') {
      setProductForm(prev => ({ ...prev, [name]: value }));
    } else {
      setServiceForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!businessId) {
      setFormError('Business ID is missing.');
      return;
    }

    const form = itemType === 'producto' ? productForm : serviceForm;
    
    // Validation
    if (itemType === 'producto') {
      if (!form.nombre || !form.precio_venta || !form.stock_actual || !form.categoria_id) {
        setFormError('Please fill all required fields: Name, Sale Price, Stock, and Category.');
        return;
      }
    } else {
      if (!form.nombre || !form.precio || !form.categoria_id) {
        setFormError('Please fill all required fields: Name, Price, and Category.');
        return;
      }
    }

    setLoading(true);
    try {
      let itemData;
      
      if (itemType === 'producto') {
        itemData = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          codigo: form.codigo.trim(),
          precio_venta: parseFloat(form.precio_venta),
          precio_compra: form.precio_compra ? parseFloat(form.precio_compra) : null,
          stock_actual: parseInt(form.stock_actual, 10),
          stock_minimo: form.stock_minimo ? parseInt(form.stock_minimo, 10) : null,
          categoria_id: form.categoria_id,
          activo: form.activo
        };

        if (isEditing && currentItem) {
          await productAPI.updateProduct(businessId, currentItem.id, itemData);
        } else {
          await productAPI.createProduct(businessId, itemData);
        }
        await fetchProducts();
      } else {
        itemData = {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio: parseFloat(form.precio),
          duracion_minutos: form.duracion_minutos ? parseInt(form.duracion_minutos, 10) : null,
          categoria_id: form.categoria_id,
          activo: form.activo
        };

        if (isEditing && currentItem) {
          await serviceAPI.updateService(businessId, currentItem.id, itemData);
        } else {
          await serviceAPI.createService(businessId, itemData);
        }
        await fetchServices();
      }

      setShowForm(false);
      setIsEditing(false);
      setCurrentItem(null);
      
      if (itemType === 'producto') {
        setProductForm(initialProductFormState);
      } else {
        setServiceForm(initialServiceFormState);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || `Error saving ${itemType}`;
      setFormError(errorMessage);
      console.error(`Error saving ${itemType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    setLoading(true);
    try {
      if (type === 'producto') {
        await productAPI.deleteProduct(businessId, itemId);
        await fetchProducts();
      } else {
        await serviceAPI.deleteService(businessId, itemId);
        await fetchServices();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || `Error deleting ${type}`;
      setError(errorMessage);
      console.error(`Error deleting ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentItem(null);
    setFormError('');
    setProductForm(initialProductFormState);
    setServiceForm(initialServiceFormState);
  };

  // Category management
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
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
      const newCategory = await categoryAPI.createCategory(businessId, {
        nombre: categoryForm.nombre.trim(),
        descripcion: categoryForm.descripcion.trim()
      });
      
      await fetchCategories();
      
      // Auto-select the newly created category
      if (newCategory && newCategory.id) {
        if (itemType === 'producto') {
          setProductForm(prev => ({ ...prev, categoria_id: newCategory.id }));
        } else {
          setServiceForm(prev => ({ ...prev, categoria_id: newCategory.id }));
        }
      }
      
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

  // Utility functions
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  const isLowStock = (stock) => stock <= LOW_STOCK_THRESHOLD;

  const formatDuration = (minutes) => {
    if (!minutes) return 'No especificado';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  // Filter data based on search term
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.codigo && product.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.descripcion && service.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Combine products and services for "todos" view
  const combinedData = [
    ...filteredProducts.map(item => ({ ...item, type: 'producto' })),
    ...filteredServices.map(item => ({ ...item, type: 'servicio' }))
  ];

  const currentData = activeTab === 'todos' ? combinedData : 
                     activeTab === 'productos' ? filteredProducts : filteredServices;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}>
        <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <Link to={`/business/${businessId}`} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Productos y Servicios</h1>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <Link to={`/business/${businessId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('todos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm bg-white ${
                  activeTab === 'todos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Todos ({products.length + services.length})</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('productos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm bg-white ${
                  activeTab === 'productos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Productos ({products.length})</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('servicios')}
                className={`py-2 px-1 border-b-2 font-medium text-sm bg-white ${
                  activeTab === 'servicios'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Servicios ({services.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCategoryModal(true)}
              size="sm"
            >
              <Tag className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
            
            {activeTab === 'productos' && (
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            )}
            
            <Button
              onClick={() => handleAddNew(activeTab === 'todos' ? null : activeTab === 'productos' ? 'producto' : 'servicio')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'todos' ? 'Nuevo Item' : `Nuevo ${activeTab === 'productos' ? 'Producto' : 'Servicio'}`}
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading && products.length === 0 && services.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                                         <div>
                       <p className="text-sm font-medium text-gray-600">
                         Total {activeTab === 'todos' ? 'Items' : activeTab === 'productos' ? 'Productos' : 'Servicios'}
                       </p>
                       <p className="text-2xl font-bold text-gray-900">
                         {currentData.length}
                       </p>
                     </div>
                     {activeTab === 'todos' ? (
                       <ShoppingBag className="h-8 w-8 text-purple-600" />
                     ) : activeTab === 'productos' ? (
                       <Package className="h-8 w-8 text-blue-600" />
                     ) : (
                       <Settings className="h-8 w-8 text-green-600" />
                     )}
                  </div>
                </CardContent>
              </Card>

                             {activeTab === 'todos' && (
                 <>
                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Productos</p>
                           <p className="text-2xl font-bold text-blue-600">
                             {products.length}
                           </p>
                         </div>
                         <Package className="h-8 w-8 text-blue-600" />
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Servicios</p>
                           <p className="text-2xl font-bold text-green-600">
                             {services.length}
                           </p>
                         </div>
                         <Settings className="h-8 w-8 text-green-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </>
               )}

               {activeTab === 'productos' && (
                 <>
                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                           <p className="text-2xl font-bold text-red-600">
                             {products.filter(p => isLowStock(p.stock_actual)).length}
                           </p>
                         </div>
                         <AlertTriangle className="h-8 w-8 text-red-600" />
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Valor Total Stock</p>
                           <p className="text-2xl font-bold text-green-600">
                             ${products.reduce((total, p) => total + (p.precio_venta * p.stock_actual), 0).toFixed(2)}
                           </p>
                         </div>
                         <DollarSign className="h-8 w-8 text-green-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </>
               )}

               {activeTab === 'servicios' && (
                 <>
                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                           <p className="text-2xl font-bold text-green-600">
                             ${services.length > 0 ? (services.reduce((total, s) => total + s.precio, 0) / services.length).toFixed(2) : '0.00'}
                           </p>
                         </div>
                         <BarChart3 className="h-8 w-8 text-green-600" />
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardContent className="p-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
                           <p className="text-2xl font-bold text-blue-600">
                             {services.filter(s => s.duracion_minutos).length > 0 
                               ? formatDuration(services.filter(s => s.duracion_minutos).reduce((total, s) => total + s.duracion_minutos, 0) / services.filter(s => s.duracion_minutos).length)
                               : 'N/A'
                             }
                           </p>
                         </div>
                         <Clock className="h-8 w-8 text-blue-600" />
                       </div>
                     </CardContent>
                   </Card>
                 </>
               )}
            </div>

            {/* Items Grid */}
            {!loading && currentData.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  {activeTab === 'todos' ? (
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  ) : activeTab === 'productos' ? (
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  ) : (
                    <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay {activeTab === 'todos' ? 'productos ni servicios' : activeTab} registrados
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comienza agregando tu primer {activeTab === 'todos' ? 'producto o servicio' : activeTab === 'productos' ? 'producto' : 'servicio'}
                  </p>
                  <Button 
                    onClick={() => handleAddNew(activeTab === 'todos' ? null : activeTab === 'productos' ? 'producto' : 'servicio')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar {activeTab === 'todos' ? 'Item' : activeTab === 'productos' ? 'Producto' : 'Servicio'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentData.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 mr-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.nombre}
                          </h3>
                          {activeTab === 'todos' && (
                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === 'producto' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.type === 'producto' ? 'Producto' : 'Servicio'}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-blue-50 border border-gray-200 text-blue-600 hover:text-blue-700"
                            onClick={() => handleEdit(item, activeTab === 'todos' ? item.type : activeTab === 'productos' ? 'producto' : 'servicio')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-red-50 border border-gray-200 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(item.id, activeTab === 'todos' ? item.type : activeTab === 'productos' ? 'producto' : 'servicio')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {item.descripcion && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.descripcion}
                        </p>
                      )}

                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Precio:</span>
                          <span className="font-semibold text-green-600">
                            ${(activeTab === 'todos' ? (item.type === 'producto' ? item.precio_venta : item.precio) : 
                               activeTab === 'productos' ? item.precio_venta : item.precio)}
                          </span>
                        </div>

                        {((activeTab === 'productos') || (activeTab === 'todos' && item.type === 'producto')) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Stock:</span>
                            <div className="flex items-center space-x-1">
                              <span className={`font-semibold ${isLowStock(item.stock_actual) ? 'text-red-600' : 'text-gray-900'}`}>
                                {item.stock_actual}
                              </span>
                              {isLowStock(item.stock_actual) && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        )}

                        {((activeTab === 'servicios') || (activeTab === 'todos' && item.type === 'servicio')) && item.duracion_minutos && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Duración:</span>
                            <span className="text-sm text-gray-900">
                              {formatDuration(item.duracion_minutos)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(item.categoria_id)}
                        </Badge>
                        <Badge variant={item.activo ? "default" : "secondary"} className="text-xs">
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar' : 'Nuevo'} {itemType === 'producto' ? 'Producto' : 'Servicio'}
                </h2>
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-gray-700 font-medium">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={itemType === 'producto' ? productForm.nombre : serviceForm.nombre}
                    onChange={handleFormChange}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-gray-700 font-medium">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={itemType === 'producto' ? productForm.descripcion : serviceForm.descripcion}
                    onChange={handleFormChange}
                    rows={3}
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>

                {itemType === 'producto' && (
                  <>
                    <div>
                      <Label htmlFor="codigo" className="text-gray-700 font-medium">Código/SKU</Label>
                      <Input
                        id="codigo"
                        name="codigo"
                        value={productForm.codigo}
                        onChange={handleFormChange}
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="precio_venta" className="text-gray-700 font-medium">Precio Venta *</Label>
                        <Input
                          id="precio_venta"
                          name="precio_venta"
                          type="number"
                          step="0.01"
                          value={productForm.precio_venta}
                          onChange={handleFormChange}
                          required
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="precio_compra" className="text-gray-700 font-medium">Precio Compra</Label>
                        <Input
                          id="precio_compra"
                          name="precio_compra"
                          type="number"
                          step="0.01"
                          value={productForm.precio_compra}
                          onChange={handleFormChange}
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stock_actual" className="text-gray-700 font-medium">Stock Actual *</Label>
                        <Input
                          id="stock_actual"
                          name="stock_actual"
                          type="number"
                          value={productForm.stock_actual}
                          onChange={handleFormChange}
                          required
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock_minimo" className="text-gray-700 font-medium">Stock Mínimo</Label>
                        <Input
                          id="stock_minimo"
                          name="stock_minimo"
                          type="number"
                          value={productForm.stock_minimo}
                          onChange={handleFormChange}
                          className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {itemType === 'servicio' && (
                  <>
                    <div>
                      <Label htmlFor="precio" className="text-gray-700 font-medium">Precio *</Label>
                      <Input
                        id="precio"
                        name="precio"
                        type="number"
                        step="0.01"
                        value={serviceForm.precio}
                        onChange={handleFormChange}
                        required
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duracion_minutos" className="text-gray-700 font-medium">Duración (minutos)</Label>
                      <Input
                        id="duracion_minutos"
                        name="duracion_minutos"
                        type="number"
                        value={serviceForm.duracion_minutos}
                        onChange={handleFormChange}
                        placeholder="Ej: 60"
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="categoria_id" className="text-gray-700 font-medium">Categoría *</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={itemType === 'producto' ? productForm.categoria_id : serviceForm.categoria_id}
                      onValueChange={(value) => handleFormChange({ target: { name: 'categoria_id', value } })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Seleccionar categoría">
                          {(() => {
                            const selectedId = itemType === 'producto' ? productForm.categoria_id : serviceForm.categoria_id;
                            const selectedCategory = categories.find(cat => cat.id === selectedId);
                            return selectedCategory ? selectedCategory.nombre : "Seleccionar categoría";
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCategoryModal(true)}
                      className="bg-white hover:bg-blue-50 border-gray-300 text-blue-600 hover:text-blue-700 px-3 shrink-0"
                      title="Crear nueva categoría"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Nueva Categoría</h2>
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700" onClick={cancelCategoryModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {categoryError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{categoryError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="category-name" className="text-gray-700 font-medium">Nombre *</Label>
                  <Input
                    id="category-name"
                    name="nombre"
                    value={categoryForm.nombre}
                    onChange={handleCategoryFormChange}
                    required
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="category-description" className="text-gray-700 font-medium">Descripción</Label>
                  <Textarea
                    id="category-description"
                    name="descripcion"
                    value={categoryForm.descripcion}
                    onChange={handleCategoryFormChange}
                    rows={3}
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={cancelCategoryModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={categoryLoading} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {categoryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Crear Categoría
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Item Type Selection Modal */}
      {showItemTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">¿Qué deseas agregar?</h2>
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700" onClick={() => setShowItemTypeModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => handleItemTypeSelection('producto')}
                  className="w-full p-4 h-auto bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Producto</h3>
                      <p className="text-sm text-gray-500">Artículo físico con stock e inventario</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleItemTypeSelection('servicio')}
                  className="w-full p-4 h-auto bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Servicio</h3>
                      <p className="text-sm text-gray-500">Actividad o trabajo que se ofrece</p>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="flex justify-end pt-6">
                <Button variant="outline" onClick={() => setShowItemTypeModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportProducts
          businessId={businessId}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

export default ProductsAndServices;