import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  monthLabel: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  monthLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract all categories in current transaction list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesNote = (tx.note || '').toLowerCase().includes(q);
        const matchesPayment = (tx.paymentMethod || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesNote && !matchesPayment) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: groups[date],
      dayIncome: groups[date].filter(x => x.type === 'income').reduce((acc, x) => acc + x.amount, 0),
      dayExpense: groups[date].filter(x => x.type === 'expense').reduce((acc, x) => acc + x.amount, 0),
    }));
  }, [filtered]);

  // Handle CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'ชื่อรายการ', 'จำนวนเงิน(บาท)', 'ช่องทางชำระ', 'บันทึก'];
    const rows = filtered.map((tx) => [
      `"${tx.date}"`,
      `"${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
      `"${tx.category}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.paymentMethod || ''}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${monthLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = async (txId: string) => {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        setDeletingId(txId);
        await onDelete(txId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yesterday = yest.toISOString().split('T')[0];

      if (dateStr === today) return 'วันนี้ (Today)';
      if (dateStr === yesterday) return 'เมื่อวาน (Yesterday)';

      const [y, m, d] = dateStr.split('-');
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const monthName = thaiMonths[parseInt(m, 10) - 1] || m;
      const thaiYear = parseInt(y, 10) + 543;
      return `${parseInt(d, 10)} ${monthName} ${thaiYear}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base">รายการบันทึกทั้งหมด</h3>
          <p className="text-xs text-slate-400">
            พบ {filtered.length} รายการ (จากทั้งหมด {transactions.length} รายการใน {monthLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              title="ส่งออกรายงานเป็นไฟล์ Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 sm:px-5 sm:py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อรายการ, หมวดหมู่, บันทึก..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Filter Type Tabs */}
        <div className="flex bg-white rounded-xl border border-slate-200 p-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Category Filter Dropdown */}
        {availableCategories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่ ({availableCategories.length})</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Transactions Container */}
      <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
        {groupedByDate.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่พบรายการที่ค้นหา</p>
            <p className="text-xs text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;เพิ่มรายการ&quot; เพื่อบันทึกรายรับ-รายจ่าย
            </p>
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div key={group.date} className="bg-white">
              {/* Date Group Header */}
              <div className="sticky top-0 z-10 px-4 sm:px-5 py-2 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateHeader(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      +฿{group.dayIncome.toLocaleString('th-TH')}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 font-semibold">
                      -฿{group.dayExpense.toLocaleString('th-TH')}
                    </span>
                  )}
                </div>
              </div>

              {/* Items in date group */}
              <div className="divide-y divide-slate-50">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="px-4 sm:px-5 py-3 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 group"
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isExpense
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownRight className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800 truncate">
                              {tx.title}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                              {tx.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            {tx.paymentMethod && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {tx.paymentMethod}
                              </span>
                            )}
                            {tx.note && (
                              <span className="truncate max-w-[200px] text-slate-400 italic">
                                &bull; {tx.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm sm:text-base ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}฿{tx.amount.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tx.id)}
                            disabled={deletingId === tx.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
