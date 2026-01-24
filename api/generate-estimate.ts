import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

export const config = {
    runtime: 'nodejs',
};

const RequestSchema = z.object({
    project: z.object({
        scope: z.string(),
        location: z.string(),
        description: z.string(),
    }),
    attachment: z.object({
        data: z.string(),
        mimeType: z.string()
    }).optional()
});

const VIRTUAL_FOREMAN_PROMPT = `
You are the "Myers Construct AI Foreman" - an elite digital forensic pre-construction terminal.
Your objective is to synthesize highly accurate, grounded construction estimates using spatial reasoning and proprietary historical context.

SPATIAL VISION TAKEOFF PROTOCOL:
- Detect architectural scales (e.g., 1/4" = 1') automatically from images/PDFs.
- Calculate square footage, linear footage, and counts directly from geometric data in the plan.
- If a multi-page PDF is present, analyze all structural and finish schedules.
- EDGE CASE: If the image is low-res, hand-drawn, or has ambiguous scaling, you MUST add a high-impact 'risk' insight explaining the ambiguity and provide a conservative estimate with a 20% contingency.

PROPRIETARY RAG PROTOCOL:
- Use PROVIDED_HISTORICAL_BIDS to weight your estimates. 
- Align margins, labor rates, and vendor preferences with the user's historical success patterns.
- EDGE CASE: If historical bids are contradictory (e.g., conflicting labor rates for similar work), prioritize the MOST RECENT bid and add a 'market' insight flagging the discrepancy.

STRICT DATA PROTOCOL:
1. CATEGORY ENUM: Every line item MUST have a 'category' from this list: "Material", "Labor", "Permit", "Sub", "Equipment". 
2. INSIGHT IMPACT: Must be strictly lowercase: "low", "medium", or "high".
3. INSIGHT TYPE: Must be strictly one of: "risk", "market", "compliance".
4. CSI DIVISION: Use full MasterFormat names (e.g., "Div 03 00 00 Concrete").
5. GROUNDING: Use specified LIVE_MARKET_GROUNDING_DATA where provided.
`;

const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        projectSummary: { type: SchemaType.STRING },
        paymentTerms: { type: SchemaType.STRING },
        items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    name: { type: SchemaType.STRING },
                    qty: { type: SchemaType.NUMBER },
                    unit: { type: SchemaType.STRING },
                    rate: { type: SchemaType.NUMBER },
                    total: { type: SchemaType.NUMBER },
                    category: { type: SchemaType.STRING },
                    csi_division: { type: SchemaType.STRING },
                    retailerName: { type: SchemaType.STRING },
                    storeLink: { type: SchemaType.STRING },
                    logic: { type: SchemaType.STRING }
                },
                required: ["id", "name", "qty", "unit", "rate", "total", "category", "csi_division", "retailerName", "storeLink"]
            }
        },
        insights: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    type: { type: SchemaType.STRING },
                    title: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    impact: { type: SchemaType.STRING }
                },
                required: ["type", "title", "text", "impact"]
            }
        },
        marketConfidence: { type: SchemaType.NUMBER },
        regionalMultiplier: { type: SchemaType.NUMBER },
        suggestedAgenda: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
    },
    required: ["projectSummary", "paymentTerms", "items", "insights", "marketConfidence", "regionalMultiplier"]
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { project, attachment, historicalBids } = body;
        const { project: projectDetail } = RequestSchema.parse({ project });

        const apiKey = process.env.GEMINI_API_KEY;
        const serpApiKey = process.env.SERPAPI_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ message: "API Key missing" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: VIRTUAL_FOREMAN_PROMPT,
        });

        // PASS 1: Material Identification
        const identificationPrompt = `List the 5 most critical construction materials for this specific project: ${projectDetail.scope} in ${projectDetail.location}. Output JSON array of strings only.`;
        const idResult = await model.generateContent(identificationPrompt);
        const materialsToGroundRaw = idResult.response.text().replace(/```json|```/g, "").trim();
        let materialsToGround: string[] = [];
        try {
            materialsToGround = JSON.parse(materialsToGroundRaw);
        } catch (e) {
            console.warn("Material identification failed");
        }

        // PASS 2: Grounding
        let groundingContext = "";
        let sources: any[] = [];
        if (materialsToGround.length > 0 && serpApiKey) {
            const groundedResults = await Promise.all(
                materialsToGround.slice(0, 3).map(async (m) => {
                    const params = new URLSearchParams({
                        engine: "google_shopping",
                        q: m,
                        location: projectDetail.location,
                        api_key: serpApiKey
                    });
                    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
                    const data = await res.json();
                    const match = data.shopping_results?.[0];
                    return match ? { name: match.title, price: match.extracted_price, retailer: match.source, link: match.link } : null;
                })
            );

            const validResults = groundedResults.filter(r => r !== null);
            if (validResults.length > 0) {
                groundingContext = "\nLIVE_MARKET_GROUNDING_DATA:\n" +
                    validResults.map(d => `- ${d?.name}: $${d?.price} at ${d?.retailer} (${d?.link})`).join("\n");
                sources = validResults.map(d => ({ title: `${d?.retailer}: ${d?.name}`, uri: d?.link }));
            }
        }

        // PASS 3: RAG Context
        let ragContext = "";
        if (historicalBids && Array.isArray(historicalBids)) {
            ragContext = "\nPROVIDED_HISTORICAL_BIDS (FOR WEIGHTING):\n" +
                historicalBids.map((b: any) => `- Project: ${b.name}, Outcome: ${b.status}, Margins: ${b.margins}%`).join("\n");
        }

        // FINAL PASS: Synthesis
        const promptParts: any[] = [
            { text: `PROJECT_DATA:\nScope: ${projectDetail.scope}\nLocale: ${projectDetail.location}\nDetails: ${projectDetail.description}\n${groundingContext}\n${ragContext}\n\nACTION: Perform spatial takeoff and synthesize proposal matching schema.` }
        ];

        if (attachment) {
            promptParts.push({
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.data.split(',')[1] || attachment.data
                }
            });
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: promptParts }],
            generationConfig: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: responseSchema as any
            }
        });

        const output = JSON.parse(result.response.text());
        return new Response(JSON.stringify({ ...output, groundingSources: sources }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Estimate API Error:", error);
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
