import React from 'react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { useParams } from 'react-router-dom';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource?: string;
  action?: 'view' | 'edit' | 'delete' | 'assign';
  permission?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action = 'view',
  permission,
  fallback = null,
  showFallback = true
}) => {
  const { businessId } = useParams<{ businessId: string }>();
  const {
    canView,
    canEdit,
    canDelete,
    canAssign,
    hasPermission,
    hasFullAccess,
    isLoading,
    error,
    data: permissions
  } = useUserPermissions(businessId);

  // Only show loading if we're actually fetching data and don't have cached permissions
  if (isLoading && !permissions) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 text-sm">Cargando...</span>
      </div>
    );
  }

  // Si hay error y no es 403, mostrar error genérico
  if (error && !error.message.includes('403')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error al verificar permisos
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Ocurrió un error al verificar tus permisos. Por favor, recarga la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso total, mostrar el contenido
  if (hasFullAccess()) {
    return <>{children}</>;
  }

  // Verificar permisos específicos
  let hasRequiredPermission = false;

  if (permission) {
    // Verificar permiso específico por nombre
    hasRequiredPermission = hasPermission(permission as any);
  } else if (resource) {
    // Verificar permiso por recurso y acción
    switch (action) {
      case 'view':
        hasRequiredPermission = canView(resource);
        break;
      case 'edit':
        hasRequiredPermission = canEdit(resource);
        break;
      case 'delete':
        hasRequiredPermission = canDelete(resource);
        break;
      case 'assign':
        hasRequiredPermission = canAssign ? canAssign(resource) : false;
        break;
      default:
        hasRequiredPermission = false;
    }
  } else {
    // Si no se especifica recurso ni permiso, denegar acceso
    hasRequiredPermission = false;
  }

  // Si tiene el permiso requerido, mostrar el contenido
  if (hasRequiredPermission) {
    return <>{children}</>;
  }

  // Si no tiene permisos, mostrar fallback o nada
  if (!showFallback) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Fallback por defecto
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Acceso restringido
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            No tienes permisos para {action === 'view' ? 'ver' : action === 'edit' ? 'editar' : action === 'delete' ? 'eliminar' : 'acceder a'} este contenido.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionGuard; 