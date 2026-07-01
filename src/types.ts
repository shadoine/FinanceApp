export type GoalCategory = 'Emergency' | 'Housing' | 'Vehicle' | 'Travel' | 'Retirement' | 'Other';

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: GoalCategory;
  deadline: string; // YYYY-MM-DD
  color: string; // Tailwind color name like 'emerald', 'blue', 'amber', etc.
}

export interface Portfolio {
  cash: number;
  stocks: number;
  crypto: number;
  bonds: number;
  realEstate: number;
  targetAllocation: {
    cash: number;
    stocks: number;
    crypto: number;
    bonds: number;
    realEstate: number;
  };
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601 string
  type: 'contribution' | 'withdrawal' | 'gain' | 'loss';
  amount: number;
  description: string;
  category: string; // Name of the goal, or 'Stocks', 'Crypto', etc.
}

export interface FinancialSettings {
  currency: string; // e.g. '$', '€', '£'
  monthlySavingTarget: number;
  expectedAnnualReturn: number; // e.g. 7 (for 7%)
  assetNames?: {
    cash?: string;
    stocks?: string;
    crypto?: string;
    bonds?: string;
    realEstate?: string;
  };
}

export interface AppState {
  portfolio: Portfolio;
  goals: SavingsGoal[];
  transactions: Transaction[];
  settings: FinancialSettings;
}
