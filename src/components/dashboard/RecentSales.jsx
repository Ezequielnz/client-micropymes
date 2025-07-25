import React from 'react';
import { Clock, DollarSign, ShoppingCart } from 'lucide-react';

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

const RecentSales = ({ recentSales, formatCurrency, formatDate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 md:h-5 md:w-5" />
          Ventas Recientes
        </CardTitle>
        <CardDescription>
          Últimas transacciones registradas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSales.length > 0 ? (
          recentSales.map((sale, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    Venta #{sale.id}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {formatDate(sale.fecha_venta)}
                  </p>
                </div>
              </div>
              <Badge variant="success" className="flex-shrink-0">
                {formatCurrency(sale.total)}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay ventas registradas aún</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales; 