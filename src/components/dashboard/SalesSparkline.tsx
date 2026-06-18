import React from 'react';
import { TrendPoint } from '../../hooks/useDashboardData';

interface SalesSparklineProps {
  data: TrendPoint[];
}

const SalesSparkline: React.FC<SalesSparklineProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Formatting date for tooltip
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const maxVal = Math.max(...data.map(d => d.amount), 1); // Avoid division by zero
  const minVal = Math.min(...data.map(d => d.amount));

  // Determine trend color
  const firstVal = data[0].amount;
  const lastVal = data[data.length - 1].amount;
  const isUp = lastVal >= firstVal;
  const colorClass = isUp ? 'text-emerald-500' : 'text-rose-500';
  const fillClass = isUp ? 'fill-emerald-100' : 'fill-rose-100';
  const strokeColor = isUp ? '#10b981' : '#f43f5e';

  // Chart dimensions
  const width = 300;
  const height = 100;
  const padding = 10;
  
  const dx = (width - padding * 2) / (data.length - 1 || 1);
  const dy = (height - padding * 2) / (maxVal - minVal || 1);

  const getCoordinates = (index: number, val: number) => {
    const x = padding + index * dx;
    const y = height - padding - (val - minVal) * dy;
    return { x, y };
  };

  let d = '';
  let fillD = '';
  data.forEach((point, i) => {
    const { x, y } = getCoordinates(i, point.amount);
    if (i === 0) {
      d += `M ${x} ${y} `;
      fillD += `M ${x} ${height} L ${x} ${y} `;
    } else {
      // Smooth curve using cubic bezier
      const prev = getCoordinates(i - 1, data[i - 1].amount);
      const cp1x = prev.x + dx / 2;
      const cp1y = prev.y;
      const cp2x = x - dx / 2;
      const cp2y = y;
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
      fillD += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
    }
    
    if (i === data.length - 1) {
      fillD += `L ${x} ${height} Z`;
    }
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">Tendencia a 7 Días</h3>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(lastVal)}</span>
          <span className={`text-sm font-medium mb-1 ${colorClass}`}>
            {isUp ? '↑' : '↓'} {formatCurrency(Math.abs(lastVal - firstVal))}
          </span>
        </div>
      </div>
      
      <div className="mt-4 relative w-full h-24">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Fill Gradient */}
          <defs>
            <linearGradient id={`gradient-${isUp ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillD} fill={`url(#gradient-${isUp ? 'up' : 'down'})`} />
          
          {/* Line */}
          <path d={d} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points (Tooltips can be added here if needed) */}
          {data.map((point, i) => {
            const { x, y } = getCoordinates(i, point.amount);
            // Only show last point explicitly
            if (i === data.length - 1) {
              return (
                <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={strokeColor} strokeWidth="2" />
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};

export default SalesSparkline;
