import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { productAPI, categoryAPI } from '../utils/api';
import { 
  Package, 
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
  Search
} from 'lucide-react';

/**
 * @typedef {object} Product
 * @property {string|number} id_producto - The unique identifier for the product.
 * @property {string} nombre - The name of the product.
 * @property {string} [descripcion] - The description of the product.
 * @property {number} precio - The price of the product.
 * @property {number} stock - The current stock quantity of the product.
 * @property {string|number} id_categoria - The ID of the category this product belongs to.
 */

/**
 * @typedef {object} Category
 * @property {string|number} id_categoria - The unique identifier for the category.
 * @property {string} nombre - The name of the category.
 */

/**
 * @typedef {object} FormDataProduct
 * @property {string} nombre - Name of the product.
 * @property {string} descripcion - Description of the product.
 * @property {string} precio - Price of the product (as string, will be parsed).
 * @property {string} stock - Stock quantity of the product (as string, will be parsed).
 * @property {string} id_categoria - Selected category ID for the product.
 */

const initialFormState = {
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

const LOW_STOCK_THRESHOLD = 10; // Define the threshold

/**
 * Products component for managing inventory.
 * Allows users to view, add, edit, delete, and filter products.
 * Also supports importing products from an Excel file and displays low stock alerts.
 */
function Products() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [products, setProducts] = useState([]);
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
  
  // State for product form
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    precio_venta: '',
    precio_compra: '',
    stock_actual: '',
    stock_minimo: '',
    categoria_id: '',
    activo: true
  });

  const fetchProducts = useCallback(async (categoryId = selectedCategory) => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = categoryId ? { category_id: categoryId } : {};
      // Pass businessId to the productAPI call
      const data = await productAPI.getProducts(businessId, params);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching products';
      if (err.response?.status === 403) {
        setError('You do not have permission to view products for this business.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedCategory]); // Add businessId and selectedCategory to dependency array

  const fetchCategories = useCallback(async () => {
    if (!businessId) {
      // Error for missing businessId will be handled by fetchProducts or elsewhere
      return;
    }
    try {
      // Pass businessId to categoryAPI call
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Optionally set an error specifically for categories if needed
    }
  }, [businessId]); // Add businessId to dependency array

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // fetchProducts will be called by the useEffect watching selectedCategory
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
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
    if (!productForm.nombre || !productForm.precio_venta || !productForm.stock_actual || !productForm.categoria_id) {
      setFormError('Please fill all required fields: Name, Sale Price, Stock, and Category.');
      return;
    }

    setLoading(true);
    try {
      const productData = { 
        nombre: productForm.nombre.trim(), 
        descripcion: productForm.descripcion.trim(), 
        codigo: productForm.codigo.trim(),
        precio_venta: parseFloat(productForm.precio_venta), 
        precio_compra: productForm.precio_compra ? parseFloat(productForm.precio_compra) : null,
        stock_actual: parseInt(productForm.stock_actual, 10), 
        stock_minimo: productForm.stock_minimo ? parseInt(productForm.stock_minimo, 10) : null,
        categoria_id: productForm.categoria_id,
        activo: productForm.activo
      };

      if (isEditing && currentProduct) {
        // Update existing product - Pass businessId and productId
        await productAPI.updateProduct(businessId, currentProduct.id, productData);
      } else {
        // Create new product - Pass businessId
        await productAPI.createProduct(businessId, productData);
      }

      // Reset form and refresh products
      setProductForm(initialFormState);
      setIsEditing(false);
      setCurrentProduct(null);
      setShowForm(false);
      await fetchProducts();

    } catch (err) {
      const specificError = err.response?.data?.detail || err.message || (isEditing ? 'Error updating product' : 'Error creating product');
      if (err.response?.status === 403) {
        setFormError('You do not have permission to edit products for this business.');
      } else {
        setFormError(specificError);
      }
      console.error(isEditing ? 'Error updating product:' : 'Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      codigo: product.codigo || '',
      precio_venta: product.precio_venta ? product.precio_venta.toString() : '',
      precio_compra: product.precio_compra ? product.precio_compra.toString() : '',
      stock_actual: product.stock_actual ? product.stock_actual.toString() : '',
      stock_minimo: product.stock_minimo ? product.stock_minimo.toString() : '',
      categoria_id: product.categoria_id,
      activo: product.activo !== undefined ? product.activo : true,
    });
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      if (!businessId) {
        setError('Business ID is missing.');
        return;
      }
      setLoading(true);
      try {
        // Pass businessId and productId
        await productAPI.deleteProduct(businessId, productId);
        await fetchProducts(); // Refresh list
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Error deleting product';
        if (err.response?.status === 403) {
          setError('You do not have permission to delete products for this business.');
        } else {
          setError(errorMessage);
        }
        console.error('Error deleting product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setProductForm(initialFormState);
    setShowForm(false);
    setFormError('');
  };

  // Category management functions
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
    
    console.log('Creating category from Products page');
    console.log('Business ID:', businessId);
    console.log('Category form data:', categoryForm);
    
    if (!categoryForm.nombre.trim()) {
      setCategoryError('El nombre de la categoría es requerido.');
      return;
    }

    if (!businessId) {
      setCategoryError('Business ID is missing.');
      return;
    }

    setCategoryLoading(true);
    try {
      const categoryData = {
        nombre: categoryForm.nombre.trim(),
        descripcion: categoryForm.descripcion.trim()
      };

      console.log('Sending category data:', categoryData);
      const newCategory = await categoryAPI.createCategory(businessId, categoryData);
      console.log('New category created:', newCategory);
      
      // Refresh categories list
      await fetchCategories();
      
      // Select the new category in the product form
      setProductForm(prev => ({
        ...prev,
        categoria_id: newCategory.id
      }));
      
      // Reset and close modal
      setCategoryForm({ nombre: '', descripcion: '' });
      setShowCategoryModal(false);
      
      console.log('Category creation completed successfully');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.detail || err.message || 'Error creating category';
      setCategoryError(errorMessage);
      console.error('Error creating category:', err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const cancelCategoryModal = () => {
    setCategoryForm({ nombre: '', descripcion: '' });
    setShowCategoryModal(false);
    setCategoryError('');
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  // Check if product has low stock
  const isLowStock = (stock) => stock <= LOW_STOCK_THRESHOLD;

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
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/categories`)}
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Categorías
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
                  onClick={() => navigate('/')}
                  className="w-full text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/business/${businessId}/categories`)}
                  className="w-full text-gray-700"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Categorías
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
                  Gestión de Productos
                </h1>
                <p className="text-lg text-gray-600">
                  Administra el inventario de tu negocio
                </p>
              </div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Filters */}
          <Card className="border border-gray-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-blue-600" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Buscar productos
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Buscar por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Filtrar por categoría
                  </Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Form */}
          {showForm && (
            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                        Nombre del producto *
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={productForm.nombre}
                        onChange={handleFormChange}
                        required
                        placeholder="Ej: Laptop Dell"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigo" className="text-sm font-medium text-gray-700">
                        Código/SKU
                      </Label>
                      <Input
                        id="codigo"
                        name="codigo"
                        type="text"
                        value={productForm.codigo}
                        onChange={handleFormChange}
                        placeholder="Ej: LAP001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">
                        Categoría *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCategoryModal(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Nueva
                      </Button>
                    </div>
                    <Select 
                      value={productForm.categoria_id} 
                      onValueChange={(value) => setProductForm(prev => ({...prev, categoria_id: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción
                    </Label>
                    <Input
                      id="descripcion"
                      name="descripcion"
                      type="text"
                      value={productForm.descripcion}
                      onChange={handleFormChange}
                      placeholder="Descripción opcional del producto"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="precio_venta" className="text-sm font-medium text-gray-700">
                        Precio de Venta *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="precio_venta"
                          name="precio_venta"
                          type="number"
                          value={productForm.precio_venta}
                          onChange={handleFormChange}
                          required
                          step="0.01"
                          min="0"
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precio_compra" className="text-sm font-medium text-gray-700">
                        Precio de Compra
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="precio_compra"
                          name="precio_compra"
                          type="number"
                          value={productForm.precio_compra}
                          onChange={handleFormChange}
                          step="0.01"
                          min="0"
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_actual" className="text-sm font-medium text-gray-700">
                        Stock Actual *
                      </Label>
                      <div className="relative">
                        <Archive className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="stock_actual"
                          name="stock_actual"
                          type="number"
                          value={productForm.stock_actual}
                          onChange={handleFormChange}
                          required
                          min="0"
                          className="pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock_minimo" className="text-sm font-medium text-gray-700">
                        Stock Mínimo
                      </Label>
                      <div className="relative">
                        <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="stock_minimo"
                          name="stock_minimo"
                          type="number"
                          value={productForm.stock_minimo}
                          onChange={handleFormChange}
                          min="0"
                          className="pl-10"
                          placeholder="0"
                        />
                      </div>
                    </div>
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
                          {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
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

          {/* Products List */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-blue-600" />
                Productos ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !products.length ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg font-medium">Cargando productos...</span>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory 
                      ? 'No hay productos que coincidan con los filtros aplicados.'
                      : 'Aún no tienes productos registrados. ¡Crea tu primer producto!'
                    }
                  </p>
                  {!searchTerm && !selectedCategory && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Producto
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                              {product.nombre}
                            </CardTitle>
                            {product.descripcion && (
                              <CardDescription className="text-sm text-gray-600">
                                {product.descripcion}
                              </CardDescription>
                            )}
                          </div>
                          {isLowStock(product.stock_actual) && (
                            <Badge variant="destructive" className="ml-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Precio Venta</p>
                            <p className="font-semibold text-green-600">${product.precio_venta}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Stock</p>
                            <p className={`font-semibold ${isLowStock(product.stock_actual) ? 'text-red-600' : 'text-gray-900'}`}>
                              {product.stock_actual} unidades
                            </p>
                          </div>
                        </div>
                        {product.codigo && (
                          <div>
                            <p className="text-gray-600 text-sm">Código</p>
                            <p className="text-sm font-mono text-gray-900">{product.codigo}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600 text-sm">Categoría</p>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(product.categoria_id)}
                          </Badge>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(product.id)}
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Categoría</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelCategoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
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
              <div className="space-y-2">
                <Label htmlFor="category-nombre" className="text-sm font-medium text-gray-700">
                  Nombre de la categoría *
                </Label>
                <Input
                  id="category-nombre"
                  name="nombre"
                  type="text"
                  value={categoryForm.nombre}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="Ej: Electrónicos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-descripcion" className="text-sm font-medium text-gray-700">
                  Descripción
                </Label>
                <Input
                  id="category-descripcion"
                  name="descripcion"
                  type="text"
                  value={categoryForm.descripcion}
                  onChange={handleCategoryFormChange}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={categoryLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {categoryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Categoría'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelCategoryModal}
                  disabled={categoryLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Products;
