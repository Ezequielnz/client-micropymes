import React from 'react';
import { TodaySummary } from '../../hooks/useDashboardData';
import { DollarSign, ShoppingBag, TrendingUp, CheckSquare } from 'lucide-react';

interface TodaySummaryCardsProps {
  summary: TodaySummary;
}

const TodaySummaryCards: React.FC<TodaySummaryCardsProps> = ({ summary }) => {
  // Utility for currency formatting
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: 'Ventas de Hoy',
      value: formatCurrency(summary.sales_amount),
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Transacciones',
      value: summary.sales_count.toString(),
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      textColor: 'text-blue-700'
    },
    {
      title: 'Posición de Caja',
      value: formatCurrency(summary.cash_position),
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Tareas Pendientes',
      value: summary.pending_tasks.toString(),
      icon: <CheckSquare className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      textColor: 'text-amber-700'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Resumen de Hoy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border ${card.bg} ${card.border} transition-transform hover:-translate-y-1 hover:shadow-md`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-semibold ${card.textColor}`}>{card.title}</h3>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySummaryCards;
