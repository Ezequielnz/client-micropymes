import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  List,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ArrowLeft,
  LogOut,
  Loader2,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import api, { tasksAPI, authAPI } from '../utils/api';
import '../styles/Home.css';

const ESTADOS = {
  pendiente: { label: 'Pendiente', cssClass: 'badge-pending' },
  en_progreso: { label: 'En Progreso', cssClass: 'badge-in-progress' },
  completada: { label: 'Completada', cssClass: 'badge-completed' },
  cancelada: { label: 'Cancelada', cssClass: 'badge-cancelled' },
  pausada: { label: 'Pausada', cssClass: 'badge-paused' }
};

const PRIORIDADES = {
  baja: { label: 'Baja', cssClass: 'badge-low' },
  media: { label: 'Media', cssClass: 'badge-medium' },
  alta: { label: 'Alta', cssClass: 'badge-high' },
  urgente: { label: 'Urgente', cssClass: 'badge-urgent' }
};

// Hook personalizado para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Tasks() {
  console.log('🚀 Tasks component initialized');
  
  const { businessId } = useParams();
  const navigate = useNavigate();
  console.log('📊 BusinessId from URL params:', businessId);
  
  const [user, setUser] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'calendario'
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    asignada_a_id: '',
    busqueda: ''
  });

  // Estado separado para el input de búsqueda (para mostrar inmediatamente lo que escribe el usuario)
  const [searchInput, setSearchInput] = useState('');
  
  // Debounce del valor de búsqueda (500ms de retraso)
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  
  // Estados para crear/editar tarea
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
    prioridad: 'media',
    asignada_a_id: ''
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    console.log('🔄 Initial data load - businessId:', businessId);
    if (businessId) {
      cargarDatosIniciales();
    } else {
      console.log('❌ No businessId found, not loading data');
    }
  }, [businessId]);

  // Efecto separado para búsqueda con debounce
  useEffect(() => {
    console.log('🔍 Search effect triggered - debouncedSearchTerm:', debouncedSearchTerm);
    if (businessId) {
      // Actualizar filtros con el término de búsqueda debounced
      setFiltros(prev => ({
        ...prev,
        busqueda: debouncedSearchTerm
      }));
    }
  }, [debouncedSearchTerm, businessId]);

  // Efecto para filtros (excluyendo búsqueda que se maneja arriba)
  useEffect(() => {
    console.log('🔄 Filters effect triggered - filtros:', filtros);
    if (businessId && (filtros.estado || filtros.prioridad || filtros.asignada_a_id || filtros.busqueda !== searchInput)) {
      cargarTareas();
    }
  }, [filtros.estado, filtros.prioridad, filtros.asignada_a_id, filtros.busqueda, businessId]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos del usuario
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('❌ Error cargando usuario:', err);
      }
      
      // Cargar empleados
      console.log('🔄 Cargando empleados...');
      try {
        const empleadosData = await tasksAPI.getEmployees(businessId);
        console.log('✅ Empleados cargados:', empleadosData);
        setEmpleados(empleadosData.empleados || []);
      } catch (err) {
        console.error('❌ Error cargando empleados:', err);
        setEmpleados([]);
      }
      
      // Cargar estadísticas
      console.log('🔄 Cargando estadísticas...');
      try {
        const estadisticasData = await tasksAPI.getTaskStatistics(businessId);
        console.log('✅ Estadísticas cargadas:', estadisticasData);
        setEstadisticas(estadisticasData);
      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err);
        setEstadisticas(null);
      }

      // Cargar tareas iniciales
      await cargarTareas();
      
    } catch (err) {
      console.error('❌ Error general:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarTareas = async () => {
    try {
      setSearchLoading(true);
      
      // Filtrar parámetros vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      console.log('📋 Filtros a enviar:', filtrosLimpios);
      
      const tareasData = await tasksAPI.getTasks(businessId, filtrosLimpios);
      console.log('✅ Tareas cargadas:', tareasData);
      setTareas(tareasData.tareas || []);
      
    } catch (err) {
      console.error('❌ Error cargando tareas:', err);
      setTareas([]);
      setError('Error al cargar las tareas');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Mostrar indicador de búsqueda solo si hay texto
    if (value.trim()) {
      setSearchLoading(true);
    }
  };

  const handleSubmitTarea = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    
    if (formData.titulo.length > 200) {
      setError('El título no puede exceder 200 caracteres');
      return;
    }
    
    if (formData.descripcion && formData.descripcion.length > 1000) {
      setError('La descripción no puede exceder 1000 caracteres');
      return;
    }
    
    try {
      // Convertir fechas al formato correcto para el backend
      let fechaInicio = null;
      let fechaFin = null;
      
      if (formData.fecha_inicio) {
        // datetime-local devuelve formato YYYY-MM-DDTHH:mm
        // Necesitamos convertir a ISO string con timezone
        fechaInicio = new Date(formData.fecha_inicio).toISOString();
      }
      
      if (formData.fecha_fin) {
        // datetime-local devuelve formato YYYY-MM-DDTHH:mm
        // Necesitamos convertir a ISO string con timezone
        fechaFin = new Date(formData.fecha_fin).toISOString();
      }
      
      const data = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion?.trim() || null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: formData.estado,
        prioridad: formData.prioridad,
        asignada_a_id: formData.asignada_a_id || null
      };

      console.log('📤 Enviando datos de tarea:', data);
      console.log('📤 Tipos de datos:', {
        titulo: typeof data.titulo,
        descripcion: typeof data.descripcion,
        fecha_inicio: typeof data.fecha_inicio,
        fecha_fin: typeof data.fecha_fin,
        estado: typeof data.estado,
        prioridad: typeof data.prioridad,
        asignada_a_id: typeof data.asignada_a_id
      });
      console.log('📤 Valores exactos:', {
        titulo: `"${data.titulo}"`,
        descripcion: data.descripcion ? `"${data.descripcion}"` : 'null',
        fecha_inicio: data.fecha_inicio ? `"${data.fecha_inicio}"` : 'null',
        fecha_fin: data.fecha_fin ? `"${data.fecha_fin}"` : 'null',
        estado: `"${data.estado}"`,
        prioridad: `"${data.prioridad}"`,
        asignada_a_id: data.asignada_a_id ? `"${data.asignada_a_id}"` : 'null'
      });

      if (tareaEditando) {
        await tasksAPI.updateTask(businessId, tareaEditando.id, data);
      } else {
        await tasksAPI.createTask(businessId, data);
      }
      
      setMostrarFormulario(false);
      setTareaEditando(null);
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'pendiente',
        prioridad: 'media',
        asignada_a_id: ''
      });
      
      // Recargar solo las tareas y estadísticas
      await cargarTareas();
      
      // Actualizar estadísticas
      try {
        const estadisticasData = await tasksAPI.getTaskStatistics(businessId);
        setEstadisticas(estadisticasData);
      } catch (err) {
        console.error('❌ Error actualizando estadísticas:', err);
      }
      
    } catch (err) {
      console.error('❌ Error al guardar tarea:', err);
      
      // Manejar diferentes tipos de errores de forma segura
      let errorMessage = 'Error al guardar la tarea';
      
      try {
        if (err.response?.data) {
          const errorData = err.response.data;
          
          // Si es un error de validación de Pydantic (422)
          if (err.response.status === 422 && errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              // Formatear errores de validación de Pydantic
              const validationErrors = errorData.detail.map(error => {
                const field = error.loc ? error.loc.join('.') : 'campo';
                return `${field}: ${error.msg}`;
              }).join(', ');
              errorMessage = `Error de validación: ${validationErrors}`;
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else {
              errorMessage = 'Error de validación en los datos enviados';
            }
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      } catch (parseError) {
        console.error('❌ Error procesando mensaje de error:', parseError);
        errorMessage = 'Error al procesar la respuesta del servidor';
      }
      
      // Detectar error de restricción única temporal
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint') || 
          errorMessage.includes('tareas_negocio_id_key') || err.response?.status === 409) {
        errorMessage = 'Error temporal: La base de datos tiene una restricción que permite solo una tarea por negocio. Contacta al administrador para solucionarlo.';
      }
      
      // Asegurar que errorMessage sea siempre un string
      if (typeof errorMessage !== 'string') {
        errorMessage = 'Error desconocido al guardar la tarea';
      }
      
      setError(errorMessage);
    }
  };

  const handleEditarTarea = (tarea) => {
    // Convertir fechas ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
    const formatearFechaParaInput = (fechaISO) => {
      if (!fechaISO) return '';
      const fecha = new Date(fechaISO);
      // Ajustar a timezone local y formatear como YYYY-MM-DDTHH:mm
      const offset = fecha.getTimezoneOffset();
      const fechaLocal = new Date(fecha.getTime() - (offset * 60 * 1000));
      return fechaLocal.toISOString().slice(0, 16);
    };

    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      fecha_inicio: formatearFechaParaInput(tarea.fecha_inicio),
      fecha_fin: formatearFechaParaInput(tarea.fecha_fin),
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      asignada_a_id: tarea.asignada_a_id || ''
    });
    setTareaEditando(tarea);
    setMostrarFormulario(true);
  };

  const handleEliminarTarea = async (tareaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    
    try {
      await tasksAPI.deleteTask(businessId, tareaId);
      await cargarTareas();
      
      // Actualizar estadísticas
      try {
        const estadisticasData = await tasksAPI.getTaskStatistics(businessId);
        setEstadisticas(estadisticasData);
      } catch (err) {
        console.error('❌ Error actualizando estadísticas:', err);
      }
    } catch (err) {
      setError('Error al eliminar la tarea');
    }
  };

  const handleCambiarEstado = async (tareaId, nuevoEstado) => {
    try {
      await tasksAPI.updateTask(businessId, tareaId, { estado: nuevoEstado });
      await cargarTareas();
      
      // Actualizar estadísticas
      try {
        const estadisticasData = await tasksAPI.getTaskStatistics(businessId);
        setEstadisticas(estadisticasData);
      } catch (err) {
        console.error('❌ Error actualizando estadísticas:', err);
      }
    } catch (err) {
      setError('Error al actualizar el estado de la tarea');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/login');
    window.location.href = '/login';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="loading-spinner" style={{ width: '2rem', height: '2rem' }} />
            <span className="text-lg font-medium">Cargando tareas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(`/business/${businessId}`)}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Volver al Dashboard
            </button>
            
            <div className="flex items-center">
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: '#d97706', 
                borderRadius: '0.5rem',
                marginRight: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClipboardList style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Tareas</h1>
                <p className="text-sm text-gray-500">Organiza y supervisa el trabajo del equipo</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hola, {user?.nombre || 'Usuario'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <LogOut style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Panel de Tareas</h2>
            <p className="text-gray-600 mt-1">
              Gestiona las tareas y proyectos de tu equipo
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${vistaActual === 'lista' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVistaActual('lista')}
            >
              <List style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Lista
            </button>
            <button
              className={`btn btn-sm ${vistaActual === 'calendario' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVistaActual('calendario')}
            >
              <Calendar style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Calendario
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setMostrarFormulario(true)}>
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Nueva Tarea
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            {error}
          </div>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{estadisticas.total_tareas}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ClipboardList style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{estadisticas.pendientes}</p>
                    <p className="text-sm text-gray-600">Pendientes</p>
                  </div>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#d97706' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{estadisticas.en_progreso}</p>
                    <p className="text-sm text-gray-600">En Progreso</p>
                  </div>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
                    <p className="text-sm text-gray-600">Completadas</p>
                  </div>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#d1fae5', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</p>
                    <p className="text-sm text-gray-600">Vencidas</p>
                  </div>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#fee2e2', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-6">
          <div className="card-content p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline' }} />
                  Buscar
                  {searchLoading && (
                    <Loader2 className="loading-spinner" style={{ 
                      width: '0.875rem', 
                      height: '0.875rem', 
                      marginLeft: '0.5rem',
                      display: 'inline-block'
                    }} />
                  )}
                </label>
                <input
                  className="search-input"
                  placeholder="Buscar en título o descripción..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(ESTADOS).map(([key, estado]) => (
                    <option key={key} value={key}>{estado.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  className="form-select"
                  value={filtros.prioridad}
                  onChange={(e) => setFiltros({...filtros, prioridad: e.target.value})}
                >
                  <option value="">Todas las prioridades</option>
                  {Object.entries(PRIORIDADES).map(([key, prioridad]) => (
                    <option key={key} value={key}>{prioridad.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Asignado a</label>
                <select
                  className="form-select"
                  value={filtros.asignada_a_id}
                  onChange={(e) => setFiltros({...filtros, asignada_a_id: e.target.value})}
                >
                  <option value="">Todos los empleados</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vista Lista */}
        {vistaActual === 'lista' && (
          <div className="grid gap-4">
            {tareas.length === 0 ? (
              <div className="card">
                <div className="card-content p-8 text-center">
                  <div style={{ 
                    width: '4rem', 
                    height: '4rem', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <ClipboardList style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay tareas que mostrar
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchInput ? 
                      `No se encontraron tareas que coincidan con "${searchInput}"` :
                      'Crea tu primera tarea para comenzar a organizar el trabajo.'
                    }
                  </p>
                  {!searchInput && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setMostrarFormulario(true)}
                    >
                      <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      Crear Primera Tarea
                    </button>
                  )}
                </div>
              </div>
            ) : (
              tareas.map((tarea) => (
                <div key={tarea.id} className="card">
                  <div className="card-content p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{tarea.titulo}</h3>
                          <span className={`badge ${ESTADOS[tarea.estado]?.cssClass}`}>
                            {ESTADOS[tarea.estado]?.label}
                          </span>
                          <span className={`badge ${PRIORIDADES[tarea.prioridad]?.cssClass}`}>
                            {PRIORIDADES[tarea.prioridad]?.label}
                          </span>
                        </div>
                        {tarea.descripcion && (
                          <p className="text-gray-600 mb-2">{tarea.descripcion}</p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                            Inicio: {formatearFecha(tarea.fecha_inicio)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target style={{ width: '0.875rem', height: '0.875rem' }} />
                            Fin: {formatearFecha(tarea.fecha_fin)}
                          </span>
                          {tarea.asignada_a && (
                            <span className="flex items-center gap-1">
                              <User style={{ width: '0.875rem', height: '0.875rem' }} />
                              {tarea.asignada_a.nombre} {tarea.asignada_a.apellido}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {tarea.estado !== 'completada' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCambiarEstado(tarea.id, 'completada')}
                          >
                            <CheckCircle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                            Completar
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEditarTarea(tarea)}
                        >
                          <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          Editar
                        </button>
                        <button
                          className="btn btn-destructive btn-sm"
                          onClick={() => handleEliminarTarea(tarea.id)}
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vista Calendario */}
        {vistaActual === 'calendario' && (
          <div className="card">
            <div className="card-content p-8 text-center">
              <div style={{ 
                width: '4rem', 
                height: '4rem', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Calendar style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vista de calendario próximamente
              </h3>
              <p className="text-gray-500">
                Integración con librería de calendario en desarrollo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            
            <form onSubmit={handleSubmitTarea} className="grid gap-4">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  className="form-input"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Título de la tarea"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Fecha y Hora de Inicio</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha y Hora de Fin</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    {Object.entries(ESTADOS).map(([key, estado]) => (
                      <option key={key} value={key}>{estado.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select
                    className="form-select"
                    value={formData.prioridad}
                    onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                  >
                    {Object.entries(PRIORIDADES).map(([key, prioridad]) => (
                      <option key={key} value={key}>{prioridad.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Asignar a</label>
                <select
                  className="form-select"
                  value={formData.asignada_a_id}
                  onChange={(e) => setFormData({...formData, asignada_a_id: e.target.value})}
                >
                  <option value="">Sin asignar</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre_completo} ({empleado.rol})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn btn-primary w-full">
                  {tareaEditando ? 'Actualizar' : 'Crear'} Tarea
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setTareaEditando(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 