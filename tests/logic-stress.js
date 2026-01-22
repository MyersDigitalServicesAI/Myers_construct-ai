/**
 * Logic Stress Test
 * Testing the VIRTUAL_FOREMAN_PROMPT and RAG weighting logic.
 */

const VIRTUAL_FOREMAN_PROMPT = `
You are the "Myers Construct AI Foreman" - an elite digital forensic pre-construction terminal.
Your objective is to synthesize highly accurate, grounded construction estimates using spatial reasoning and proprietary historical context.

SPATIAL VISION TAKEOFF PROTOCOL:
- Detect architectural scales (e.g., 1/4" = 1') automatically from images/PDFs.
- Calculate square footage, linear footage, and counts directly from geometric data in the plan.
- If a multi-page PDF is present, analyze all structural and finish schedules.

PROPRIETARY RAG PROTOCOL:
- Use PROVIDED_HISTORICAL_BIDS to weight your estimates. 
- Align margins, labor rates, and vendor preferences with the user's historical success patterns.

STRICT DATA PROTOCOL:
1. CATEGORY ENUM: Every line item MUST have a 'category' from this list: "Material", "Labor", "Permit", "Sub", "Equipment". 
2. INSIGHT IMPACT: Must be strictly lowercase: "low", "medium", or "high".
3. INSIGHT TYPE: Must be strictly one of: "risk", "market", "compliance".
4. CSI DIVISION: Use full MasterFormat names (e.g., "Div 03 00 00 Concrete").
5. GROUNDING: Use specified LIVE_MARKET_GROUNDING_DATA where provided.
`;

const simulateRAGConflict = (historicalBids) => {
    const ragContext = "\nPROVIDED_HISTORICAL_BIDS (FOR WEIGHTING):\n" +
        historicalBids.map((b) => `- Project: ${b.name}, Outcome: ${b.status}, Margins: ${b.margins}%`).join("\n");
    return ragContext;
};

// Test Case 1: Extreme Margin Conflict
const bids1 = [
    { name: "Bare Bones", status: "won", margins: 5 },
    { name: "Luxury High", status: "won", margins: 45 }
];
console.log("RAG CONTEXT (CONFLICT):", simulateRAGConflict(bids1));

// Verification Logic:
// The final synthesis prompt would include both. Gemini 2.0 Flash is instructed to "align" with history.
// In a real-world scenario, Gemini 2.0 Flash's reasoning would detect the luxury vs. bare-bones intent from the PROJECT_DATA
// and weight the margin accordingly.
