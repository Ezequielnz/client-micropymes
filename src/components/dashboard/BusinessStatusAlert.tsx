import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface BusinessStatusAlertProps {
  status: 'healthy' | 'attention' | 'critical';
}

const BusinessStatusAlert: React.FC<BusinessStatusAlertProps> = ({ status }) => {
  if (status === 'healthy') {
    return null;
  }

  const statusConfig = {
    healthy: {
      color: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      title: 'Estado del Negocio: Saludable',
      description: 'Todo está funcionando correctamente. No hay alertas críticas.'
    },
    attention: {
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <Info className="w-6 h-6 text-yellow-500" />,
      title: 'Requiere Atención',
      description: 'Hay algunos elementos que requieren tu revisión pronto.'
    },
    critical: {
      color: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      title: 'Acción Crítica Requerida',
      description: 'Problemas importantes detectados que pueden afectar la operación.'
    }
  };

  const config = statusConfig[status] || statusConfig.healthy;

  return (
    <div className={`p-4 border rounded-xl flex items-start gap-4 mb-6 ${config.color} transition-all duration-300 shadow-sm`}>
      <div className="mt-1">
        {config.icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{config.title}</h3>
        <p className="opacity-90 mt-1">{config.description}</p>
      </div>
    </div>
  );
};

export default BusinessStatusAlert;
