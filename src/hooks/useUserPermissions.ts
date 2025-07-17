import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useMemo, useCallback } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '');

interface UserPermissions {
  user_id: string;
  business_id: string;
  role: string;
  is_creator: boolean;
  is_admin: boolean;
  has_full_access: boolean;
  permissions: {
    puede_ver_productos: boolean;
    puede_editar_productos: boolean;
    puede_eliminar_productos: boolean;
    puede_ver_clientes: boolean;
    puede_editar_clientes: boolean;
    puede_eliminar_clientes: boolean;
    puede_ver_categorias: boolean;
    puede_editar_categorias: boolean;
    puede_eliminar_categorias: boolean;
    puede_ver_ventas: boolean;
    puede_editar_ventas: boolean;
    puede_ver_stock: boolean;
    puede_editar_stock: boolean;
    puede_ver_facturacion: boolean;
    puede_editar_facturacion: boolean;
    puede_ver_tareas: boolean;
    puede_asignar_tareas: boolean;
    puede_editar_tareas: boolean;
  };
}

const fetchUserPermissions = async (businessId: string, token: string): Promise<UserPermissions> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/businesses/${businessId}/permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching permissions: ${response.status}`);
  }

  return response.json();
};

export const useUserPermissions = (businessId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['userPermissions', businessId, user?.id],
    queryFn: () => fetchUserPermissions(businessId!, user!.access_token),
    enabled: !!(businessId && user?.access_token),
    staleTime: 5 * 60 * 1000, // Reduced from 10 to 5 minutes for faster updates
    gcTime: 15 * 60 * 1000, // Reduced from 30 to 15 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: (failureCount, error: any) => {
      // No reintentar en errores 401 o 403
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    // Add network mode to handle offline scenarios
    networkMode: 'online',
  });

  // Helper functions para verificar permisos
  const helpers = useMemo(() => {
    if (!queryResult.data) {
      return {
        canView: () => false,
        canEdit: () => false,
        canDelete: () => false,
        canAssign: () => false,
        isAdmin: () => false,
        isCreator: () => false,
        hasFullAccess: () => false,
        hasPermission: () => false,
      };
    }

    const permissions = queryResult.data;

    return {
      canView: (resource: string) => {
        if (permissions.has_full_access) return true;
        return permissions.permissions[`puede_ver_${resource}` as keyof typeof permissions.permissions] || false;
      },
      
      canEdit: (resource: string) => {
        if (permissions.has_full_access) return true;
        return permissions.permissions[`puede_editar_${resource}` as keyof typeof permissions.permissions] || false;
      },
      
      canDelete: (resource: string) => {
        if (permissions.has_full_access) return true;
        return permissions.permissions[`puede_eliminar_${resource}` as keyof typeof permissions.permissions] || false;
      },
      
      canAssign: (resource: string) => {
        if (permissions.has_full_access) return true;
        return permissions.permissions[`puede_asignar_${resource}` as keyof typeof permissions.permissions] || false;
      },
      
      isAdmin: () => permissions.is_admin,
      
      isCreator: () => permissions.is_creator,
      
      hasFullAccess: () => permissions.has_full_access,
      
      hasPermission: (permission: keyof UserPermissions['permissions']) => {
        if (permissions.has_full_access) return true;
        return permissions.permissions[permission] || false;
      },
    };
  }, [queryResult.data]);

  // Función para invalidar caché cuando cambia el usuario o negocio
  const invalidatePermissions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
  }, [queryClient]);

  return {
    ...queryResult,
    permissions: queryResult.data,
    ...helpers,
    invalidatePermissions,
  };
};

export default useUserPermissions; 