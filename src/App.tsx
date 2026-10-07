import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { financeService } from './services/financeService';
import {
  Transaction,
  MonthlySummary,
  CategoryStat,
  DEFAULT_CATEGORIES,
} from './types/finance';
import { Navbar } from './components/Navbar';
import { MonthlySummaryHeader } from './components/MonthlySummaryHeader';
import { BudgetTracker } from './components/BudgetTracker';
import { CategoryPieChart } from './components/charts/CategoryPieChart';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { MonthlyHistoryPoint } from './components/charts/MonthlyBarChart';
import { DailyDataPoint } from './components/charts/DailyTrendChart';
import {
  Plus,
  Loader2,
  Sparkles,
  LogIn,
  ShieldCheck,
  BarChart3,
  Calendar,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

function Dashboard() {
  const { user, loading: authLoading, signInWithGoogle, signInAsGuest } = useAuth();

  // Current selected month: "YYYY-MM"
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'transactions'>('overview');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore subscription
  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    const unsubscribe = financeService.subscribeTransactions(
      user.uid,
      (txs) => {
        setAllTransactions(txs);
        setLoadingTransactions(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        setLoadingTransactions(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Fetch budget for the selected month
  useEffect(() => {
    if (!user) {
      setBudgetLimit(0);
      return;
    }

    financeService.getBudget(user.uid, selectedMonthYear).then((budget) => {
      setBudgetLimit(budget?.totalBudget || 0);
    });
  }, [user, selectedMonthYear]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonthYear.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonthYear(
      `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonthYear.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonthYear(
      `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  // Filter transactions for selected month
  const monthlyTransactions = useMemo(() => {
    return allTransactions.filter((tx) => tx.date.startsWith(selectedMonthYear));
  }, [allTransactions, selectedMonthYear]);

  // Monthly summary stats
  const summary: MonthlySummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount += 1;
      } else {
        totalExpense += tx.amount;
        expenseCount += 1;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;
    const budgetUsedPercent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

    return {
      monthYear: selectedMonthYear,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      incomeCount,
      expenseCount,
      budgetLimit,
      budgetUsedPercent,
    };
  }, [monthlyTransactions, selectedMonthYear, budgetLimit]);

  // Calculate category stats
  const { expenseCategoryStats, incomeCategoryStats } = useMemo(() => {
    const catMapExpense: Record<string, { amount: number; count: number }> = {};
    const catMapIncome: Record<string, { amount: number; count: number }> = {};

    monthlyTransactions.forEach((tx) => {
      const targetMap = tx.type === 'expense' ? catMapExpense : catMapIncome;
      if (!targetMap[tx.category]) {
        targetMap[tx.category] = { amount: 0, count: 0 };
      }
      targetMap[tx.category].amount += tx.amount;
      targetMap[tx.category].count += 1;
    });

    const formatStats = (
      map: Record<string, { amount: number; count: number }>,
      total: number,
      type: 'expense' | 'income'
    ): CategoryStat[] => {
      return Object.entries(map)
        .map(([category, { amount, count }]) => {
          const config = DEFAULT_CATEGORIES.find((c) => c.name === category);
          return {
            category,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            count,
            type,
            color: config?.color || '#94a3b8',
            bgColor: config?.bgColor || '#f1f5f9',
          };
        })
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      expenseCategoryStats: formatStats(catMapExpense, summary.totalExpense, 'expense'),
      incomeCategoryStats: formatStats(catMapIncome, summary.totalIncome, 'income'),
    };
  }, [monthlyTransactions, summary.totalExpense, summary.totalIncome]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    const [y, m] = selectedMonthYear.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [selectedMonthYear]);

  // Daily Spending Trend
  const dailyData: DailyDataPoint[] = useMemo(() => {
    const points: DailyDataPoint[] = [];
    const expenseByDay: Record<number, number> = {};
    const incomeByDay: Record<number, number> = {};

    monthlyTransactions.forEach((tx) => {
      const dayNum = parseInt(tx.date.split('-')[2], 10);
      if (tx.type === 'expense') {
        expenseByDay[dayNum] = (expenseByDay[dayNum] || 0) + tx.amount;
      } else {
        incomeByDay[dayNum] = (incomeByDay[dayNum] || 0) + tx.amount;
      }
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedMonthYear}-${String(d).padStart(2, '0')}`;
      points.push({
        day: d,
        dateStr,
        expense: expenseByDay[d] || 0,
        income: incomeByDay[d] || 0,
      });
    }
    return points;
  }, [monthlyTransactions, daysInMonth, selectedMonthYear]);

  // 6-Month Comparison History
  const monthlyHistory: MonthlyHistoryPoint[] = useMemo(() => {
    const thaiShortMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const [curY, curM] = selectedMonthYear.split('-').map(Number);
    const points: MonthlyHistoryPoint[] = [];

    // Past 5 months + current month = 6 points
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curY, curM - 1 - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${thaiShortMonths[d.getMonth()]} ${(d.getFullYear() + 543) % 100}`;

      const txsInMonth = allTransactions.filter((tx) => tx.date.startsWith(ym));
      const inc = txsInMonth.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txsInMonth.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

      points.push({
        monthYear: ym,
        label,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }
    return points;
  }, [allTransactions, selectedMonthYear]);

  // Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!user) return;
    if (editingTransaction) {
      await financeService.updateTransaction(user.uid, editingTransaction.id, data);
      showToast('อัปเดตรายการเรียบร้อย');
    } else {
      await financeService.addTransaction(user.uid, data);
      showToast('บันทึกรายการเรียบร้อย');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await financeService.deleteTransaction(user.uid, id);
    showToast('ลบรายการเรียบร้อย');
  };

  const handleSaveBudget = async (limit: number) => {
    if (!user) return;
    await financeService.setBudget(user.uid, selectedMonthYear, limit);
    setBudgetLimit(limit);
    showToast('บันทึกงบประมาณเรียบร้อย');
  };

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await financeService.seedSampleData(user.uid);
      showToast('เพิ่มข้อมูลตัวอย่างสำเร็จ!');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการใส่ข้อมูลตัวอย่าง');
    } finally {
      setIsSeeding(false);
    }
  };

  // Month label in Thai for child components
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const [yStr, mStr] = selectedMonthYear.split('-');
  const monthDisplayLabel = `${thaiMonths[parseInt(mStr, 10) - 1]} ${parseInt(yStr, 10) + 543}`;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">กำลังเชื่อมต่อ Firebase...</p>
        </div>
      </div>
    );
  }

  // Not logged in State
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex flex-col justify-between">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => {}}
        />

        <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Database className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Database: pnw26 พร้อมใช้งาน
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ระบบจัดการรายรับ-รายจ่ายส่วนบุคคล
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mt-2">
              บันทึกรายรับรายจ่าย สรุปผลรายเดือน พร้อมกราฟวิเคราะห์ข้อมูล และจัดสรรงบประมาณอย่างเป็นระบบ ข้อมูลถูกจัดเก็บอย่างปลอดภัยบน Cloud Firestore
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <BarChart3 className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-800">สรุปผล & กราฟวิเคราะห์</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  กราฟแท่งเปรียบเทียบรายเดือน Donut chart หมวดหมู่ และแนวโน้มรายวัน
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-800">ระบบรักษาความปลอดภัย</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  แยกข้อมูลส่วนตัวผู้ใช้แต่ละคนอย่างปลอดภัยตามมาตรฐาน Firestore Rules
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Calendar className="w-5 h-5 text-cyan-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-800">จัดการงบประมาณ</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  ตั้งงบรายจ่ายรายเดือน พร้อมระบบแจ้งเตือนเมื่อใช้เงินใกล้เต็มวงเงิน
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={signInWithGoogle}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>

              <button
                onClick={signInAsGuest}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ทดลองใช้งานทันที (Guest)</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-slate-400">
          PNW26 Expense Tracker &bull; Powered by Firebase Cloud Firestore
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Monthly Summary Header */}
        <MonthlySummaryHeader
          currentMonthYear={selectedMonthYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onChangeMonth={setSelectedMonthYear}
          summary={summary}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
          totalTransactionsCount={allTransactions.length}
        />

        {/* Tab 1: Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Row: Budget Tracker & Fast Add Action */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BudgetTracker
                  totalExpense={summary.totalExpense}
                  budgetLimit={budgetLimit}
                  monthLabel={monthDisplayLabel}
                  onSaveBudget={handleSaveBudget}
                />
              </div>

              {/* Fast Add Widget Card */}
              <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    บันทึกรายการด่วน
                  </span>
                  <h3 className="text-lg font-black mt-1">เพิ่มรายรับหรือรายจ่าย</h3>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    บันทึกทุกการใช้จ่ายเพื่อสรุปและคำนวณกราฟแบบเรียลไทม์
                  </p>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกรายการตอนนี้</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Row: Quick Charts Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Donut Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">สัดส่วนรายจ่ายประจำเดือน</h3>
                    <p className="text-xs text-slate-400">หมวดหมู่ค่าใช้จ่ายหลักใน {monthDisplayLabel}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    ดูกราฟทั้งหมด &rarr;
                  </button>
                </div>
                <CategoryPieChart
                  stats={expenseCategoryStats}
                  totalAmount={summary.totalExpense}
                  type="expense"
                />
              </div>

              {/* Quick Transaction List preview */}
              <TransactionList
                transactions={monthlyTransactions}
                onEdit={(tx) => {
                  setEditingTransaction(tx);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onAddNew={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                monthLabel={monthDisplayLabel}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            expenseCategoryStats={expenseCategoryStats}
            incomeCategoryStats={incomeCategoryStats}
            totalExpense={summary.totalExpense}
            totalIncome={summary.totalIncome}
            monthlyHistory={monthlyHistory}
            dailyData={dailyData}
            daysInMonth={daysInMonth}
            selectedMonthYear={selectedMonthYear}
            onSelectMonth={setSelectedMonthYear}
            transactions={monthlyTransactions}
          />
        )}

        {/* Tab 3: Transactions Tab */}
        {activeTab === 'transactions' && (
          <TransactionList
            transactions={monthlyTransactions}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onAddNew={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            monthLabel={monthDisplayLabel}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          title="เพิ่มรายการ"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
