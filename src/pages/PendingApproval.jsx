import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, CheckCircle } from 'lucide-react';

function PendingApproval() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="page-container flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cuenta Pendiente de Aprobación
          </h1>
          
          {/* Message */}
          <div className="space-y-4 text-gray-600 mb-8">
            <p>
              Tu solicitud de acceso al negocio ha sido enviada y está pendiente de aprobación por el administrador.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">¿Qué sigue?</p>
                  <p>El administrador del negocio recibirá una notificación y podrá aprobar tu acceso desde su centro de notificaciones.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Email confirmado</p>
                  <p>Tu dirección de email ha sido verificada correctamente.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Verificar Estado
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda? Contacta al administrador del negocio o{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-500">
                envíanos un mensaje
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingApproval; 