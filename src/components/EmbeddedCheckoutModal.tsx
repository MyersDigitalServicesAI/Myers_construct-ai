
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { UserPlan } from '../types';
import { PLANS } from '../config/planDefinitions';
import { auth } from '../services/firebaseConfig';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutProps {
    plan: UserPlan;
    onClose: () => void;
}

export const EmbeddedCheckoutModal: React.FC<CheckoutProps> = ({ plan, onClose }) => {
    const fetchClientSecret = useCallback(() => {
        return fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                planName: PLANS[plan].name,
                userId: auth.currentUser?.uid,
                priceId: PLANS[plan].priceId
            }),
        })
            .then((res) => res.json())
            .then((data) => data.clientSecret);
    }, [plan]);

    const options = { fetchClientSecret };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden relative h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}
                >
                    <div className="h-full overflow-y-auto">
                        <EmbeddedCheckout className="h-full" />
                    </div>
                </EmbeddedCheckoutProvider>
            </div>
        </div>
    );
};
