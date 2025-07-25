import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShoppingCart, Package, Users, Upload } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
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

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

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

const QuickActions = ({ currentBusiness }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
        <CardDescription>
          Accede rápidamente a las funciones más usadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button 
            onClick={() => navigate(`/business/${currentBusiness?.id}/pos`)}
            className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group min-w-0"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <span className="text-xs md:text-sm font-medium text-gray-900 text-center">Nueva Venta</span>
          </button>

          <Button
            onClick={() => navigate(`/business/${currentBusiness?.id}/products-and-services`)}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 min-w-0 flex-col sm:flex-row h-auto sm:h-10 p-3 sm:p-2"
          >
            <Package className="h-4 w-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Ver Productos</span>
          </Button>

          <Button
            onClick={() => navigate(`/business/${currentBusiness?.id}/customers`)}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700 min-w-0 flex-col sm:flex-row h-auto sm:h-10 p-3 sm:p-2"
          >
            <Users className="h-4 w-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Ver Clientes</span>
          </Button>

          <Button
            onClick={() => navigate(`/business/${currentBusiness?.id}/products-and-services`)}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700 min-w-0 flex-col sm:flex-row h-auto sm:h-10 p-3 sm:p-2"
          >
            <Upload className="h-4 w-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Importar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 