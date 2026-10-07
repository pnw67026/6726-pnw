import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Sparkles,
  Database,
  Calendar,
} from 'lucide-react';
import { MonthlySummary } from '../types/finance';

interface MonthlySummaryHeaderProps {
  currentMonthYear: string; // "YYYY-MM"
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onChangeMonth: (monthYear: string) => void;
  summary: MonthlySummary;
  onSeedData: () => Promise<void>;
  isSeeding: boolean;
  totalTransactionsCount: number;
}

export const MonthlySummaryHeader: React.FC<MonthlySummaryHeaderProps> = ({
  currentMonthYear,
  onPrevMonth,
  onNextMonth,
  onChangeMonth,
  summary,
  onSeedData,
  isSeeding,
  totalTransactionsCount,
}) => {
  const [yearStr, monthStr] = currentMonthYear.split('-');
  const yearNum = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const monthLabel = `${thaiMonths[monthNum - 1]} ${yearNum + 543}`;

  return (
    <div className="space-y-4">
      {/* Month Selector Bar & App Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Title & Firebase connection tag */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              จัดการรายรับ-รายจ่าย
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase: pnw26
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            บันทึก สรุปผลรายเดือน และวิเคราะห์พฤติกรรมการใช้จ่าย
          </p>
        </div>

        {/* Month Navigation & Action */}
        <div className="flex flex-wrap items-center gap-2">
          {totalTransactionsCount === 0 && (
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="ใส่ข้อมูลตัวอย่างเพื่อดูการแสดงผลและกราฟวิเคราะห์ทันที"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSeeding ? 'กำลังใส่ข้อมูล...' : 'ใส่ข้อมูลตัวอย่าง'}</span>
            </button>
          )}

          {/* Month Navigator Controls */}
          <div className="flex items-center bg-slate-100/90 rounded-xl p-1 text-slate-700">
            <button
              onClick={onPrevMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 select-none">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{monthLabel}</span>
            </div>

            <button
              onClick={onNextMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary 4-Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Income */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รายรับรวม</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight">
              ฿{summary.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.incomeCount} รายการในเดือนนี้
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-2xl" />
        </div>

        {/* Card 2: Total Expense */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รายจ่ายรวม</span>
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-rose-600 tracking-tight">
              ฿{summary.totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.expenseCount} รายการในเดือนนี้
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-b-2xl" />
        </div>

        {/* Card 3: Net Balance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">คงเหลือสุทธิ</span>
            <div className={`p-2 rounded-xl ${
              summary.netBalance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-500'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-2xl font-black tracking-tight ${
              summary.netBalance >= 0 ? 'text-slate-800' : 'text-rose-600'
            }`}>
              {summary.netBalance >= 0 ? '' : '-'}฿{Math.abs(summary.netBalance).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.netBalance >= 0 ? 'มีสภาพคล่องเป็นบวก' : 'รายจ่ายเกินรายรับ'}
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
            summary.netBalance >= 0 ? 'bg-sky-500' : 'bg-rose-500'
          }`} />
        </div>

        {/* Card 4: Savings Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อัตราการออม</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-black text-amber-600 tracking-tight">
              {summary.savingsRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.savingsRate >= 20
                ? 'ยอดเยี่ยมตามเป้าหมาย (≥20%)'
                : summary.savingsRate > 0
                ? 'ยังสามารถประหยัดได้เพิ่ม'
                : 'ไม่มีเงินออมในเดือนนี้'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-b-2xl" />
        </div>
      </div>
    </div>
  );
};
