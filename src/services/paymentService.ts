import { loadStripe } from "@stripe/stripe-js";
import { UserPlan } from "../types";
import { PLANS } from "../config/planDefinitions";
import { analyticsService } from "./analyticsService";
import { auth } from "./firebaseConfig";

export async function initiateSubscription(plan: UserPlan) {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error("Stripe Key Missing! Check .env.local");
    throw new Error("Stripe Key Missing");
  }

  const planDetails = PLANS[plan];
  if (!planDetails) throw new Error("Invalid plan selected");

  // Log intent
  const user = auth.currentUser;
  analyticsService.logEvent('plan_upgrade_initiated', user?.uid, plan, { price: planDetails.price });

  const stripe = await loadStripe(key) as any;
  if (!stripe) throw new Error("Stripe SDK initialization failed.");

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send priceId instead of raw price/name for security & best practice
      body: JSON.stringify({
        priceId: planDetails.priceId,
        planName: planDetails.name,
        userId: user?.uid
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (err) {
    console.error("Payment initiation failed:", err);
    throw err;
  }
}

export async function createWaitlistCheckout(data: { name: string; email: string; phone: string; company: string; trade: string }) {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("Stripe Key Missing");

  const stripe = await loadStripe(key) as any;
  if (!stripe) throw new Error("Stripe SDK failed.");

  // Check if founder slots are still available
  const { getFounderSlotsRemaining } = await import('../config/planDefinitions');
  const slotsRemaining = await getFounderSlotsRemaining();
  
  if (slotsRemaining <= 0) {
    throw new Error('All 30 Founder slots have been claimed. Please check back for regular pricing.');
  }

  analyticsService.logEvent('waitlist_checkout_initiated', undefined, UserPlan.FOUNDER, {
    email: data.email,
    company: data.company,
    slotsRemaining
  });

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: PLANS[UserPlan.FOUNDER].priceId, // Use dedicated Founder plan
        planName: "Founder",
        customerEmail: data.email,
        metadata: {
          waitlist_name: data.name,
          waitlist_company: data.company,
          waitlist_phone: data.phone,
          waitlist_trade: data.trade,
          is_waitlist_signup: "true"
        }
      }),
    });

    if (!response.ok) throw new Error("Failed to create checkout session");

    const session = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) throw new Error(result.error.message);
  } catch (err) {
    console.error("Waitlist checkout failed:", err);
    throw err;
  }
}

export async function initiateRetainerPayment(amount: number, projectName: string) {
  // ... existing code
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  if (!stripe) throw new Error("Stripe SDK failed.");

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, transactionId: `TXN_${Math.random().toString(36).slice(2, 9).toUpperCase()}` });
    }, 1200);
  });
}
