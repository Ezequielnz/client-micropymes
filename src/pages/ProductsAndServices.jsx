import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, serviceAPI, categoryAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';

const ProductsAndServices = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (businessId) {
      fetchData();
      fetchCategories();
    }
  }, [businessId, activeTab]);

  const fetchData = async () => {
    if (!businessId) return;
    
    setLoading(true);
    setError('');
    
    try {
      let data;
      if (activeTab === 'products') {
        data = await productAPI.getProducts(businessId);
        // Map backend fields to frontend expected fields
        setProducts(data.map(item => ({
          ...item,
          name: item.nombre,
          price: item.precio_venta,
          category: item.categoria_id,
          stock: item.stock_actual,
          unit: item.codigo || ''
        })));
      } else {
        data = await serviceAPI.getServices(businessId);
        // Map backend fields to frontend expected fields
        setServices(data.map(item => ({
          ...item,
          name: item.nombre,
          price: item.precio,
          category: item.categoria_id
        })));
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      if (err.response?.status === 401) {
        setError('No tienes autorización para acceder a este negocio. Por favor verifica tu sesión.');
      } else if (err.response?.status === 404) {
        setError(`No se encontró el endpoint para ${activeTab === 'products' ? 'productos' : 'servicios'}. Verifica la configuración del servidor.`);
      } else {
        setError(`Error al cargar ${activeTab === 'products' ? 'productos' : 'servicios'}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!businessId) return;
    
    try {
      const data = await categoryAPI.getCategories(businessId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessId) return;

    setLoading(true);
    setError('');

    try {
      // Map frontend form fields to backend expected fields
      const payload = {
        nombre: formData.name,
        descripcion: formData.description,
        categoria_id: formData.category || null,
        business_id: businessId
      };

      if (activeTab === 'products') {
        payload.precio_venta = parseFloat(formData.price) || 0;
        payload.stock_actual = parseInt(formData.stock) || 0;
        payload.codigo = formData.unit || '';
        
        if (editingItem) {
          await productAPI.updateProduct(businessId, editingItem.id, payload);
        } else {
          await productAPI.createProduct(businessId, payload);
        }
      } else {
        payload.precio = parseFloat(formData.price) || 0;
        
        if (editingItem) {
          await serviceAPI.updateService(businessId, editingItem.id, payload);
        } else {
          await serviceAPI.createService(businessId, payload);
        }
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving data:', err);
      if (err.response?.status === 401) {
        setError('No tienes autorización para realizar esta acción.');
      } else {
        setError(`Error al ${editingItem ? 'actualizar' : 'crear'} ${activeTab === 'products' ? 'producto' : 'servicio'}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;
    if (!businessId) return;

    setLoading(true);
    setError('');

    try {
      if (activeTab === 'products') {
        await productAPI.deleteProduct(id);
      } else {
        await serviceAPI.deleteService(id);
      }

      await fetchData();
    } catch (err) {
      console.error('Error deleting data:', err);
      if (err.response?.status === 401) {
        setError('No tienes autorización para eliminar este elemento.');
      } else {
        setError(`Error al eliminar: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
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
  };

  const handleCloseModal = () => {
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
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!businessId) return;

    if (!categoryFormData.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await categoryAPI.createCategory(businessId, {
        nombre: categoryFormData.nombre.trim(),
        descripcion: categoryFormData.descripcion.trim()
      });

      // Recargar categorías
      await fetchCategories();
      
      // Limpiar formulario y cerrar modal
      setCategoryFormData({ nombre: '', descripcion: '' });
      setShowCategoryModal(false);
      
      // Mostrar mensaje de éxito
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating category:', err);
      setError(`Error al crear la categoría: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryFormData({ nombre: '', descripcion: '' });
    setError('');
  };

  const currentData = activeTab === 'products' ? products : services;

  return (
    <Layout activeSection="products">
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            Productos y Servicios
          </h1>
          <p style={{ color: '#666' }}>
            Gestiona los productos y servicios de tu negocio
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
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
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            + Agregar {activeTab === 'products' ? 'Producto' : 'Servicio'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#666' }}>Cargando...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && (
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
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', color: '#333' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={activeTab === 'products' ? 6 : 5}
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
                        {item.category ? 
                          categories.find(cat => cat.id === item.category)?.nombre || item.category :
                          'Sin categoría'
                        }
                      </td>
                      {activeTab === 'products' && (
                        <td style={{ padding: '12px', color: '#333' }}>{item.stock} {item.unit}</td>
                      )}
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEdit(item)}
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
                        <button
                          onClick={() => handleDelete(item.id)}
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
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
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        minWidth: '40px'
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
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Guardar')}
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
                {editingItem ? 'Editar' : 'Agregar'} Categoría
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
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default function ProtectedProductsAndServices() {
  return (
    <PermissionGuard requiredModule="inventario" requiredAction="ver">
      <ProductsAndServices />
    </PermissionGuard>
  );
}