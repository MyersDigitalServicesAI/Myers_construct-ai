import { UserPlan } from "../types";

export const PLANS: Record<UserPlan, any> = {
    [UserPlan.STARTER]: {
        name: 'Starter',
        price: 0,
        priceId: '', // Free
        features: {
            estimatesPerMonth: 3,
            users: 1,
            storageGB: 0.5,
            canGenerateProposals: false,
            canGenerateContracts: false,
            canUseTeams: false,
            canUseIntegrations: false,
            supportResponseHours: 24,
        }
    },
    [UserPlan.PRO]: {
        name: 'Pro',
        price: 149,
        priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
        features: {
            estimatesPerMonth: 25,
            users: 2,
            storageGB: 10,
            canGenerateProposals: true,
            canGenerateContracts: false, // Basic SOW only (handled in logic)
            canUseTeams: false,
            canUseIntegrations: false, // Limited Zapier
            supportResponseHours: 8,
        }
    },
    [UserPlan.BUSINESS]: {
        name: 'Business',
        price: 299,
        priceId: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || '',
        features: {
            estimatesPerMonth: -1, // Unlimited
            users: 5,
            storageGB: 50,
            canGenerateProposals: true,
            canGenerateContracts: true,
            canUseTeams: false,
            canUseIntegrations: true, // Custom Wholesalers
            supportResponseHours: 4,
        }
    },
    [UserPlan.PRO_TEAM]: {
        name: 'Pro Team',
        price: 449,
        priceId: import.meta.env.VITE_STRIPE_PRICE_PRO_TEAM || '',
        features: {
            estimatesPerMonth: -1,
            users: 10,
            storageGB: 200,
            canGenerateProposals: true,
            canGenerateContracts: true,
            canUseTeams: true, // Dispatch, routing
            canUseIntegrations: true, // Procore, ServiceTitan
            supportResponseHours: 1,
        }
    },
    [UserPlan.ENTERPRISE]: {
        name: 'Enterprise',
        price: 1049,
        priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || '',
        features: {
            estimatesPerMonth: -1,
            users: -1, // Unlimited / Custom
            storageGB: -1,
            canGenerateProposals: true,
            canGenerateContracts: true,
            canUseTeams: true,
            canUseIntegrations: true,
            supportResponseHours: 0, // 24/7
        }
    },
    [UserPlan.RESELLER]: {
        name: 'Reseller',
        price: 549,
        priceId: import.meta.env.VITE_STRIPE_PRICE_RESELLER || '',
        features: {
            estimatesPerMonth: -1,
            users: 5,
            storageGB: 100,
            canGenerateProposals: true,
            canGenerateContracts: true,
            canUseTeams: true,
            canUseIntegrations: true,
            supportResponseHours: 4,
        }
    },
    [UserPlan.FOUNDER]: {
        name: 'Founder',
        price: 250,
        priceId: import.meta.env.VITE_STRIPE_PRICE_FOUNDER || '',
        features: {
            estimatesPerMonth: -1, // Unlimited
            users: 5,
            storageGB: 100,
            canGenerateProposals: true,
            canGenerateContracts: true,
            canUseTeams: true,
            canUseIntegrations: true,
            supportResponseHours: 1, // Priority support
        },
        isLifetime: true, // Special flag for lifetime pricing
        maxSlots: 30 // Limited to 30 spots
    }
};

// Helper to check if Founder slots are still available
export async function getFounderSlotsRemaining(): Promise<number> {
    try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('../services/firebaseConfig');
        
        const waitlistRef = collection(db, 'waitlist');
        const q = query(waitlistRef, where('status', '==', 'PAID_FOUNDER'));
        const snapshot = await getDocs(q);
        
        const taken = snapshot.size;
        const remaining = Math.max(0, 30 - taken);
        return remaining;
    } catch (error) {
        console.error('Error checking founder slots:', error);
        return 30; // Default to showing available if error
    }
}

export function getPlanLimits(plan: UserPlan) {
    return PLANS[plan]?.features || PLANS[UserPlan.STARTER].features;
}

export function canAccessFeature(plan: UserPlan, featureKey: keyof typeof PLANS[UserPlan.STARTER]['features']) {
    const limits = getPlanLimits(plan);
    return limits[featureKey];
}
