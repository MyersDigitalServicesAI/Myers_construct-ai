import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { EstimateResult, ProjectData, GroundingSource } from "./types";
import { handleError, logError } from "./errorHandler";

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

export async function generateFullEstimate(
  project: ProjectData, 
  blueprintImage?: string 
): Promise<EstimateResult> {
  // CRITICAL SECURITY NOTE:
  // In production, this function MUST move to a secure backend.
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
      const err = new Error("API Key configuration error.");
      logError(err, "GeminiService:Config");
      throw err;
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const promptParts: any[] = [
    { text: `COMMAND: Generate industrial estimate for ${project.scope} in ${project.location}.\nNARRATIVE: ${project.description}` }
  ];

  if (blueprintImage) {
    // Basic compression/validation logic before sending
    // (Real compression should happen in the UI layer before this function receives data)
    promptParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: blueprintImage.split(',')[1] || blueprintImage
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-thinking-exp-01-21', 
      contents: { parts: promptParts },
      config: {
        systemInstruction: `
          You are an expert construction estimator.
          1. Analyze the location (${project.location}) for local labor rates and material costs.
          2. Return ONLY valid JSON matching this schema.
          3. STRICTLY validate math: qty * rate MUST equal total.
          
          SCHEMA:
          {
            projectSummary: string,
            paymentTerms: string,
            items: [{ id: string, name: string, qty: number, unit: string, rate: number, total: number, category: "Material"|"Labor"|"Permit"|"Sub"|"Equipment", csi_division: string, retailerName: string, storeLink: string }],
            insights: [{ type: "risk"|"market"|"compliance", title: string, text: string, impact: "low"|"medium"|"high" }],
            marketConfidence: number,
            regionalMultiplier: number
          }
        `,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "{}";
    let rawResult;
    try {
        rawResult = JSON.parse(textOutput);
    } catch (e) {
        logError(e, "GeminiService:JSONParse");
        throw new Error("AI returned malformed data. Please retry.");
    }
    
    // Validate schema
    const result = EstimateResultSchema.parse(rawResult);

    // Double-check math to prevent hallucination
    const validatedItems = result.items.map(item => ({
        ...item,
        total: item.qty * item.rate
    }));

    // Extract real grounding metadata if available
    let sources: GroundingSource[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            return { title: chunk.web.title, uri: chunk.web.uri };
          }
          return null;
        })
        .filter((s: any): s is GroundingSource => s !== null);
    }

    if (sources.length === 0) {
      sources = [{ title: "AI Market Reasoning (General)", uri: "#" }];
    }

    return { ...result, items: validatedItems, groundingSources: sources };
  } catch (error) {
    logError(error, "GeminiService:Generate");
    // Re-throw a user-friendly error
    throw new Error(handleError(error));
  }
}
