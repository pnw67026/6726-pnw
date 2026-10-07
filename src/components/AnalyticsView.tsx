import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { CategoryPieChart } from './charts/CategoryPieChart';
import { MonthlyBarChart, MonthlyHistoryPoint } from './charts/MonthlyBarChart';
import { DailyTrendChart, DailyDataPoint } from './charts/DailyTrendChart';
import { CategoryStat, Transaction } from '../types/finance';

interface AnalyticsViewProps {
  expenseCategoryStats: CategoryStat[];
  incomeCategoryStats: CategoryStat[];
  totalExpense: number;
  totalIncome: number;
  monthlyHistory: MonthlyHistoryPoint[];
  dailyData: DailyDataPoint[];
  daysInMonth: number;
  selectedMonthYear: string;
  onSelectMonth?: (m: string) => void;
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenseCategoryStats,
  incomeCategoryStats,
  totalExpense,
  totalIncome,
  monthlyHistory,
  dailyData,
  daysInMonth,
  selectedMonthYear,
  onSelectMonth,
  transactions,
}) => {
  const [categoryTab, setCategoryTab] = useState<'expense' | 'income'>('expense');

  // Compute insights
  const topExpenseCategory = expenseCategoryStats[0];
  const maxExpenseDay = [...dailyData].sort((a, b) => b.expense - a.expense)[0];

  // Payment methods breakdown
  const paymentMethodCounts = transactions.reduce((acc, tx) => {
    const pm = tx.paymentMethod || 'อื่นๆ';
    acc[pm] = (acc[pm] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Smart Financial Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight 1: Top Category */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 flex-shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">หมวดหมู่รายจ่ายสูงสุด</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {topExpenseCategory ? topExpenseCategory.category : '-'}
            </div>
            <div className="text-xs text-rose-600 font-medium mt-0.5">
              {topExpenseCategory
                ? `฿${topExpenseCategory.amount.toLocaleString('th-TH')} (${topExpenseCategory.percentage.toFixed(1)}%)`
                : 'ไม่มีรายการ'}
            </div>
          </div>
        </div>

        {/* Insight 2: Peak Spending Day */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">วันที่ใช้จ่ายมากที่สุด</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {maxExpenseDay && maxExpenseDay.expense > 0 ? `วันที่ ${maxExpenseDay.day} ของเดือน` : '-'}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-0.5">
              {maxExpenseDay && maxExpenseDay.expense > 0
                ? `ยอดจ่าย ฿${maxExpenseDay.expense.toLocaleString('th-TH')}`
                : 'ไม่มีข้อมูล'}
            </div>
          </div>
        </div>

        {/* Insight 3: Financial Health Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">คำแนะนำทางการเงิน</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {totalIncome >= totalExpense ? 'การเงินมีเสถียรภาพ' : 'รายจ่ายสูงกว่ารายรับ'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {totalIncome >= totalExpense
                ? `สามารถนำเงินที่เหลือ ฿${(totalIncome - totalExpense).toLocaleString('th-TH')} ไปลงทุนหรือออมต่อได้`
                : 'ควรปรับลดค่าใช้จ่ายไม่จำเป็นเพื่อรักษาสภาพคล่อง'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Donut Category Chart & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">สัดส่วนตามหมวดหมู่</h3>
              <p className="text-xs text-slate-400">โครงสร้างการใช้จ่ายและแหล่งที่มาของรายรับ</p>
            </div>

            {/* Toggle Expense vs Income */}
            <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCategoryTab('expense')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  categoryTab === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายจ่าย ({expenseCategoryStats.length})
              </button>
              <button
                onClick={() => setCategoryTab('income')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  categoryTab === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายรับ ({incomeCategoryStats.length})
              </button>
            </div>
          </div>

          <CategoryPieChart
            stats={categoryTab === 'expense' ? expenseCategoryStats : incomeCategoryStats}
            totalAmount={categoryTab === 'expense' ? totalExpense : totalIncome}
            type={categoryTab}
          />
        </div>

        {/* Daily Trend Spark Area Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              แนวโน้มการใช้จ่ายตลอดทั้งเดือน
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              แสดงการกระจายตัวของรายจ่ายในแต่ละวันของเดือน
            </p>
            <DailyTrendChart
              data={dailyData}
              daysInMonth={daysInMonth}
            />
          </div>

          {/* Payment Methods Breakdown Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              ช่องทางการชำระเงินที่ใช้บ่อย
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(paymentMethodCounts).map(([method, amount]) => (
                <div key={method} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 block truncate">{method}</span>
                  <span className="text-xs font-bold text-slate-800">
                    ฿{(Number(amount) || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Comparison History Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="mb-2">
          <h3 className="font-bold text-slate-800 text-base">
            เปรียบเทียบรายรับและรายจ่ายรายเดือน
          </h3>
          <p className="text-xs text-slate-400">
            สถิติย้อนหลัง 6 เดือน เพื่อติดตามการเติบโตและพฤติกรรมทางการเงิน (คลิกที่แท่งเพื่อเปลี่ยนเดือนที่เลือก)
          </p>
        </div>

        <MonthlyBarChart
          data={monthlyHistory}
          selectedMonth={selectedMonthYear}
          onSelectMonth={onSelectMonth}
        />
      </div>
    </div>
  );
};
