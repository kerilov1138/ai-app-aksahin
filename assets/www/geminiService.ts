
import { MonthlyRate } from "./types";
import { getRateForDate } from "./historicalData";

/**
 * Local implementation that doesn't require internet or API keys.
 */
export const fetchHistoricalRates = async (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Promise<MonthlyRate[]> => {
  const results: MonthlyRate[] = [];
  
  let currentYear = startYear;
  let currentMonth = startMonth;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const rate = getRateForDate(currentYear, currentMonth);
    results.push(rate);

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  // Simulate small network delay for UX consistency
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return results;
};
