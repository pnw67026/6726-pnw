import React, { useState } from 'react';
import { Target, Edit2, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface BudgetTrackerProps {
  totalExpense: number;
  budgetLimit: number;
  monthLabel: string;
  onSaveBudget: (newLimit: number) => Promise<void>;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  totalExpense,
  budgetLimit,
  monthLabel,
  onSaveBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(budgetLimit.toString());
  const [isSaving, setIsSaving] = useState(false);

  const percent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
  const remaining = budgetLimit - totalExpense;

  const handleOpenEdit = () => {
    setInputValue(budgetLimit > 0 ? budgetLimit.toString() : '20000');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      setIsSaving(true);
      try {
        await onSaveBudget(val);
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              งบประมาณประจำเดือน ({monthLabel})
            </h3>
            <p className="text-xs text-slate-400">
              {budgetLimit > 0
                ? `ตั้งไว้ ฿${budgetLimit.toLocaleString('th-TH')}`
                : 'ยังไม่ได้ตั้งเป้างบประมาณ'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          {budgetLimit > 0 ? 'แก้ไขงบ' : 'ตั้งงบประมาณ'}
        </button>
      </div>

      {budgetLimit > 0 ? (
        <div className="space-y-2.5">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent >= 100
                  ? 'bg-rose-500'
                  : percent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>

          {/* Details & Status message */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {percent >= 100 ? (
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <Flame className="w-3.5 h-3.5" /> เกินงบแล้ว ฿{Math.abs(remaining).toLocaleString('th-TH')}
                </span>
              ) : percent >= 80 ? (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> ใกล้ถึงงบ (เหลือ ฿{remaining.toLocaleString('th-TH')})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> ใช้ไปได้ดี (เหลือใช้ได้อีก ฿{remaining.toLocaleString('th-TH')})
                </span>
              )}
            </div>
            <div className="font-semibold text-slate-700">
              {percent.toFixed(1)}% <span className="font-normal text-slate-400">ของงบ</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
          <span>กำหนดขีดจำกัดค่าใช้จ่ายเพื่อช่วยควบคุมวินัยทางการเงิน</span>
          <button
            onClick={handleOpenEdit}
            className="text-emerald-600 font-semibold underline underline-offset-2 ml-2 hover:text-emerald-700 cursor-pointer"
          >
            ตั้งทันที
          </button>
        </div>
      )}

      {/* Modal / Inline edit */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-slate-800 mb-1">
              กำหนดงบประมาณรายจ่าย
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              สำหรับเดือน {monthLabel} (ระบุจำนวนเงินเป็นบาท)
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  จำนวนเงินงบประมาณสูงสุด (฿)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                    placeholder="เช่น 25000"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[15000, 20000, 30000, 50000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setInputValue(preset.toString())}
                      className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-medium cursor-pointer"
                    >
                      +{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/30"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
