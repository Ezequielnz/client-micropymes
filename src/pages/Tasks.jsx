import React, { useState, useEffect, useCallback } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorHandler';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Calendar, 
  User, 
  Flag,
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  CheckSquare,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Building2,
  List,
  ClipboardList,
  Activity
} from 'lucide-react';
import { PageLoader } from '../components/LoadingSpinner';
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

/**
 * Tasks component for managing tasks and assignments
 */
function Tasks() {
  const { currentBusiness } = useBusinessContext();
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;
  
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

  // ✅ OPTIMIZED: Use AuthContext instead of React Query for user
  const { user } = useAuth();

  // ✅ OPTIMIZED: React Query for tasks with smart caching and filters
  const { 
    data: tareasResponse = { tareas: [] }, 
    isLoading: loadingTasks,
    error: tasksError,
    isFetching: searchLoading
  } = useQuery({
    queryKey: ['tasks', businessId, filtros],
    queryFn: async () => {
      if (!businessId) return { tareas: [] };
      // Filtrar parámetros vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([, value]) => value !== '' && value !== null && value !== undefined)
      );
      return await tasksAPI.getTasks(businessId, filtrosLimpios);
    },
    enabled: !!businessId && !!currentBusiness,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: React Query for employees with conditional fetching
  const { 
    data: empleadosResponse = { empleados: [] }, 
    isLoading: loadingEmployees
  } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async () => {
      if (!businessId) return { empleados: [] };
      return await tasksAPI.getEmployees(businessId);
    },
    enabled: !!businessId && !!currentBusiness && !!user?.permissions?.some(p => p.name === 'puede_asignar_tareas'),
    staleTime: 10 * 60 * 1000, // 10 minutes (employees don't change often)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: React Query for statistics
  const { 
    data: estadisticas, 
    isLoading: loadingStatistics
  } = useQuery({
    queryKey: ['taskStatistics', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      return await tasksAPI.getTaskStatistics(businessId);
    },
    enabled: !!businessId && !!currentBusiness,
    staleTime: 2 * 60 * 1000, // 2 minutes (statistics change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await tasksAPI.createTask(businessId, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', businessId]);
      queryClient.invalidateQueries(['taskStatistics', businessId]);
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
    },
    onError: (err) => {
      console.error('Error creating task:', err);
    }
  });

  // ✅ OPTIMIZED: Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, taskData }) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await tasksAPI.updateTask(businessId, taskId, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', businessId]);
      queryClient.invalidateQueries(['taskStatistics', businessId]);
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
    },
    onError: (err) => {
      console.error('Error updating task:', err);
    }
  });

  // ✅ OPTIMIZED: Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await tasksAPI.deleteTask(businessId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', businessId]);
      queryClient.invalidateQueries(['taskStatistics', businessId]);
    },
    onError: (err) => {
      console.error('Error deleting task:', err);
    }
  });

  // ✅ OPTIMIZED: Change task status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await tasksAPI.updateTask(businessId, taskId, { estado: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', businessId]);
      queryClient.invalidateQueries(['taskStatistics', businessId]);
    },
    onError: (err) => {
      console.error('Error changing task status:', err);
    }
  });

  // ✅ OPTIMIZED: Memoized data extraction
  const tareas = React.useMemo(() => tareasResponse.tareas || [], [tareasResponse]);
  const empleados = React.useMemo(() => empleadosResponse.empleados || [], [empleadosResponse]);

  // ✅ OPTIMIZED: Memoized loading state
  const loading = React.useMemo(() => {
    return loadingTasks ||
           loadingEmployees || 
           createTaskMutation.isPending || 
           updateTaskMutation.isPending || 
           deleteTaskMutation.isPending || 
           changeStatusMutation.isPending;
  }, [loadingTasks, loadingEmployees, createTaskMutation.isPending, updateTaskMutation.isPending, deleteTaskMutation.isPending, changeStatusMutation.isPending]);

  // ✅ OPTIMIZED: Memoized error state
  const error = React.useMemo(() => {
    if (tasksError) {
      return getErrorMessage(tasksError);
    }
    return '';
  }, [tasksError]);

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

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
  }, []);

  const handleSubmitTarea = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      console.error('El título es obligatorio');
      return;
    }
    
    try {
      const tareaData = {
        ...formData,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        asignada_a_id: formData.asignada_a_id || null
      };
      
      if (tareaEditando) {
        console.log('🔄 Actualizando tarea:', tareaEditando.id, tareaData);
        await updateTaskMutation.mutateAsync({ taskId: tareaEditando.id, taskData: tareaData });
      } else {
        console.log('🔄 Creando nueva tarea:', tareaData);
        await createTaskMutation.mutateAsync(tareaData);
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  }, [formData, tareaEditando, createTaskMutation, updateTaskMutation]);

  const handleEditarTarea = useCallback((tarea) => {
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
  }, []);

  const handleEliminarTarea = useCallback(async (tareaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }
    
    try {
      console.log('🗑️ Eliminando tarea:', tareaId);
      await deleteTaskMutation.mutateAsync(tareaId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }, [deleteTaskMutation]);

  const handleCambiarEstado = useCallback(async (tareaId, nuevoEstado) => {
    try {
      console.log('🔄 Cambiando estado de tarea:', tareaId, 'a', nuevoEstado);
      await changeStatusMutation.mutateAsync({ taskId: tareaId, newStatus: nuevoEstado });
    } catch (err) {
      console.error('Error changing task status:', err);
    }
  }, [changeStatusMutation]);

  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES');
  }, []);

  // ✅ OPTIMIZED: Early return for missing business
  if (!currentBusiness) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Gestión de Tareas
            </h1>
            <p className="text-gray-600">
              Organiza y gestiona las tareas de tu equipo
            </p>
          </div>
        </div>
        <div className="alert alert-warning">
          <AlertTriangle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          No hay negocio seleccionado. Por favor selecciona un negocio desde el menú superior.
        </div>
      </div>
    );
  }

  if (loading && !tareas.length) {
    return <PageLoader message="Cargando sistema de tareas..." variant="primary" />;
  }

  return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 overflow-hidden">
        {/* Header Section - Mobile: Stacked, Desktop: Side-by-side */}
        <div className="mb-8 block sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 min-w-0">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Gestión de Tareas
            </h1>
            <p className="text-gray-600">
              Organiza y gestiona las tareas de tu equipo
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto sm:justify-start mt-4 sm:mt-0">
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
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setMostrarFormulario(true)}
            disabled={loading}
          >
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
      {estadisticas && !loadingStatistics && (
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
                disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
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
                    <div className="flex flex-wrap justify-between items-start gap-2">
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
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end sm:justify-start">
                        {tarea.estado !== 'completada' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCambiarEstado(tarea.id, 'completada')}
                          disabled={loading}
                          >
                            <CheckCircle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                            Completar
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEditarTarea(tarea)}
                        disabled={loading}
                        >
                          <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          Editar
                        </button>
                        <button
                          className="btn btn-destructive btn-sm"
                          onClick={() => handleEliminarTarea(tarea.id)}
                        disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha y Hora de Fin</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
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
                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="loading-spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      {tareaEditando ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                    {tareaEditando ? 'Actualizar' : 'Crear'} Tarea
                    </>
                  )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setTareaEditando(null);
                    }}
                  disabled={loading}
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

export default function ProtectedTasks() {
  return (
    <Layout activeSection="tasks">
    <PermissionGuard requiredModule="tareas" requiredAction="ver">
        <Tasks />
    </PermissionGuard>
    </Layout>
  );
} 

