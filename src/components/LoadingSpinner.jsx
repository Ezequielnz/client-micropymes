import React from 'react';
import { Loader2, Activity, Zap } from 'lucide-react';

/**
 * Componente de loading reutilizable con paleta de colores ERP profesional
 * Incluye diferentes variantes y tamaños para adaptarse a diferentes contextos
 */
const LoadingSpinner = ({ 
  size = 'default', 
  variant = 'primary', 
  message = 'Cargando...', 
  showMessage = true,
  className = '',
  fullScreen = false,
  icon = 'spinner'
}) => {
  // Configuración de tamaños
  const sizes = {
    sm: {
      spinner: 'h-4 w-4',
      text: 'text-sm',
      container: 'gap-2'
    },
    default: {
      spinner: 'h-8 w-8',
      text: 'text-base',
      container: 'gap-3'
    },
    lg: {
      spinner: 'h-12 w-12',
      text: 'text-lg',
      container: 'gap-4'
    },
    xl: {
      spinner: 'h-16 w-16',
      text: 'text-xl',
      container: 'gap-6'
    }
  };

  // Configuración de variantes de color
  const variants = {
    primary: {
      spinner: 'text-erp-primary',
      text: 'text-erp-neutral-600',
      border: 'border-erp-primary'
    },
    secondary: {
      spinner: 'text-erp-neutral-500',
      text: 'text-erp-neutral-600',
      border: 'border-erp-neutral-300'
    },
    success: {
      spinner: 'text-erp-success',
      text: 'text-erp-neutral-600',
      border: 'border-erp-success'
    },
    warning: {
      spinner: 'text-erp-warning',
      text: 'text-erp-neutral-600',
      border: 'border-erp-warning'
    },
    error: {
      spinner: 'text-erp-error',
      text: 'text-erp-neutral-600',
      border: 'border-erp-error'
    }
  };

  // Configuración de iconos
  const icons = {
    spinner: Loader2,
    activity: Activity,
    zap: Zap
  };

  const IconComponent = icons[icon] || Loader2;
  const sizeConfig = sizes[size] || sizes.default;
  const variantConfig = variants[variant] || variants.primary;

  // Componente de spinner
  const SpinnerContent = () => (
    <div className={`flex flex-col items-center justify-center ${sizeConfig.container} ${className}`}>
      <div className="relative">
        {/* Spinner principal */}
        <IconComponent 
          className={`${sizeConfig.spinner} ${variantConfig.spinner} animate-spin`}
        />
        
        {/* Círculo de fondo decorativo para tamaños grandes */}
        {(size === 'lg' || size === 'xl') && (
          <div 
            className={`absolute inset-0 rounded-full border-2 ${variantConfig.border} opacity-20`}
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        )}
      </div>
      
      {/* Mensaje de carga */}
      {showMessage && (
        <div className="text-center">
          <p className={`${sizeConfig.text} ${variantConfig.text} font-medium`}>
            {message}
          </p>
          
          {/* Puntos animados */}
          <div className="flex justify-center mt-2 space-x-1">
            <div 
              className={`w-1 h-1 ${variantConfig.spinner} rounded-full animate-bounce`}
              style={{ animationDelay: '0ms' }}
            />
            <div 
              className={`w-1 h-1 ${variantConfig.spinner} rounded-full animate-bounce`}
              style={{ animationDelay: '150ms' }}
            />
            <div 
              className={`w-1 h-1 ${variantConfig.spinner} rounded-full animate-bounce`}
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Versión de pantalla completa
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-erp-medium p-8 max-w-sm mx-4">
          <SpinnerContent />
        </div>
      </div>
    );
  }

  // Versión normal
  return <SpinnerContent />;
};

/**
 * Componente de loading para páginas completas
 */
export const PageLoader = ({ 
  message = 'Cargando página...', 
  variant = 'primary',
  showLogo = true 
}) => (
  <div className="min-h-screen bg-erp-neutral-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      {/* Logo de la aplicación */}
      {showLogo && (
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-erp-primary rounded-lg mr-3 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-erp-neutral-900">
            BizFlow Pro
          </h1>
        </div>
      )}
      
      {/* Spinner principal */}
      <LoadingSpinner 
        size="lg" 
        variant={variant} 
        message={message}
        showMessage={true}
      />
      
      {/* Mensaje adicional */}
      <p className="text-sm text-erp-neutral-500 mt-4">
        Preparando tu experiencia...
      </p>
    </div>
  </div>
);

/**
 * Componente de loading para secciones específicas
 */
export const SectionLoader = ({ 
  message = 'Cargando...', 
  variant = 'primary',
  size = 'default',
  className = ''
}) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner 
      size={size} 
      variant={variant} 
      message={message}
      showMessage={true}
    />
  </div>
);

/**
 * Componente de loading para botones
 */
export const ButtonLoader = ({ 
  size = 'sm', 
  variant = 'primary',
  className = '' 
}) => (
  <LoadingSpinner 
    size={size} 
    variant={variant} 
    showMessage={false}
    className={className}
    icon="spinner"
  />
);

/**
 * Componente de loading para cards
 */
export const CardLoader = ({ 
  message = 'Cargando contenido...', 
  variant = 'secondary',
  className = ''
}) => (
  <div className={`bg-white border border-erp-neutral-200 rounded-lg p-8 ${className}`}>
    <LoadingSpinner 
      size="default" 
      variant={variant} 
      message={message}
      showMessage={true}
    />
  </div>
);

export default LoadingSpinner; 