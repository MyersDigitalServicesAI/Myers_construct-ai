import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc,
  deleteDoc,
  getDoc,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { SessionData } from "./types";

const COLLECTIONS = {
  USERS: 'users',
  ESTIMATES: 'estimates',
  OFFLINE_QUEUE: 'offline_queue' // New collection for offline actions
};

// Listen for online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log("Network restored. Syncing Firestore...");
    try {
        await enableNetwork(db);
        // In a real PWA, you might trigger a sync of a local queue here
    } catch (e) {
        console.error("Online sync failed", e);
    }
  });
  
  window.addEventListener('offline', async () => {
    console.log("Network lost. Switching to offline persistence...");
    try {
        await disableNetwork(db);
    } catch (e) {
        console.error("Offline persistence switch failed", e);
    }
  });
}

export const dbService = {
  saveSession: async (session: SessionData) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    // Firestore SDK handles offline queueing automatically for setDoc
    await setDoc(userRef, {
      ...session,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  getSession: async (): Promise<SessionData | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    // getDoc works with offline cache if configured in firebaseConfig
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as SessionData;
      }
    } catch (e) {
        console.warn("Could not fetch session (likely offline & no cache):", e);
    }
    return null;
  },

  clearSession: async () => {
    await auth.signOut();
  },

  saveEstimate: async (estimate: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // addDoc also queues offline writes
    await addDoc(collection(db, COLLECTIONS.ESTIMATES), {
      ...estimate,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
    
    return await dbService.getHistory();
  },

  getHistory: async (): Promise<any[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, COLLECTIONS.ESTIMATES), 
      where("userId", "==", user.uid)
    );
    
    // getDocs uses offline cache seamlessly
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (e) {
        console.warn("History fetch failed (offline/no cache):", e);
        return [];
    }
  },

  deleteEstimate: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.ESTIMATES, id));
    return await dbService.getHistory();
  }
};
