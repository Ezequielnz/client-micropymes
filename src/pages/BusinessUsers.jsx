import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessAPI, authAPI } from '../utils/api';
import {
  ArrowLeft,
  LogOut,
  Users,
  Settings,
  Check,
  X,
  Edit,
  Save,
  UserCheck,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';

function BusinessUsers() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Permisos disponibles
  const availablePermissions = {
    productos: { label: 'Productos y Servicios', actions: ['ver', 'editar', 'eliminar'] },
    clientes: { label: 'Clientes', actions: ['ver', 'editar', 'eliminar'] },
    categorias: { label: 'Categorías', actions: ['ver', 'editar', 'eliminar'] },
    ventas: { label: 'Ventas (POS)', actions: ['ver', 'editar', 'eliminar'] },
    stock: { label: 'Gestión de Stock', actions: ['ver', 'editar'] },
    facturacion: { label: 'Facturación', actions: ['ver', 'editar'] },
    tareas: { label: 'Tareas (Solo asignar)', actions: ['asignar'] }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del usuario actual
      const userData = await authAPI.getCurrentUser();
      setCurrentUser(userData);

      // Cargar datos del negocio
      const businessData = await businessAPI.getBusinessById(businessId);
      setBusiness(businessData);

      // Verificar que el usuario actual sea admin
      const businessUsers = await businessAPI.getBusinessUsers(businessId);
      const currentUserInBusiness = businessUsers.find(u => u.usuario?.email === userData.email);
      
      if (currentUserInBusiness?.rol !== 'admin') {
        setError('No tienes permisos para acceder a esta página');
        return;
      }

      // Cargar usuarios del negocio
      setUsers(businessUsers);

      // Cargar usuarios pendientes
      try {
        const pendingData = await businessAPI.getPendingUsers(businessId);
        setPendingUsers(pendingData);
      } catch (err) {
        console.error('Error loading pending users:', err);
        setPendingUsers([]);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userBusinessId, permissions) => {
    try {
      await businessAPI.approveUser(businessId, userBusinessId, permissions);
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Error al aprobar usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRejectUser = async (userBusinessId) => {
    if (!confirm('¿Estás seguro de que quieres rechazar este usuario?')) return;
    
    try {
      await businessAPI.rejectUser(businessId, userBusinessId);
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Error al rechazar usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpdatePermissions = async (userBusinessId, newPermissions) => {
    try {
      await businessAPI.updateUserPermissions(businessId, userBusinessId, newPermissions);
      setEditingUser(null);
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error updating permissions:', err);
      alert('Error al actualizar permisos: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveUser = async (userBusinessId) => {
    if (!confirm('¿Estás seguro de que quieres remover este usuario del negocio?')) return;
    
    try {
      await businessAPI.removeUser(businessId, userBusinessId);
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Error al remover usuario: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    navigate('/login');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg font-medium">Cargando usuarios...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="card max-w-md mx-auto">
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2">
                <button onClick={loadData} className="btn btn-primary flex-1">
                  Reintentar
                </button>
                <button onClick={() => navigate(`/business/${businessId}`)} className="btn btn-outline flex-1">
                  Volver
                </button>
              </div>
            </div>
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
              onClick={() => navigate(`/business/${businessId}`)}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Usuarios
                </h1>
                <p className="text-sm text-gray-500">{business?.nombre}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hola, {currentUser?.nombre || 'Usuario'}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Usuarios del Negocio
          </h2>
          <p className="text-gray-600">
            Gestiona los usuarios y sus permisos para acceder a las diferentes secciones del sistema
          </p>
        </div>

        {/* Usuarios Pendientes */}
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Usuarios Pendientes de Aprobación ({pendingUsers.length})
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {pendingUsers.map((pendingUser) => (
                    <PendingUserCard
                      key={pendingUser.id}
                      user={pendingUser}
                      availablePermissions={availablePermissions}
                      onApprove={handleApproveUser}
                      onReject={handleRejectUser}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usuarios Activos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usuarios Activos ({users.length})
            </h3>
          </div>
          <div className="card-content">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay usuarios activos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    availablePermissions={availablePermissions}
                    editingUser={editingUser}
                    currentUser={currentUser}
                    onEdit={setEditingUser}
                    onSave={handleUpdatePermissions}
                    onCancel={() => setEditingUser(null)}
                    onRemove={handleRemoveUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para usuarios pendientes
function PendingUserCard({ user, availablePermissions, onApprove, onReject }) {
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const handlePermissionChange = (module, action, checked) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [`puede_${action}_${module}`]: checked
    }));
  };

  const handleApprove = () => {
    onApprove(user.id, selectedPermissions);
  };

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-900">
            {user.usuario?.nombre} {user.usuario?.apellido}
          </h4>
          <p className="text-sm text-gray-600">{user.usuario?.email}</p>
          <span className="badge badge-pending mt-1">Pendiente</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            className="btn btn-success btn-sm"
          >
            <Check className="h-4 w-4 mr-1" />
            Aprobar
          </button>
          <button
            onClick={() => onReject(user.id)}
            className="btn btn-destructive btn-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Rechazar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(availablePermissions).map(([module, config]) => (
          <div key={module} className="bg-white p-3 rounded border">
            <h5 className="font-medium text-sm mb-2">{config.label}</h5>
            <div className="space-y-1">
              {config.actions.map((action) => (
                <label key={action} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                  />
                  {action === 'ver' ? 'Ver' : 
                   action === 'editar' ? 'Editar' : 
                   action === 'eliminar' ? 'Eliminar' : 
                   action === 'asignar' ? 'Asignar' : action}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para usuarios activos
function UserCard({ user, availablePermissions, editingUser, currentUser, onEdit, onSave, onCancel, onRemove }) {
  const [permissions, setPermissions] = useState({});
  const isEditing = editingUser?.id === user.id;
  const isCurrentUser = user.usuario?.email === currentUser?.email;

  useEffect(() => {
    if (isEditing && user.permisos) {
      setPermissions(user.permisos);
    }
  }, [isEditing, user.permisos]);

  const handlePermissionChange = (permissionKey, checked) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: checked
    }));
  };

  const handleSave = () => {
    onSave(user.id, permissions);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            {user.usuario?.nombre} {user.usuario?.apellido}
            {user.rol === 'admin' && (
              <span className="badge" style={{backgroundColor: '#e0e7ff', color: '#3730a3'}}>
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            )}
            {isCurrentUser && (
              <span className="badge" style={{backgroundColor: '#dcfce7', color: '#166534'}}>
                Tú
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-600">{user.usuario?.email}</p>
          <span className="badge" style={{backgroundColor: '#d1fae5', color: '#065f46'}}>
            Activo
          </span>
        </div>
        
        {!isCurrentUser && user.rol !== 'admin' && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn btn-success btn-sm">
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </button>
                <button onClick={onCancel} className="btn btn-outline btn-sm">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onEdit(user)} className="btn btn-outline btn-sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button onClick={() => onRemove(user.id)} className="btn btn-destructive btn-sm">
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {user.rol === 'admin' ? (
        <div className="bg-blue-50 p-3 rounded border">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Este usuario tiene acceso total como administrador
          </p>
        </div>
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(availablePermissions).map(([module, config]) => (
            <div key={module} className="bg-gray-50 p-3 rounded border">
              <h5 className="font-medium text-sm mb-2">{config.label}</h5>
              <div className="space-y-1">
                {config.actions.map((action) => {
                  const permissionKey = `puede_${action}_${module}`;
                  return (
                    <label key={action} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={permissions[permissionKey] || false}
                        onChange={(e) => handlePermissionChange(permissionKey, e.target.checked)}
                      />
                      {action === 'ver' ? 'Ver' : 
                       action === 'editar' ? 'Editar' : 
                       action === 'eliminar' ? 'Eliminar' : 
                       action === 'asignar' ? 'Asignar' : action}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(availablePermissions).map(([module, config]) => (
            <div key={module} className="bg-gray-50 p-3 rounded border">
              <h5 className="font-medium text-sm mb-2">{config.label}</h5>
              <div className="space-y-1">
                {config.actions.map((action) => {
                  const permissionKey = `puede_${action}_${module}`;
                  const hasPermission = user.permisos?.[permissionKey];
                  return (
                    <div key={action} className="flex items-center text-sm">
                      {hasPermission ? (
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span className={hasPermission ? 'text-green-700' : 'text-red-700'}>
                        {action === 'ver' ? 'Ver' : 
                         action === 'editar' ? 'Editar' : 
                         action === 'eliminar' ? 'Eliminar' : 
                         action === 'asignar' ? 'Asignar' : action}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BusinessUsers; 