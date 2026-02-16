
export interface GiftCardLog {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export interface GiftCard {
  id: string;
  cardNumber: string;
  accessCode: string; // Renamed from pin
  originalBalance: number;
  currentBalance: number;
  source: string;
  dateReceived: string;
  dateCompleted?: string;
  logs?: GiftCardLog[];
}

export interface CashEntry {
  id: string;
  description: string;
  amount: number;
  dateAdded: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
}

export type Category = 'Documents' | 'Clothing' | 'Medical/Personal';

export interface PackingItem {
  id: string;
  category: Category;
  name: string;
  quantity: number;
  isPacked: boolean;
}

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
