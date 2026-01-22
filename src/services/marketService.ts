
export interface MarketPriceResult {
    name: string;
    price: number;
    retailer: string;
    link: string;
    thumbnail: string;
    locationGrounding: string;
}

export const marketService = {
    /**
     * Fetches real-time shopping results via secure backend proxy.
     */
    fetchMaterialPrice: async (material: string, location: string): Promise<MarketPriceResult | null> => {
        try {
            const response = await fetch('/api/market', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ material, location })
            });

            if (!response.ok) throw new Error("Market API failure");

            const data = await response.json();
            return data.result;
        } catch (e) {
            console.error("Market lookup failed for:", material, e);
            return null;
        }
    },

    /**
     * Batch fetch prices for multiple items.
     */
    groundEstimates: async (items: { name: string }[], location: string) => {
        const itemsToGround = items.slice(0, 3);
        const groundedResults = await Promise.all(
            itemsToGround.map(item => marketService.fetchMaterialPrice(item.name, location))
        );
        return groundedResults.filter(r => r !== null) as MarketPriceResult[];
    }
};
