import React, { useState } from 'react';

export interface MonthlyHistoryPoint {
  monthYear: string; // e.g. "2026-10"
  label: string; // e.g. "ต.ค. 69" or "Oct"
  income: number;
  expense: number;
  net: number;
}

interface MonthlyBarChartProps {
  data: MonthlyHistoryPoint[];
  selectedMonth: string;
  onSelectMonth?: (monthYear: string) => void;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        ไม่มีข้อมูลประวัติรายเดือน
      </div>
    );
  }

  // Calculate highest value for Y-axis scale
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>รายรับ (Income)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span>รายจ่าย (Expense)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          เปรียบเทียบ 6 เดือนย้อนหลัง
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-56 pt-8 pb-6 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
        {/* Horizontal grid lines */}
        <div className="absolute inset-x-0 top-8 border-b border-dashed border-slate-200 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 pointer-events-none" />

        {data.map((item) => {
          const isSelected = item.monthYear === selectedMonth;
          const isHovered = hoveredMonth === item.monthYear;
          const incomeHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
          const expenseHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;

          return (
            <div
              key={item.monthYear}
              className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative transition-all rounded-lg p-1 ${
                isSelected ? 'bg-emerald-50/60 ring-1 ring-emerald-200' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredMonth(item.monthYear)}
              onMouseLeave={() => setHoveredMonth(null)}
              onClick={() => onSelectMonth?.(item.monthYear)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap flex flex-col gap-0.5">
                  <div className="font-semibold text-slate-200">{item.label}</div>
                  <div className="text-emerald-400">
                    รับ: ฿{item.income.toLocaleString('th-TH')}
                  </div>
                  <div className="text-rose-400">
                    จ่าย: ฿{item.expense.toLocaleString('th-TH')}
                  </div>
                  <div className={`font-medium ${item.net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    สุทธิ: {item.net >= 0 ? '+' : ''}฿{item.net.toLocaleString('th-TH')}
                  </div>
                </div>
              )}

              {/* Bars Pair */}
              <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full max-h-[140px]">
                {/* Income Bar */}
                <div
                  style={{ height: `${Math.max(incomeHeight, item.income > 0 ? 4 : 0)}%` }}
                  className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                />

                {/* Expense Bar */}
                <div
                  style={{ height: `${Math.max(expenseHeight, item.expense > 0 ? 4 : 0)}%` }}
                  className="w-3 sm:w-5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                />
              </div>

              {/* Month Label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-[11px] block transition-colors ${
                    isSelected
                      ? 'font-bold text-emerald-700'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:block">
                  {item.net >= 0 ? `+฿${(item.net / 1000).toFixed(0)}k` : `-฿${Math.abs(item.net / 1000).toFixed(0)}k`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
