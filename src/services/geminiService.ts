import { GoogleGenAI } from "@google/genai";
import { UserInput, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeProductLife = async (userInput: UserInput): Promise<{ productA: Product; productB: Product; winnerId: 'A' | 'B'; matchScore: number; comparisonSummary: string }> => {
  const prompt = `
    You are ElectroMind v5 — a flexible, multi-source intelligence engine for electronics hardware analysis.
    Your task is to analyze and compare TWO products based on the provided data.
    
    PRODUCT A CONTEXT:
    Links: ${userInput.productALinks.join(', ')}
    
    PRODUCT B CONTEXT:
    Links: ${userInput.productBLinks.length > 0 ? userInput.productBLinks.join(', ') : 'None Provided'}
    (Crucial: If Product B links are missing, you MUST identify the most logical direct competitor for Product A based on the user's category ("${userInput.category}") and search target ("${userInput.query}") and analyze it as Product B).

    ANALYSIS PARAMETERS:
    1. HARDWARE EXTRACTION: Identify exact components (CPU, Battery, Display, etc.) for BOTH products. Ensure names are specific and distinguishable.
    2. LIFECYCLE SIMULATION: Predict failure points and estimated lifespan based on durability metrics.
    3. SUSTAINABILITY AUDIT: Calculate Eco Score (0-100) and Carbon Footprint (kg CO2e) for manufacturing, logistics, and usage over its lifespan.
    4. COMPARATIVE VERDICT: Choose the winner (A or B). Provide a detailed markdown-formatted comparison summary (comparisonSummary) specifically comparing performance, durability, eco-friendliness, and value, highlighting why one is better than the other for the user's specific context.
    5. CURRENCY: All financial data must be in ${userInput.currency || 'USD'}.

    REQUIRED JSON OUTPUT: You must return a valid JSON object matching the requested schema.
  `;

  const productSchema = {
    type: "OBJECT",
    properties: {
      name: { type: "STRING" },
      brand: { type: "STRING" },
      description: { type: "STRING" },
      price: { type: "NUMBER" },
      imageUrl: { type: "STRING" },
      specs: { type: "OBJECT" },
      components: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            details: { type: "STRING" },
            tier: { type: "STRING", enum: ["High", "Mid", "Low", "Enterprise"] },
            healthImpact: { type: "STRING", enum: ["Critical", "Moderate", "Low"] }
          },
          required: ["name", "details", "tier", "healthImpact"]
        }
      },
      durabilityScore: { type: "NUMBER" },
      performanceScore: { type: "NUMBER" },
      batteryScore: { type: "NUMBER" },
      brandReliability: { type: "NUMBER" },
      repairabilityScore: { type: "NUMBER" },
      estimatedLifespan: { type: "NUMBER" },
      trueCost: { type: "NUMBER" },
      hiddenWarnings: { type: "ARRAY", items: { type: "STRING" } },
      componentAnalysis: { type: "STRING" },
      failureProbability: { type: "STRING" },
      confidenceScore: { type: "NUMBER" },
      ecoScore: { type: "NUMBER" },
      carbonFootprint: {
        type: "OBJECT",
        properties: {
          manufacturing: { type: "NUMBER" },
          usage: { type: "NUMBER" },
          logistics: { type: "NUMBER" },
          total: { type: "NUMBER" }
        },
        required: ["manufacturing", "usage", "logistics", "total"]
      }
    },
    required: ["name", "brand", "price", "trueCost", "estimatedLifespan", "ecoScore", "carbonFootprint"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          productA: productSchema,
          productB: productSchema,
          winnerId: { type: "STRING", enum: ["A", "B"] },
          matchScore: { type: "NUMBER" },
          comparisonSummary: { type: "STRING" }
        },
        required: ["productA", "productB", "winnerId", "matchScore", "comparisonSummary"]
      }
    }
  });

  const text = response.text;

  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Response Parsing Error:", error, text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
};
