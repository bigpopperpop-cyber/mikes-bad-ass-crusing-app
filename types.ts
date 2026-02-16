
export interface GiftCard {
  id: string;
  cardNumber: string;
  pin: string;
  originalBalance: number;
  currentBalance: number;
  source: string;
  dateReceived: string;
  dateCompleted?: string;
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