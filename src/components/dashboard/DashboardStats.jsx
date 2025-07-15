import React from 'react';
import { TrendingUp, DollarSign, FileText, Package, Users } from 'lucide-react';

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

const DashboardStats = ({ dashboardStats, products, customers, formatCurrency }) => {
  const statCards = [
    {
      title: 'Ventas del Mes',
      value: formatCurrency(dashboardStats.total_sales || 0),
      description: 'Total acumulado este mes',
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Facturas Emitidas',
      value: '0',
      description: 'Próximamente disponible',
      icon: FileText,
      trend: 'N/A',
      trendUp: false
    },
    {
      title: 'Productos Activos',
      value: products.length.toString(),
      description: 'Productos en catálogo',
      icon: Package,
      trend: `+${products.length}`,
      trendUp: true
    },
    {
      title: 'Clientes Registrados',
      value: customers.length.toString(),
      description: 'Total de clientes',
      icon: Users,
      trend: `+${customers.length}`,
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
                <Badge variant={stat.trendUp ? "default" : "secondary"} className="text-xs">
                  <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendUp ? '' : 'rotate-180'}`} />
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats; 