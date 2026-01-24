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

// Helper to get raw body buffer from request stream (for Vercel/Node)
async function getRawBody(req: any): Promise<Buffer> {
    if (req.rawBody) return req.rawBody; // Some frameworks attach this

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        const metadata = session.metadata;
        const planName = metadata?.planName || session.metadata?.planName;
        const isWaitlist = metadata?.is_waitlist_signup === "true";

        if (isWaitlist) {
            try {
                // Record the paid waitlist entry
                const waitlistRef = admin.firestore().collection('waitlist');
                const query = await waitlistRef.where('email', '==', session.customer_details?.email).get();

                if (!query.empty) {
                    const doc = query.docs[0];
                    await doc.ref.update({
                        status: 'PAID_FOUNDER',
                        stripeSessionId: session.id,
                        stripeCustomerId: session.customer,
                        paidAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // Create new entry if missing
                    await waitlistRef.add({
                        name: metadata?.waitlist_name,
                        company: metadata?.waitlist_company,
                        phone: metadata?.waitlist_phone,
                        trade: metadata?.waitlist_trade,
                        email: session.customer_details?.email,
                        status: 'PAID_FOUNDER',
                        stripeSessionId: session.id,
                        stripeCustomerId: session.customer,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`Founder payment received for ${session.customer_details?.email}`);
            } catch (e) {
                console.error('Waitlist payment record failed:', e);
            }
            return res.status(200).json({ received: true });
        }

        if (uid && planName) {
            try {
                // Update user subscription in Firestore
                await admin.firestore().collection('users').doc(uid).set({
                    plan: planName,
                    subscriptionActive: true,
                    subscriptionStatus: 'active',
                    stripeCustomerId: session.customer,
                    stripeSessionId: session.id,
                    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log(`Subscription activated for user ${uid}: ${planName}`);
            } catch (e) {
                console.error('User subscription update failed:', e);
            }
            return res.status(200).json({ received: true });
        }
    }

    res.status(200).json({ received: true });
}
