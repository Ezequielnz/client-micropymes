import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessAPI } from '../utils/api';
import {
  ArrowLeft,
  Users,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  Loader2,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';

// Componentes reutilizables
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
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
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
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

// Componente para mostrar permisos
const PermissionBadge = ({ permission, value }) => {
  if (!value) return null;
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {permission}
    </span>
  );
};

// Componente para editar permisos
const PermissionEditor = ({ permissions, onChange, onSave, onCancel }) => {
  const [localPermissions, setLocalPermissions] = useState(permissions);

  const handlePermissionChange = (key, value) => {
    setLocalPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSave(localPermissions);
  };

  const permissionGroups = [
    {
      title: 'Productos',
      permissions: [
        { key: 'puede_ver_productos', label: 'Ver productos' },
        { key: 'puede_editar_productos', label: 'Editar productos' },
        { key: 'puede_eliminar_productos', label: 'Eliminar productos' }
      ]
    },
    {
      title: 'Clientes',
      permissions: [
        { key: 'puede_ver_clientes', label: 'Ver clientes' },
        { key: 'puede_editar_clientes', label: 'Editar clientes' },
        { key: 'puede_eliminar_clientes', label: 'Eliminar clientes' }
      ]
    },
    {
      title: 'Categorías',
      permissions: [
        { key: 'puede_ver_categorias', label: 'Ver categorías' },
        { key: 'puede_editar_categorias', label: 'Editar categorías' },
        { key: 'puede_eliminar_categorias', label: 'Eliminar categorías' }
      ]
    },
    {
      title: 'Ventas',
      permissions: [
        { key: 'puede_ver_ventas', label: 'Ver ventas' },
        { key: 'puede_editar_ventas', label: 'Editar ventas' }
      ]
    },
    {
      title: 'Stock',
      permissions: [
        { key: 'puede_ver_stock', label: 'Ver stock' },
        { key: 'puede_editar_stock', label: 'Editar stock' }
      ]
    },
    {
      title: 'Facturación',
      permissions: [
        { key: 'puede_ver_facturacion', label: 'Ver facturación' },
        { key: 'puede_editar_facturacion', label: 'Editar facturación' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Acceso Total */}
      <div className="border-b pb-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={localPermissions.acceso_total || false}
            onChange={(e) => handlePermissionChange('acceso_total', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-900">Acceso Total (Todos los permisos)</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Si está marcado, el usuario tendrá acceso completo a todas las funciones
        </p>
      </div>

      {/* Permisos específicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {permissionGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">
              {group.title}
            </h4>
            <div className="space-y-2">
              {group.permissions.map((perm) => (
                <label key={perm.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localPermissions[perm.key] || false}
                    onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                    disabled={localPermissions.acceso_total}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className={`text-sm ${localPermissions.acceso_total ? 'text-gray-400' : 'text-gray-700'}`}>
                    {perm.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Permisos
        </Button>
      </div>
    </div>
  );
};

function BusinessUsers() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [approvingUser, setApprovingUser] = useState(null);
  const [showPermissions, setShowPermissions] = useState({});

  useEffect(() => {
    loadUsers();
  }, [businessId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar usuarios del negocio
      const usersData = await businessAPI.getBusinessUsers(businessId);
      setUsers(usersData);

      // Cargar usuarios pendientes
      const pendingData = await businessAPI.getPendingUsers(businessId);
      setPendingUsers(pendingData);

    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (usuarioNegocioId, permissions) => {
    try {
      await businessAPI.approveUser(businessId, usuarioNegocioId, permissions);
      await loadUsers(); // Recargar datos
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Error al aprobar usuario: ' + err.message);
    }
  };

  const handleRejectUser = async (usuarioNegocioId) => {
    if (!confirm('¿Estás seguro de que quieres rechazar este usuario?')) return;
    
    try {
      await businessAPI.rejectUser(businessId, usuarioNegocioId);
      await loadUsers(); // Recargar datos
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Error al rechazar usuario: ' + err.message);
    }
  };

  const handleUpdatePermissions = async (usuarioNegocioId, permissions) => {
    try {
      await businessAPI.updateUserPermissions(businessId, usuarioNegocioId, permissions);
      setEditingUser(null);
      await loadUsers(); // Recargar datos
    } catch (err) {
      console.error('Error updating permissions:', err);
      alert('Error al actualizar permisos: ' + err.message);
    }
  };

  const handleRemoveUser = async (usuarioNegocioId) => {
    if (!confirm('¿Estás seguro de que quieres remover este usuario del negocio?')) return;
    
    try {
      await businessAPI.removeUser(businessId, usuarioNegocioId);
      await loadUsers(); // Recargar datos
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Error al remover usuario: ' + err.message);
    }
  };

  const togglePermissionsView = (userId) => {
    setShowPermissions(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      aceptado: { color: 'green', icon: CheckCircle, text: 'Activo' },
      pendiente: { color: 'yellow', icon: Clock, text: 'Pendiente' },
      rechazado: { color: 'red', icon: XCircle, text: 'Rechazado' }
    };

    const config = statusConfig[estado] || statusConfig.pendiente;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={loadUsers} className="w-full">
                Reintentar
              </Button>
              <Button onClick={() => navigate(`/business/${businessId}`)} variant="outline" className="w-full">
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/business/${businessId}`)}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Gestión de Usuarios
                  </h1>
                  <p className="text-sm text-gray-500">Administrar usuarios y permisos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Usuarios del Negocio</h2>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios que tienen acceso a tu negocio y configura sus permisos
          </p>
        </div>

        {/* Usuarios Pendientes */}
        {pendingUsers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Usuarios Pendientes de Aprobación ({pendingUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.usuario?.nombre} {user.usuario?.apellido}
                        </p>
                        <p className="text-sm text-gray-600">{user.usuario?.email}</p>
                        <p className="text-xs text-gray-500">
                          Solicitó acceso el {new Date(user.creada_en).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Abrir modal de permisos para aprobación
                          setApprovingUser(user);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usuarios Activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Usuarios Activos ({users.filter(u => u.estado === 'aceptado').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.filter(u => u.estado === 'aceptado').map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.usuario?.nombre} {user.usuario?.apellido}
                        </h3>
                        <p className="text-sm text-gray-600">{user.usuario?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(user.estado)}
                          <span className="text-xs text-gray-500">
                            Rol: {user.rol}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePermissionsView(user.id)}
                      >
                        {showPermissions[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showPermissions[user.id] ? 'Ocultar' : 'Ver'} Permisos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {user.rol !== 'admin' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mostrar permisos */}
                  {showPermissions[user.id] && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Permisos Actuales:</h4>
                      {user.permisos?.acceso_total ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Shield className="h-4 w-4 mr-1" />
                          Acceso Total
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <PermissionBadge permission="Ver Productos" value={user.permisos?.puede_ver_productos} />
                          <PermissionBadge permission="Editar Productos" value={user.permisos?.puede_editar_productos} />
                          <PermissionBadge permission="Eliminar Productos" value={user.permisos?.puede_eliminar_productos} />
                          <PermissionBadge permission="Ver Clientes" value={user.permisos?.puede_ver_clientes} />
                          <PermissionBadge permission="Editar Clientes" value={user.permisos?.puede_editar_clientes} />
                          <PermissionBadge permission="Eliminar Clientes" value={user.permisos?.puede_eliminar_clientes} />
                          <PermissionBadge permission="Ver Categorías" value={user.permisos?.puede_ver_categorias} />
                          <PermissionBadge permission="Editar Categorías" value={user.permisos?.puede_editar_categorias} />
                          <PermissionBadge permission="Eliminar Categorías" value={user.permisos?.puede_eliminar_categorias} />
                          <PermissionBadge permission="Ver Ventas" value={user.permisos?.puede_ver_ventas} />
                          <PermissionBadge permission="Editar Ventas" value={user.permisos?.puede_editar_ventas} />
                          <PermissionBadge permission="Ver Stock" value={user.permisos?.puede_ver_stock} />
                          <PermissionBadge permission="Editar Stock" value={user.permisos?.puede_editar_stock} />
                          <PermissionBadge permission="Ver Facturación" value={user.permisos?.puede_ver_facturacion} />
                          <PermissionBadge permission="Editar Facturación" value={user.permisos?.puede_editar_facturacion} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición de permisos */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Permisos - {editingUser.usuario?.nombre} {editingUser.usuario?.apellido}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{editingUser.usuario?.email}</p>
            </div>
            <div className="p-6">
              <PermissionEditor
                permissions={editingUser.permisos || {}}
                onSave={(permissions) => handleUpdatePermissions(editingUser.id, permissions)}
                onCancel={() => setEditingUser(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de aprobación con permisos */}
      {approvingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Aprobar Usuario - {approvingUser.usuario?.nombre} {approvingUser.usuario?.apellido}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{approvingUser.usuario?.email}</p>
              <p className="text-sm text-blue-600 mt-1">
                Configura los permisos que tendrá este usuario en tu negocio
              </p>
            </div>
            <div className="p-6">
              <PermissionEditor
                permissions={{
                  acceso_total: false,
                  puede_ver_productos: true,
                  puede_editar_productos: false,
                  puede_eliminar_productos: false,
                  puede_ver_clientes: true,
                  puede_editar_clientes: false,
                  puede_eliminar_clientes: false,
                  puede_ver_categorias: true,
                  puede_editar_categorias: false,
                  puede_eliminar_categorias: false,
                  puede_ver_ventas: false,
                  puede_editar_ventas: false,
                  puede_ver_stock: false,
                  puede_editar_stock: false,
                  puede_ver_facturacion: false,
                  puede_editar_facturacion: false
                }}
                onSave={(permissions) => {
                  handleApproveUser(approvingUser.id, permissions);
                  setApprovingUser(null);
                }}
                onCancel={() => setApprovingUser(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessUsers; 