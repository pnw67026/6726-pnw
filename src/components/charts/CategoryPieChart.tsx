import React, { useState } from 'react';
import { CategoryStat } from '../../types/finance';

interface CategoryPieChartProps {
  stats: CategoryStat[];
  totalAmount: number;
  type: 'expense' | 'income';
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  stats,
  totalAmount,
  type,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (stats.length === 0 || totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-sm font-medium">ยังไม่มีข้อมูล{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
        <p className="text-xs text-slate-400 mt-1">กดบันทึกรายการเพื่อดูสัดส่วนการเงิน</p>
      </div>
    );
  }

  // Pre-calculate SVG slices
  const radius = 80;
  const strokeWidth = 28;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const slices = stats.map((stat, idx) => {
    const fraction = stat.amount / totalAmount;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...stat,
      strokeDasharray,
      strokeDashoffset,
      index: idx,
    };
  });

  const activeItem = hoveredIndex !== null ? stats[hoveredIndex] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Base circle background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <circle
                key={slice.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Text Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xs text-slate-400 font-medium line-clamp-1">
            {activeItem ? activeItem.category : `รวม${type === 'expense' ? 'รายจ่าย' : 'รายรับ'}`}
          </span>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            ฿{(activeItem ? activeItem.amount : totalAmount).toLocaleString('th-TH', {
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
            {activeItem
              ? `${activeItem.percentage.toFixed(1)}%`
              : `${stats.length} หมวดหมู่`}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-2 max-h-64 overflow-y-auto pr-1">
        {stats.map((stat, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={stat.category}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                isHovered
                  ? 'bg-slate-100/90 shadow-sm'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform"
                  style={{
                    backgroundColor: stat.color,
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
                <span className="font-medium text-slate-700 truncate">
                  {stat.category}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({stat.count} รายการ)
                </span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="font-semibold text-slate-800">
                  ฿{stat.amount.toLocaleString('th-TH')}
                </span>
                <span className="text-slate-400 ml-1.5 font-medium">
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
