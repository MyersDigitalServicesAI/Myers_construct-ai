import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export type AnalyticsEventName =
    | 'user_signup'
    | 'login'
    | 'plan_upgrade_initiated'
    | 'plan_upgrade_success'
    | 'estimate_created'
    | 'proposal_generated'
    | 'contract_generated'
    | 'feature_gate_hit'
    | 'page_view'
    | 'lead_captured'
    | 'lead_qualified_hot'
    | 'appointment_autobooked'
    | 'waitlist_checkout_initiated';

export interface AnalyticsEvent {
    eventName: AnalyticsEventName;
    userId?: string;
    plan?: string;
    properties?: Record<string, any>;
    timestamp: string;
    userAgent: string;
}

const COLLECTIONS = {
    ANALYTICS: 'analytics_events'
};

export const analyticsService = {
    logEvent: async (eventName: AnalyticsEventName, userId?: string, plan?: string, properties: Record<string, any> = {}) => {
        try {
            const event: AnalyticsEvent = {
                eventName,
                userId,
                plan,
                properties,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // Fire and forget - don't block execution for analytics
            addDoc(collection(db, COLLECTIONS.ANALYTICS), event).catch(err => {
                console.warn("Failed to log analytics event:", err);
            });

            // console.log(`[Analytics] ${eventName}`, properties);
        } catch (error) {
            console.warn("Error in analytics service:", error);
        }
    }
};
