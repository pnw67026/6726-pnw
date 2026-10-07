export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'promptpay' | 'credit' | 'transfer';

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  userId: string;
  monthYear: string; // YYYY-MM
  totalBudget: number;
  updatedAt?: string;
}

export interface MonthlySummary {
  monthYear: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage 0-100
  expenseCount: number;
  incomeCount: number;
  budgetLimit: number;
  budgetUsedPercent: number;
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  type: TransactionType;
  color: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  // Expense Categories
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'transport', name: 'เดินทาง / ยานพาหนะ', type: 'expense', icon: 'Car', color: '#f97316', bgColor: '#ffedd5' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', type: 'expense', icon: 'ShoppingBag', color: '#eab308', bgColor: '#fef9c3' },
  { id: 'bills', name: 'ที่พัก / ค่าน้ำ-ไฟ / บิล', type: 'expense', icon: 'Home', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'entertainment', name: 'บันเทิง / ท่องเที่ยว', type: 'expense', icon: 'Film', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'health', name: 'สุขภาพ / ยารักษาโรค', type: 'expense', icon: 'HeartPulse', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'education', name: 'การศึกษา / พัฒนาตนเอง', type: 'expense', icon: 'BookOpen', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', bgColor: '#f1f5f9' },

  // Income Categories
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', icon: 'Briefcase', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#14b8a6', bgColor: '#ccfbf1' },
  { id: 'business', name: 'ธุรกิจ / ค้าขาย', type: 'income', icon: 'Store', color: '#059669', bgColor: '#a7f3d0' },
  { id: 'investment', name: 'การลงทุน / ดอกเบี้ย / ปันผล', type: 'income', icon: 'TrendingUp', color: '#22c55e', bgColor: '#dcfce7' },
  { id: 'bonus', name: 'โบนัส / รางวัล', type: 'income', icon: 'Award', color: '#84cc16', bgColor: '#ecfccb' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: '#0284c7', bgColor: '#e0f2fe' },
];

export const PAYMENT_METHODS = [
  { id: 'promptpay', label: 'พร้อมเพย์ / สแกนจ่าย', icon: 'QrCode' },
  { id: 'transfer', label: 'โอนผ่านธนาคาร', icon: 'Building2' },
  { id: 'credit', label: 'บัตรเครดิต / เดบิต', icon: 'CreditCard' },
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
];
