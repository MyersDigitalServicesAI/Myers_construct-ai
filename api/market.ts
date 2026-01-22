export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }

    try {
        const { material, location } = await req.json();
        const apiKey = process.env.SERPAPI_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                message: "SerpApi configuration missing on server"
            }), { status: 500 });
        }

        const params = new URLSearchParams({
            engine: "google_shopping",
            q: material,
            location: location,
            hl: "en",
            gl: "us",
            api_key: apiKey
        });

        const url = `https://serpapi.com/search.json?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("SerpApi Error:", data);
            return new Response(JSON.stringify({
                message: "SerpApi error",
                details: data.error
            }), { status: response.status });
        }

        const shoppingResults = data.shopping_results;
        if (!shoppingResults || shoppingResults.length === 0) {
            return new Response(JSON.stringify({ result: null }), { status: 200 });
        }

        const bestMatch = shoppingResults[0];
        const result = {
            name: bestMatch.title,
            price: bestMatch.extracted_price,
            retailer: bestMatch.source,
            link: bestMatch.link,
            thumbnail: bestMatch.thumbnail,
            locationGrounding: location
        };

        return new Response(JSON.stringify({ result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Market API Error:", error);
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
}
