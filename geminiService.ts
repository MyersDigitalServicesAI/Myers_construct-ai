
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { EstimateResult, ProjectData, GroundingSource } from "../types";

const EstimateResultSchema = z.object({
  projectSummary: z.string(),
  paymentTerms: z.string(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    qty: z.number(),
    unit: z.string(),
    rate: z.number(),
    total: z.number(),
    category: z.enum(["Material", "Labor", "Permit", "Sub", "Equipment"]),
    csi_division: z.string(),
    retailerName: z.string(),
    storeLink: z.string(),
    logic: z.string().optional()
  })),
  insights: z.array(z.object({
    type: z.enum(["risk", "market", "compliance"]),
    title: z.string(),
    text: z.string(),
    impact: z.enum(["low", "medium", "high"])
  })),
  marketConfidence: z.number(),
  regionalMultiplier: z.number(),
  suggestedAgenda: z.array(z.string()).optional()
});

const VIRTUAL_FOREMAN_PROMPT = `
You are the "Myers Industrial Foreman" - an elite pre-construction AI.
Your goal is to provide a grounded, high-precision construction estimate.

DIRECTIONS:
1. Map every item to its correct CSI MasterFormat Division (e.g., Div 03 Concrete, Div 06 Wood/Plastics).
2. Use Google Search to find REAL-TIME material pricing for the provided location.
3. Factor in regional multipliers for labor based on the ZIP code.
4. If a blueprint is provided, analyze dimensions and quantities from the image.
5. Identify at least 3 high-impact risks (market volatility, code compliance, or structural constraints).

OUTPUT FORMAT:
Return ONLY raw JSON. No markdown. No backticks.
Interface: EstimateResult (TypeScript compatible).
`;

export async function generateFullEstimate(
  project: ProjectData, 
  blueprintImage?: string 
): Promise<EstimateResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promptParts: any[] = [
    { text: `COMMAND: Generate industrial estimate for ${project.scope} in ${project.location}.\nNARRATIVE: ${project.description}` }
  ];

  if (blueprintImage) {
    promptParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: blueprintImage.split(',')[1] || blueprintImage
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: promptParts },
      config: {
        systemInstruction: VIRTUAL_FOREMAN_PROMPT,
        tools: [{ googleSearch: {} }],
        // Estimating requires deep reasoning for quantity calculations and CSI mapping
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "{}";
    const rawResult = JSON.parse(textOutput);
    const result = EstimateResultSchema.parse(rawResult);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map(chunk => chunk.web ? { title: chunk.web.title || "Market Source", uri: chunk.web.uri } : null)
      .filter((s): s is GroundingSource => s !== null);

    return { ...result, groundingSources: sources };
  } catch (error) {
    console.error("Myers Nexus Critical Error:", error);
    throw new Error("Terminal Logic Timeout: Data grounding node failed to respond.");
  }
}
