
import { MonthlyRate } from "./types";

export const HISTORICAL_RATES: MonthlyRate[] = [
  // 2026 (Görsellerden eklenen veriler)
  { year: 2026, month: 2, usd: 43.3990, eur: 51.4495, gold: 4450.00 },
  { year: 2026, month: 1, usd: 43.0925, eur: 50.5169, gold: 4310.00 },
  // 2025 (Görsellerden eklenen veriler)
  { year: 2025, month: 12, usd: 42.5841, eur: 49.8603, gold: 4250.00 },
  { year: 2025, month: 11, usd: 42.1690, eur: 48.7474, gold: 4120.00 },
  { year: 2025, month: 10, usd: 41.7263, eur: 48.6032, gold: 4050.00 },
  { year: 2025, month: 9,  usd: 41.2246, eur: 48.3380, gold: 3920.00 },
  { year: 2025, month: 8,  usd: 40.7256, eur: 47.3025, gold: 3850.00 },
  { year: 2025, month: 7,  usd: 40.0984, eur: 46.9142, gold: 3720.00 },
  { year: 2025, month: 6,  usd: 39.3271, eur: 45.2272, gold: 3650.00 },
  { year: 2025, month: 5,  usd: 38.6594, eur: 43.6294, gold: 3600.00 },
  { year: 2025, month: 4,  usd: 38.0113, eur: 42.6732, gold: 3520.00 },
  { year: 2025, month: 3,  usd: 36.9959, eur: 39.8499, gold: 3450.00 },
  { year: 2025, month: 2,  usd: 36.0729, eur: 37.5777, gold: 3380.00 },
  { year: 2025, month: 1,  usd: 35.4370, eur: 36.6893, gold: 3250.00 },
  // 2024
  { year: 2024, month: 12, usd: 34.80, eur: 37.90, gold: 2950.00 },
  { year: 2024, month: 11, usd: 34.40, eur: 37.10, gold: 2880.00 },
  { year: 2024, month: 10, usd: 34.15, eur: 37.20, gold: 2910.00 },
  { year: 2024, month: 9, usd: 33.90, eur: 37.80, gold: 2820.00 },
  { year: 2024, month: 8, usd: 33.60, eur: 37.10, gold: 2750.00 },
  { year: 2024, month: 7, usd: 32.90, eur: 35.80, gold: 2600.00 },
  { year: 2024, month: 6, usd: 32.50, eur: 35.10, gold: 2520.00 },
  { year: 2024, month: 5, usd: 32.20, eur: 34.80, gold: 2450.00 },
  { year: 2024, month: 4, usd: 32.10, eur: 34.50, gold: 2380.00 },
  { year: 2024, month: 3, usd: 31.90, eur: 34.60, gold: 2250.00 },
  { year: 2024, month: 2, usd: 30.70, eur: 33.20, gold: 2050.00 },
  { year: 2024, month: 1, usd: 30.10, eur: 32.80, gold: 1980.00 },
  // 2023
  { year: 2023, month: 12, usd: 29.10, eur: 31.80, gold: 1900.00 },
  { year: 2023, month: 6, usd: 23.60, eur: 25.50, gold: 1480.00 },
  { year: 2023, month: 1, usd: 18.70, eur: 20.20, gold: 1160.00 },
  // 2022
  { year: 2022, month: 12, usd: 18.60, eur: 19.70, gold: 1080.00 },
  { year: 2022, month: 6, usd: 17.10, eur: 18.00, gold: 1010.00 },
  { year: 2022, month: 1, usd: 13.50, eur: 15.30, gold: 790.00 },
  // 2021
  { year: 2021, month: 12, usd: 13.50, eur: 15.20, gold: 780.00 },
  { year: 2021, month: 1, usd: 7.40, eur: 9.00, gold: 440.00 },
  // 2015
  { year: 2015, month: 12, usd: 2.90, eur: 3.20, gold: 100.00 },
  { year: 2010, month: 12, usd: 1.50, eur: 2.00, gold: 65.00 },
  { year: 2005, month: 12, usd: 1.34, eur: 1.60, gold: 22.00 },
];

export const getRateForDate = (year: number, month: number): MonthlyRate => {
  const match = HISTORICAL_RATES.find(r => r.year === year && r.month === month);
  if (match) return match;

  const sorted = [...HISTORICAL_RATES].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
  const targetVal = year * 12 + month;
  
  let closest = sorted[0];
  for (const r of sorted) {
    if ((r.year * 12 + r.month) <= targetVal) {
      closest = r;
    } else {
      break;
    }
  }
  return { ...closest, year, month };
};
