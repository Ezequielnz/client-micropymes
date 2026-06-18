import React from 'react';
import { InventoryHealth } from '../../hooks/useDashboardData';
import { PackageX, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryHealthWidgetProps {
  health: InventoryHealth;
}

const InventoryHealthWidget: React.FC<InventoryHealthWidgetProps> = ({ health }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Top Selling Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-800">Más Vendidos (30 días)</h3>
          </div>
          <Link to="/reports" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            Ver Reportes
          </Link>
        </div>
        <div className="p-0 flex-1">
          {health.top_selling.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {health.top_selling.map((prod, idx) => (
                <li key={prod.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-800 truncate max-w-[180px] sm:max-w-[250px]">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{prod.quantity} u.</p>
                    <p className="text-xs text-gray-500">{formatCurrency(prod.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No hay datos de ventas recientes.
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-rose-50/30">
          <div className="flex items-center gap-2">
            <PackageX className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-gray-800">Stock Crítico</h3>
          </div>
          <Link to="/productos" className="text-sm text-rose-600 font-medium hover:text-rose-800 transition-colors">
            Ir a Inventario
          </Link>
        </div>
        <div className="p-0 flex-1">
          {health.low_stock.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {health.low_stock.map((prod) => (
                <li key={prod.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-[280px]">
                    {prod.name}
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md">
                      Quedan {prod.current_stock}
                    </span>
                    <span className="text-xs text-gray-400">
                      (Min: {prod.min_stock})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 h-full">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <PackageX className="w-6 h-6 text-green-500" />
              </div>
              <p className="font-medium text-gray-700">Inventario Saludable</p>
              <p className="text-sm">No hay productos por debajo del mínimo.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default InventoryHealthWidget;
