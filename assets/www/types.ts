
export interface DebtEntry {
  id: string;
  clientName: string;
  startYear: number;
  startMonth: number;
  monthlyAmount: number;
  createdAt: number;
}

export interface MonthlyRate {
  year: number;
  month: number;
  usd: number; // TRY to 1 USD
  eur: number; // TRY to 1 EUR
  gold: number; // TRY to 1 Gram Gold
}

export interface CalculationResult {
  monthLabel: string;
  amountTry: number;
  amountUsd: number;
  amountEur: number;
  amountGold: number;
  usdRate: number;
  eurRate: number;
  goldRate: number;
}

export interface SummaryReport {
  totalMonths: number;
  totalTry: number;
  totalUsd: number;
  totalEur: number;
  totalGold: number;
  results: CalculationResult[];
}
