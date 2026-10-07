import React, { useState } from 'react';

export interface DailyDataPoint {
  day: number;
  dateStr: string;
  expense: number;
  income: number;
}

interface DailyTrendChartProps {
  data: DailyDataPoint[];
  daysInMonth: number;
  currencySymbol?: string;
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({
  data,
  daysInMonth,
  currencySymbol = '฿',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DailyDataPoint | null>(null);

  const maxExpense = Math.max(...data.map((d) => d.expense), 500);
  const totalExpense = data.reduce((acc, d) => acc + d.expense, 0);
  const avgDaily = daysInMonth > 0 ? totalExpense / daysInMonth : 0;

  // Chart dimensions
  const width = 600;
  const height = 160;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate SVG path points
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.expense / maxExpense) * chartHeight;
    return { x, y, data: d };
  });

  const linePath = points.reduce((acc, p, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">แนวโน้มรายจ่ายรายวัน (Daily Expense)</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
            เฉลี่ย {currencySymbol}{Math.round(avgDaily).toLocaleString('th-TH')}/วัน
          </span>
        </div>
        {hoveredPoint && (
          <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
            วันที่ {hoveredPoint.day}: {currencySymbol}{hoveredPoint.expense.toLocaleString('th-TH')}
            {hoveredPoint.income > 0 && ` (รับ +${currencySymbol}${hoveredPoint.income.toLocaleString('th-TH')})`}
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-50/70 p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Average Line */}
          {avgDaily > 0 && (
            <line
              x1={paddingX}
              y1={height - paddingY - (avgDaily / maxExpense) * chartHeight}
              x2={width - paddingX}
              y2={height - paddingY - (avgDaily / maxExpense) * chartHeight}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Fill Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#expenseAreaGrad)" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive dots */}
          {points.map((p) => {
            const isHovered = hoveredPoint?.day === p.data.day;
            const hasExpense = p.data.expense > 0;
            return (
              <g
                key={p.data.day}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Invisible hit area */}
                <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                {hasExpense && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? '5' : '3'}
                    fill={isHovered ? '#be123c' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis days label */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-3">
          <span>วันที่ 1</span>
          <span>วันที่ 10</span>
          <span>วันที่ 20</span>
          <span>วันที่ {daysInMonth}</span>
        </div>
      </div>
    </div>
  );
};
