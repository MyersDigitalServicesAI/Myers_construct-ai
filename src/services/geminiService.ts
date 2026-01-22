import { EstimateResult, ProjectData } from "../types";

/**
 * Myers Construct AI Service - Frontend Proxy
 * Calls secure backend edge functions to protect API keys and centralize logic.
 */
export async function generateFullEstimate(
    project: ProjectData,
    attachment?: { data: string; mimeType: string },
    historicalBids?: any[]
): Promise<EstimateResult> {
    try {
        const response = await fetch('/api/generate-estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project, attachment, historicalBids }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Synthesis Node Failure");
        }

        const result = await response.json();
        return result as EstimateResult;
    } catch (error: any) {
        console.error("Myers AI Node Error:", error);
        throw new Error(error.message || "Logic Timeout: The synthesis node failed to synchronize.");
    }
}
