import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Transaction, MonthlyBudget, TransactionType } from '../types/finance';

function generateCleanId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const financeService = {
  /**
   * Subscribe to real-time transactions for a user
   */
  subscribeTransactions(
    userId: string,
    onData: (transactions: Transaction[]) => void,
    onError?: (err: Error) => void
  ) {
    const path = `users/${userId}/transactions`;
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const items: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              userId: data.userId,
              title: data.title,
              amount: Number(data.amount) || 0,
              type: data.type as TransactionType,
              category: data.category,
              date: data.date,
              note: data.note || '',
              paymentMethod: data.paymentMethod || 'promptpay',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          onData(items);
        },
        (error) => {
          console.error('Error listening to transactions:', error);
          if (onError) onError(error as Error);
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Add a new transaction
   */
  async addTransaction(
    userId: string,
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ): Promise<Transaction> {
    const txId = generateCleanId();
    const path = `users/${userId}/transactions/${txId}`;
    try {
      const payload: Record<string, unknown> = {
        userId,
        title: data.title.trim().slice(0, 100),
        amount: Math.max(0.01, Number(data.amount)),
        type: data.type,
        category: data.category.slice(0, 50),
        date: data.date,
        createdAt: new Date().toISOString(),
      };

      if (data.note && data.note.trim()) {
        payload.note = data.note.trim().slice(0, 500);
      }
      if (data.paymentMethod) {
        payload.paymentMethod = data.paymentMethod.slice(0, 50);
      }

      await setDoc(doc(db, 'users', userId, 'transactions', txId), payload);

      return {
        id: txId,
        ...payload,
      } as Transaction;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Update existing transaction
   */
  async updateTransaction(
    userId: string,
    txId: string,
    data: Partial<Omit<Transaction, 'id' | 'userId'>>
  ): Promise<void> {
    const path = `users/${userId}/transactions/${txId}`;
    try {
      const payload: Record<string, unknown> = {
        userId,
        updatedAt: new Date().toISOString(),
      };

      if (data.title !== undefined) payload.title = data.title.trim().slice(0, 100);
      if (data.amount !== undefined) payload.amount = Math.max(0.01, Number(data.amount));
      if (data.type !== undefined) payload.type = data.type;
      if (data.category !== undefined) payload.category = data.category.slice(0, 50);
      if (data.date !== undefined) payload.date = data.date;
      if (data.note !== undefined) payload.note = (data.note || '').slice(0, 500);
      if (data.paymentMethod !== undefined) payload.paymentMethod = (data.paymentMethod || '').slice(0, 50);

      await setDoc(doc(db, 'users', userId, 'transactions', txId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string, txId: string): Promise<void> {
    const path = `users/${userId}/transactions/${txId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  /**
   * Get monthly budget limit
   */
  async getBudget(userId: string, monthYear: string): Promise<MonthlyBudget | null> {
    const path = `users/${userId}/budgets/${monthYear}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'budgets', monthYear));
      if (snap.exists()) {
        const d = snap.data();
        return {
          userId,
          monthYear,
          totalBudget: Number(d.totalBudget) || 0,
          updatedAt: d.updatedAt,
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  /**
   * Set monthly budget limit
   */
  async setBudget(userId: string, monthYear: string, totalBudget: number): Promise<void> {
    const path = `users/${userId}/budgets/${monthYear}`;
    try {
      const payload = {
        userId,
        monthYear,
        totalBudget: Math.max(0, Number(totalBudget)),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userId, 'budgets', monthYear), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Seed realistic sample Thai transactions for current and previous month
   */
  async seedSampleData(userId: string): Promise<void> {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');

    const sampleList: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt'>> = [
      // Current Month Incomes
      {
        title: 'เงินเดือนประจำตำแหน่ง',
        amount: 38000,
        type: 'income',
        category: 'เงินเดือน / ค่าจ้าง',
        date: `${curYear}-${curMonth}-01`,
        note: 'โอนเข้าบัญชีกสิกรไทย',
        paymentMethod: 'โอนผ่านธนาคาร',
      },
      {
        title: 'รับงานออกแบบเว็บฟรีแลนซ์',
        amount: 8500,
        type: 'income',
        category: 'งานเสริม / ฟรีแลนซ์',
        date: `${curYear}-${curMonth}-05`,
        note: 'ค่าจ้างออกแบบ Figma หน้า Landing Page',
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'เงินปันผลหุ้น / กองทุนรวม',
        amount: 1450,
        type: 'income',
        category: 'การลงทุน / ดอกเบี้ย / ปันผล',
        date: `${curYear}-${curMonth}-10`,
        note: 'ปันผลรอบไตรมาส',
        paymentMethod: 'โอนผ่านธนาคาร',
      },

      // Current Month Expenses
      {
        title: 'ค่าเช่าห้องคอนโด + ค่าส่วนกลาง',
        amount: 9500,
        type: 'expense',
        category: 'ที่พัก / ค่าน้ำ-ไฟ / บิล',
        date: `${curYear}-${curMonth}-02`,
        note: 'ชำระให้นิติบุคคล',
        paymentMethod: 'โอนผ่านธนาคาร',
      },
      {
        title: 'ค่าน้ำ ค่าไฟ และอินเทอร์เน็ตไฟเบอร์',
        amount: 1850,
        type: 'expense',
        category: 'ที่พัก / ค่าน้ำ-ไฟ / บิล',
        date: `${curYear}-${curMonth}-04`,
        note: 'ค่าไฟ 1,200 + เน็ต 650',
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'ซื้อวัตถุดิบและของสด Tops Supermarket',
        amount: 1420,
        type: 'expense',
        category: 'อาหารและเครื่องดื่ม',
        date: `${curYear}-${curMonth}-03`,
        note: 'หมู ไข่ ผัก นม กาแฟ',
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'เติมเงินบัตรรถไฟฟ้า BTS & MRT',
        amount: 1200,
        type: 'expense',
        category: 'เดินทาง / ยานพาหนะ',
        date: `${curYear}-${curMonth}-03`,
        note: 'เดินทางไปทำงานรายเดือน',
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
      {
        title: 'ทานข้าวกลางวันกับทีมงาน',
        amount: 320,
        type: 'expense',
        category: 'อาหารและเครื่องดื่ม',
        date: `${curYear}-${curMonth}-06`,
        note: 'ร้านส้มตำและไก่ย่าง',
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'กาแฟ Specialty & เบเกอรี่',
        amount: 185,
        type: 'expense',
        category: 'อาหารและเครื่องดื่ม',
        date: `${curYear}-${curMonth}-07`,
        note: 'Dirty Coffee และ Croissant',
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'ซื้อเสื้อผ้า Uniqlo และของใช้ Shopee',
        amount: 2190,
        type: 'expense',
        category: 'ช้อปปิ้ง / ของใช้',
        date: `${curYear}-${curMonth}-08`,
        note: 'เสื้อเชิ้ตทำงานตัวใหม่',
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
      {
        title: 'ซื้อคอร์สเรียนออนไลน์ React 19 & AI',
        amount: 1500,
        type: 'expense',
        category: 'การศึกษา / พัฒนาตนเอง',
        date: `${curYear}-${curMonth}-09`,
        note: 'พัฒนาสกิลเสริม',
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
      {
        title: 'ดูหนัง IMAX + ป๊อปคอร์น',
        amount: 680,
        type: 'expense',
        category: 'บันเทิง / ท่องเที่ยว',
        date: `${curYear}-${curMonth}-11`,
        note: 'วันหยุดสุดสัปดาห์',
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
      {
        title: 'ค่ายาและวิตามินเสริมบำรุงสุขภาพ',
        amount: 890,
        type: 'expense',
        category: 'สุขภาพ / ยารักษาโรค',
        date: `${curYear}-${curMonth}-12`,
        note: 'Vitamin C และ Zinc',
        paymentMethod: 'เงินสด',
      },

      // Previous Month Sample Data for monthly comparison
      {
        title: 'เงินเดือนประจำเดือนก่อนหน้า',
        amount: 38000,
        type: 'income',
        category: 'เงินเดือน / ค่าจ้าง',
        date: `${prevYear}-${prevMonth}-01`,
        paymentMethod: 'โอนผ่านธนาคาร',
      },
      {
        title: 'ค่าเช่าและบิลเดือนก่อน',
        amount: 11200,
        type: 'expense',
        category: 'ที่พัก / ค่าน้ำ-ไฟ / บิล',
        date: `${prevYear}-${prevMonth}-02`,
        paymentMethod: 'โอนผ่านธนาคาร',
      },
      {
        title: 'ค่าอาหารประจำเดือนก่อน',
        amount: 8400,
        type: 'expense',
        category: 'อาหารและเครื่องดื่ม',
        date: `${prevYear}-${prevMonth}-15`,
        paymentMethod: 'พร้อมเพย์ / สแกนจ่าย',
      },
      {
        title: 'ค่าเดินทางเดือนก่อน',
        amount: 2300,
        type: 'expense',
        category: 'เดินทาง / ยานพาหนะ',
        date: `${prevYear}-${prevMonth}-18`,
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
      {
        title: 'ช้อปปิ้งออนไลน์เดือนก่อน',
        amount: 3100,
        type: 'expense',
        category: 'ช้อปปิ้ง / ของใช้',
        date: `${prevYear}-${prevMonth}-20`,
        paymentMethod: 'บัตรเครดิต / เดบิต',
      },
    ];

    for (const item of sampleList) {
      await financeService.addTransaction(userId, item);
    }

    // Set default budget 25,000 for current month
    await financeService.setBudget(userId, `${curYear}-${curMonth}`, 25000);
  },
};
