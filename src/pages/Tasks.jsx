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
import { PageLoader } from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import PermissionGuard from '../components/PermissionGuard';
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

function TasksComponent({ currentBusiness }) {
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
    const effectiveBusinessId = businessId || currentBusiness?.id;
    if (effectiveBusinessId) {
      cargarDatosIniciales();
    } else {
      console.log('❌ No businessId found, not loading data');
    }
  }, [businessId, currentBusiness?.id]);

  // Efecto separado para búsqueda con debounce
  useEffect(() => {
    console.log('🔍 Search effect triggered - debouncedSearchTerm:', debouncedSearchTerm);
    const effectiveBusinessId = businessId || currentBusiness?.id;
    if (effectiveBusinessId) {
      // Actualizar filtros con el término de búsqueda debounced
      setFiltros(prev => ({
        ...prev,
        busqueda: debouncedSearchTerm
      }));
    }
  }, [debouncedSearchTerm, businessId, currentBusiness?.id]);

  // Efecto para filtros (excluyendo búsqueda que se maneja arriba)
  useEffect(() => {
    console.log('🔄 Filters effect triggered - filtros:', filtros);
    const effectiveBusinessId = businessId || currentBusiness?.id;
    if (effectiveBusinessId && (filtros.estado || filtros.prioridad || filtros.asignada_a_id || filtros.busqueda !== searchInput)) {
      cargarTareas();
    }
  }, [filtros.estado, filtros.prioridad, filtros.asignada_a_id, filtros.busqueda, businessId, currentBusiness?.id]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError('');
      const effectiveBusinessId = businessId || currentBusiness?.id;
      
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
        const empleadosData = await tasksAPI.getEmployees(effectiveBusinessId);
        console.log('✅ Empleados cargados:', empleadosData);
        setEmpleados(empleadosData.empleados || []);
      } catch (err) {
        console.error('❌ Error cargando empleados:', err);
        setEmpleados([]);
      }
      
      // Cargar estadísticas
      console.log('🔄 Cargando estadísticas...');
      try {
        const estadisticasData = await tasksAPI.getTaskStatistics(effectiveBusinessId);
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
      const effectiveBusinessId = businessId || currentBusiness?.id;
      
      // Filtrar parámetros vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      console.log('📋 Filtros a enviar:', filtrosLimpios);
      
      const tareasData = await tasksAPI.getTasks(effectiveBusinessId, filtrosLimpios);
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
    
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    try {
      setLoading(true);
      const effectiveBusinessId = businessId || currentBusiness?.id;
      
      const tareaData = {
        ...formData,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        asignada_a_id: formData.asignada_a_id || null
      };
      
      if (tareaEditando) {
        console.log('🔄 Actualizando tarea:', tareaEditando.id, tareaData);
        await tasksAPI.updateTask(effectiveBusinessId, tareaEditando.id, tareaData);
      } else {
        console.log('🔄 Creando nueva tarea:', tareaData);
        await tasksAPI.createTask(effectiveBusinessId, tareaData);
      }
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'pendiente',
        prioridad: 'media',
        asignada_a_id: ''
      });
      setMostrarFormulario(false);
      setTareaEditando(null);
      
      // Recargar datos
      await cargarDatosIniciales();
      
    } catch (err) {
      console.error('❌ Error guardando tarea:', err);
      setError(err.response?.data?.detail || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
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
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }
    
    try {
      setLoading(true);
      const effectiveBusinessId = businessId || currentBusiness?.id;
      console.log('🗑️ Eliminando tarea:', tareaId);
      await tasksAPI.deleteTask(effectiveBusinessId, tareaId);
      await cargarDatosIniciales();
    } catch (err) {
      console.error('❌ Error eliminando tarea:', err);
      setError(err.response?.data?.detail || 'Error al eliminar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (tareaId, nuevoEstado) => {
    try {
      setLoading(true);
      const effectiveBusinessId = businessId || currentBusiness?.id;
      console.log('🔄 Cambiando estado de tarea:', tareaId, 'a', nuevoEstado);
      await tasksAPI.updateTask(effectiveBusinessId, tareaId, { estado: nuevoEstado });
      await cargarDatosIniciales();
    } catch (err) {
      console.error('❌ Error cambiando estado:', err);
      setError(err.response?.data?.detail || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/login');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  if (loading) {
    return <PageLoader message="Cargando sistema de tareas..." variant="primary" />;
  }

  return (
    <Layout activeSection="tasks">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Tareas
            </h1>
            <p className="text-gray-600">
              Organiza y gestiona las tareas de tu equipo
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{estadisticas.total_tareas}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total</p>
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{estadisticas.pendientes}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pendientes</p>
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{estadisticas.en_progreso}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>En Progreso</p>
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{estadisticas.completadas}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completadas</p>
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
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{estadisticas.vencidas}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Vencidas</p>
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
    </Layout>
  );
}

export default function ProtectedTasks() {
  return (
    <PermissionGuard requiredModule="tareas" requiredAction="ver">
      <TasksComponent />
    </PermissionGuard>
  );
} 