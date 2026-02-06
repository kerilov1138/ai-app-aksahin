
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyRate } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const fetchHistoricalRates = async (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Promise<MonthlyRate[]> => {
  const prompt = `Provide the average historical monthly exchange rates for the Turkish Lira (TRY) relative to USD, EUR, and Gram Gold (price of 1 gram in TRY). 
  Return data for each month starting from ${startMonth}/${startYear} up to ${endMonth}/${endYear} (inclusive).
  
  Format the output as a JSON array of objects with the following keys:
  - year (number)
  - month (number, 1-12)
  - usd (number, average TRY needed for 1 USD)
  - eur (number, average TRY needed for 1 EUR)
  - gold (number, average TRY needed for 1 gram of gold)

  Ensure the rates are as accurate as possible for the historical period specified.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.NUMBER },
              month: { type: Type.NUMBER },
              usd: { type: Type.NUMBER },
              eur: { type: Type.NUMBER },
              gold: { type: Type.NUMBER },
            },
            required: ["year", "month", "usd", "eur", "gold"],
          },
        },
      },
    });

    const text = response.text || "[]";
    return JSON.parse(text) as MonthlyRate[];
  } catch (error) {
    console.error("Error fetching historical rates:", error);
    // Fallback or rethrow
    throw error;
  }
};
