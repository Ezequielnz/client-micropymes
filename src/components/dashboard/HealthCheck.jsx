import React from 'react';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
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

const HealthCheck = ({ 
  healthCheckResult, 
  healthCheckLoading, 
  performHealthCheck, 
  setHealthCheckResult 
}) => {
  return (
    <>
      {/* Botón de diagnóstico */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={performHealthCheck}
          disabled={healthCheckLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {healthCheckLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <Activity className="w-4 h-4" />
          )}
          Diagnóstico
        </Button>
      </div>

      {/* Resultados del Diagnóstico */}
      {healthCheckResult && (
        <div className="mb-8">
          <div className={`rounded-lg p-4 border ${
            healthCheckResult.status === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {healthCheckResult.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <h3 className={`font-semibold ${
                healthCheckResult.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                Diagnóstico de Conectividad
              </h3>
            </div>
            
            {healthCheckResult.status === 'success' ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-600">Ventas:</span>
                    <span className="ml-2 font-medium">{healthCheckResult.ventas_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Productos:</span>
                    <span className="ml-2 font-medium">{healthCheckResult.productos_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo Backend:</span>
                    <span className="ml-2 font-medium">{healthCheckResult.response_time}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo Frontend:</span>
                    <span className="ml-2 font-medium">{healthCheckResult.frontend_time}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="text-red-700">
                  <strong>Error:</strong> {healthCheckResult.error}
                </div>
                <div className="text-gray-600">
                  Tiempo transcurrido: {healthCheckResult.frontend_time}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setHealthCheckResult(null)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthCheck; 