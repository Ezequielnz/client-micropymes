import React from 'react';
import { AlertItem } from '../../hooks/useDashboardData';
import { Link } from 'react-router-dom';
import { Package, ShieldAlert, CheckSquare, TrendingDown, ChevronRight } from 'lucide-react';

interface AttentionRequiredProps {
  alerts: AlertItem[];
}

const AttentionRequired: React.FC<AttentionRequiredProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'stock': return <Package className="w-5 h-5 text-orange-500" />;
      case 'arca': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'task': return <CheckSquare className="w-5 h-5 text-blue-500" />;
      case 'sales': return <TrendingDown className="w-5 h-5 text-yellow-600" />;
      default: return <ShieldAlert className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'stock': return 'bg-orange-50 hover:bg-orange-100 border-orange-100';
      case 'arca': return 'bg-red-50 hover:bg-red-100 border-red-100';
      case 'task': return 'bg-blue-50 hover:bg-blue-100 border-blue-100';
      case 'sales': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100';
      default: return 'bg-gray-50 hover:bg-gray-100 border-gray-100';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Requiere tu Atención
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => (
          <Link 
            key={alert.id} 
            to={alert.action_url}
            className={`flex items-center justify-between p-4 border rounded-xl transition-colors cursor-pointer ${getBgColor(alert.type)}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {getIcon(alert.type)}
              </div>
              <span className="font-medium text-gray-800">{alert.message}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AttentionRequired;
