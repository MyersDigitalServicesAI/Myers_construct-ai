import Stripe from 'stripe';
import * as admin from 'firebase-admin';

export const config = {
    runtime: 'nodejs', // Firebase Admin requires Node runtime
};

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        // Vercel/Next/Node specific: Need raw body for signature verification
        // Check framework docs if req.body is already parsed
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        const planName = session.metadata?.planName;

        if (uid && planName) {
            try {
                // Determine limits based on plan name
                const limits: Record<string, number> = {
                    'Pro': 25,
                    'Business': -1,
                    'Pro Team': -1,
                    'Enterprise': -1,
                    'Reseller': -1
                };

                const estimatesLimit = limits[planName] ?? 3;

                await admin.firestore().collection('users').doc(uid).set({
                    subscriptionActive: true,
                    plan: planName,
                    stripeCustomerId: session.customer,
                    usage: {
                        estimatesLimit: estimatesLimit,
                        // Don't reset estimatesThisMonth here, usually keep it for the bill cycle
                    },
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log(`Updated subscription for user ${uid} to ${planName} with limit ${estimatesLimit}`);
            } catch (error) {
                console.error('Firestore update failed:', error);
                return res.status(500).json({ error: 'Database update failed' });
            }
        }
    }

    res.status(200).json({ received: true });
}

// Helper to get raw body buffer from request stream (for Vercel/Node)
async function getRawBody(req: any): Promise<Buffer> {
    if (req.rawBody) return req.rawBody; // Some frameworks attach this

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}
