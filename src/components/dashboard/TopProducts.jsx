import React from 'react';
import { Target, Package } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-5 md:p-6 pb-2 sm:pb-3 md:pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-5 md:p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base md:text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs sm:text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const TopProducts = ({ topItems, selectedPeriod, formatCurrency }) => {
  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'today': return 'día';
      case 'week': return 'semana';
      case 'month': return 'mes';
      default: return 'período';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 md:h-5 md:w-5" />
          Productos Top
        </CardTitle>
        <CardDescription className="max-w-[calc(100vw-100px)]">
          <span className="truncate block">Productos más vendidos este {getPeriodText()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topItems.length > 0 ? (
          topItems.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-500">Vendidos: {item.cantidad_total}</p>
                </div>
              </div>
              <Badge variant="default" className="flex-shrink-0">
                {formatCurrency(item.precio_venta || 0)}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay datos de productos para este período</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts; 