import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Proprietary RAG Service
 * Fetches historical successful bids to ground AI estimates in user-specific business reality.
 */
export async function getHistoricalContext(userId: string) {
    try {
        const estimatesRef = collection(db, 'estimates');
        const q = query(
            estimatesRef,
            where('userId', '==', userId),
            where('status', '==', 'won'), // Only ground in successful bids
            limit(5)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            name: doc.data().projectSummary,
            status: doc.data().status,
            margins: doc.data().margins || 20, // Default to 20% if not specified
            total: doc.data().grandTotal
        }));
    } catch (error) {
        console.error("RAG Context Error:", error);
        return [];
    }
}
