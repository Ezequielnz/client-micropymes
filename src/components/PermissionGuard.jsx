import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserPermissions } from '../hooks/useUserPermissions';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react';

const MODULE_RESOURCE_MAP = {
  inventario: 'productos',
  productos: 'productos',
  categorias: 'categorias',
  clientes: 'clientes',
  ventas: 'ventas',
  tareas: 'tareas',
  stock: 'stock',
  facturacion: 'facturacion'
};

function PermissionGuard({ children, requiredModule, requiredAction = 'ver' }) {
  const navigate = useNavigate();
  
  // ✅ FIXED: Use BusinessContext instead of useParams
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // ✅ NEW: Use the new permissions system
  const { isLoading: loading, canView, canEdit, canDelete, hasFullAccess, permissions } = useUserPermissions(businessId);

  // ✅ NEW: Map modules to permission resources
  
  // ✅ NEW: Determine access based on new permission system
  const hasAccess = React.useMemo(() => {
    if (!permissions || loading) return false;
    
    // Debug logging
    console.log('PermissionGuard Debug:', {
      requiredModule,
      requiredAction,
      permissions,
      hasFullAccess: hasFullAccess(),
      isCreator: permissions?.is_creator,
      isAdmin: permissions?.is_admin,
      has_full_access: permissions?.has_full_access
    });
    
    // Full access users can access everything
    if (hasFullAccess()) {
      console.log('✅ Access granted: User has full access');
      return true;
    }
    
    // Map the required module to the actual resource
    const resource = MODULE_RESOURCE_MAP[requiredModule] || requiredModule;
    console.log('Mapped resource:', resource);
    
    // Check specific permission based on action
    let hasPermission = false;
    switch (requiredAction) {
      case 'ver':
        hasPermission = canView(resource);
        break;
      case 'editar':
        hasPermission = canEdit(resource);
        break;
      case 'eliminar':
        hasPermission = canDelete(resource);
        break;
      default:
        hasPermission = canView(resource);
    }
    
    console.log(`Permission check result for ${requiredAction} on ${resource}:`, hasPermission);
    return hasPermission;
  }, [permissions, loading, hasFullAccess, canView, canEdit, canDelete, requiredModule, requiredAction]);

  // ✅ FIXED: Handle case when no business is selected
  if (!currentBusiness) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="card max-w-md mx-auto">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay negocio seleccionado
              </h3>
              <p className="text-gray-600 mb-6">
                Para acceder a esta página necesitas seleccionar un negocio desde el menú superior.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/home')} 
                  className="btn btn-primary flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg font-medium">Verificando permisos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="card max-w-md mx-auto">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600 mb-6">
                No tienes permisos para acceder a esta página. 
                {requiredModule && (
                  <span className="block mt-2 text-sm">
                    Se requiere permiso para <strong>{requiredAction}</strong> en <strong>{requiredModule}</strong>
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/home')} 
                  className="btn btn-primary flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded border">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Contacta al administrador del negocio para solicitar acceso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, renderizar el contenido
  return children;
}

export default PermissionGuard; 





