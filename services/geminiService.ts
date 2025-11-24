import { GoogleGenAI, Type } from "@google/genai";
import { FinancialState, AiAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeFinances = async (data: FinancialState): Promise<AiAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash";
  
  // Flatten data for the model to consume easily
  const incomeTotal = data.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const expenseTotal = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const debtTotal = data.debts.reduce((acc, curr) => acc + curr.balance, 0);

  const prompt = `
    You are a world-class financial advisor for a Filipino client. Your goal is to provide "Best Financial Advice" based on the hierarchy of financial needs: 
    1. Cashflow (Income > Expenses)
    2. Protection (Emergency Fund ~3-6 months expenses)
    3. Debt Management (High interest first)
    4. Wealth Accumulation (Investments).

    Context: Philippines. Currency: PHP (₱).
    Tone: Direct, professional but accessible, ruthless against bad habits. English output.

    Client Data:
    - Monthly Income: ₱${incomeTotal}
    - Monthly Expenses: ₱${expenseTotal}
    - Total Debt: ₱${debtTotal}
    - Current Liquid Savings: ₱${data.savingsBalance}
    - Debt Details: ${JSON.stringify(data.debts.map(d => ({ name: d.name, apr: d.apr, balance: d.balance })))}
    - Recent Expenses: ${JSON.stringify(data.transactions.filter(t => t.type === 'expense').slice(0, 5))}

    Your task:
    1. Calculate a "Financial Health Score" (0-100).
       - < 50: Critical (Negative cashflow or high bad debt).
       - 50-70: Stable but stagnant.
       - > 70: Wealth building mode.
    2. Provide a 1-sentence "Real Talk" summary. Brutally honest observation of their situation.
    3. Provide exactly 3 actionable steps strictly prioritized by the hierarchy of needs.
       - Mention specific PH financial instruments if applicable (e.g., "Move savings to Digital Banks like Seabank/Maya for 4%+ interest", "Enroll in PAG-IBIG MP2", "Use Snowball method for Home Credit").
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          actionItems: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "summary", "actionItems"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(text) as AiAnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("AI response was not valid JSON");
  }
};

export const generateWeeklyArticle = async (topic: string, weekNumber: number): Promise<{ title: string; subtitle: string; content: string }> => {
  if (!apiKey) {
    // Fallback if no API key
    return {
      title: "Weekly Wisdom Unavailable",
      subtitle: "Please configure your API Key.",
      content: "AI service is currently offline."
    };
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Write a short, powerful financial advice article for "Week ${weekNumber}" of the year.
    Target Audience: Filipinos (Gen Z / Millennials).
    Topic: "${topic}".
    Tone: "Zero BS", direct, smart, practical. No fluff.
    Structure:
    - Title: Catchy and relevant.
    - Subtitle: A one-liner hook.
    - Content: HTML format (use <h3>, <p>, <ul>, <li>, <strong>). max 300 words. Focus on specific Philippines context (e.g., mention PH banks, SSS, specific habits).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          content: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  
  return JSON.parse(text);
};