import Stripe from 'stripe';

export const config = {
    runtime: 'nodejs',
};

// Initialize Stripe with strict null checks for key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { planName, userId, priceId, customerEmail, metadata } = body;

        if (!planName && !priceId) {
            return new Response(JSON.stringify({ message: "Missing plan identity" }), { status: 400 });
        }

        const isWaitlist = metadata?.is_waitlist_signup === "true";

        if (!userId && !isWaitlist) {
            return new Response(JSON.stringify({ message: "Missing userId" }), { status: 400 });
        }

        // Server-side pricing source of truth (Prevent Client Manipulation)
        const PRICING_TABLE: Record<string, number> = {
            'Pro': 149,
            'Business': 299,
            'Founder': 250, // Special price for waitlist
            'Pro Team': 449,
            'Enterprise': 1049,
            'Reseller': 549
        };

        const unitAmount = PRICING_TABLE[planName];

        if (!unitAmount && !priceId) {
            return new Response(JSON.stringify({ message: "Invalid plan selected" }), { status: 400 });
        }

        // Use priceId if it looks like a real Stripe ID, otherwise use price_data
        const lineItem = (priceId && priceId.startsWith('price_'))
            ? { price: priceId, quantity: 1 }
            : {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Myers Subscription: ${planName}`,
                    },
                    unit_amount: unitAmount * 100, // Stripe expects cents
                    recurring: { interval: 'month' as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval }
                },
                quantity: 1,
            };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            client_reference_id: userId || `waitlist_${Date.now()}`,
            customer_email: customerEmail,
            metadata: {
                ...metadata,
                planName: planName
            },
            line_items: [lineItem],
            mode: 'subscription',
            automatic_tax: { enabled: true },
            success_url: `${req.headers.get('origin')}/?return_from_checkout=true&session_id={CHECKOUT_SESSION_ID}${isWaitlist ? '&is_waitlist=true' : ''}`,
            cancel_url: `${req.headers.get('origin')}/`,
        });

        return new Response(JSON.stringify({ id: session.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    }
}
