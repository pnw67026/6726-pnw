import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  Tag,
  Check,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  BookOpen,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Award,
  PlusCircle,
  Building2,
  Banknote,
  QrCode,
} from 'lucide-react';
import { Transaction, TransactionType, DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
}

// Icon mapper helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Utensils': return <Utensils className="w-4 h-4" />;
    case 'Car': return <Car className="w-4 h-4" />;
    case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
    case 'Home': return <Home className="w-4 h-4" />;
    case 'Film': return <Film className="w-4 h-4" />;
    case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
    case 'BookOpen': return <BookOpen className="w-4 h-4" />;
    case 'Briefcase': return <Briefcase className="w-4 h-4" />;
    case 'Laptop': return <Laptop className="w-4 h-4" />;
    case 'Store': return <Store className="w-4 h-4" />;
    case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
    case 'Award': return <Award className="w-4 h-4" />;
    case 'PlusCircle': return <PlusCircle className="w-4 h-4" />;
    default: return <MoreHorizontal className="w-4 h-4" />;
  }
};

const getPaymentIcon = (iconName: string) => {
  switch (iconName) {
    case 'QrCode': return <QrCode className="w-4 h-4" />;
    case 'Building2': return <Building2 className="w-4 h-4" />;
    case 'CreditCard': return <CreditCard className="w-4 h-4" />;
    case 'Banknote': return <Banknote className="w-4 h-4" />;
    default: return <CreditCard className="w-4 h-4" />;
  }
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('พร้อมเพย์ / สแกนจ่าย');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod || 'พร้อมเพย์ / สแกนจ่าย');
      setNote(initialData.note || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory('อาหารและเครื่องดื่ม');
      setDate(today);
      setPaymentMethod('พร้อมเพย์ / สแกนจ่าย');
      setNote('');
    }
    setError(null);
  }, [initialData, isOpen]);

  // Adjust category if type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = DEFAULT_CATEGORIES.filter((c) => c.type === newType);
    if (available.length > 0 && !available.some((c) => c.name === category)) {
      setCategory(available[0].name);
    }
  };

  const handleQuickAddAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + add).toString());
  };

  const handleSetPresetDate = (daysAgo: number) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    setDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!title.trim()) {
      setError('กรุณาระบุชื่อรายการ');
      return;
    }
    if (!category.trim()) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        type,
        amount: parsedAmount,
        title: title.trim().slice(0, 100),
        category: category.slice(0, 50),
        date,
        paymentMethod: paymentMethod.slice(0, 50),
        note: note.trim().slice(0, 500),
      });
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save transaction:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg ${
                type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 font-bold text-xl text-slate-800 placeholder-slate-300"
              />
            </div>
            {/* Quick add increment buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50, 100, 500, 1000].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleQuickAddAmount(inc)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer"
                >
                  +{inc.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-[11px] px-2.5 py-1 text-slate-400 hover:text-rose-600 rounded-lg ml-auto cursor-pointer"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่อรายการ / รายละเอียด *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'expense' ? 'เช่น ค่าอาหารกลางวัน, ค่าน้ำมัน, ช้อปปิ้ง' : 'เช่น เงินเดือน, งานฟรีแลนซ์, ปันผล'}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              หมวดหมู่ ({type === 'expense' ? 'รายจ่าย' : 'รายรับ'}) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className="p-1 rounded-lg flex-shrink-0"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgColor,
                        color: isSelected ? '#ffffff' : cat.color,
                      }}
                    >
                      {getCategoryIcon(cat.icon)}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-xs sm:text-sm text-slate-800"
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(0)}
                  className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(1)}
                  className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                >
                  เมื่อวาน
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-xs sm:text-sm text-slate-800 bg-white cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.label}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม สถานที่ หรือสลิป..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-xs text-slate-800 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                'กำลังบันทึก...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {initialData ? 'อัปเดตข้อมูล' : 'บันทึกรายการ'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
