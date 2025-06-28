import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessAPI, authAPI } from '../utils/api';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react';

function PermissionGuard({ children, requiredModule, requiredAction = 'ver' }) {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    checkPermissions();
  }, [businessId, requiredModule, requiredAction]);

  const checkPermissions = async () => {
    try {
      setLoading(true);

      // Cargar datos del usuario actual
      const userData = await authAPI.getCurrentUser();
      setUser(userData);

      // Cargar datos del negocio
      const businessData = await businessAPI.getBusinessById(businessId);
      setBusiness(businessData);

      // Verificar permisos del usuario en este negocio
      const businessUsers = await businessAPI.getBusinessUsers(businessId);
      const currentUserInBusiness = businessUsers.find(u => u.usuario?.email === userData.email);
      
      if (!currentUserInBusiness) {
        setHasAccess(false);
        return;
      }

      // Si es admin, tiene acceso total
      if (currentUserInBusiness.rol === 'admin') {
        setHasAccess(true);
        return;
      }

      // Verificar permiso específico
      const permissionKey = `puede_${requiredAction}_${requiredModule}`;
      const hasPermission = currentUserInBusiness.permisos?.[permissionKey] || false;
      setHasAccess(hasPermission);

    } catch (err) {
      console.error('Error checking permissions:', err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

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
                  onClick={() => navigate(`/business/${businessId}`)} 
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