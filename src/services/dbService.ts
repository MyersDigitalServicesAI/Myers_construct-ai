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
  disableNetwork,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { SessionData, AgentConfiguration, CalendarConfig, Lead, LeadStatus, CalendarEvent, UserPlan } from "../types";
import { analyticsService } from "./analyticsService";

const COLLECTIONS = {
  USERS: 'users',
  ESTIMATES: 'estimates',
  OFFLINE_QUEUE: 'offline_queue',
  AGENT_CONFIGS: 'agent_configs',
  CALENDAR_CONFIGS: 'calendar_configs',
  LEADS: 'leads',
  APPOINTMENTS: 'appointments',
  WAITLIST: 'waitlist'
};

// Listen for online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    // console.log("Network restored. Syncing Firestore...");
    try {
      await enableNetwork(db);
      // In a real PWA, you might trigger a sync of a local queue here
    } catch (e) {
      console.error("Online sync failed", e);
    }
  });

  window.addEventListener('offline', async () => {
    // console.log("Network lost. Switching to offline persistence...");
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

    // 1. Check Limits
    const session = await dbService.getSession();
    if (session?.usage) {
      const { estimatesThisMonth, estimatesLimit } = session.usage;
      // -1 means unlimited
      if (estimatesLimit !== -1 && estimatesThisMonth >= estimatesLimit) {
        analyticsService.logEvent('feature_gate_hit', user.uid, session.plan, { feature: 'estimate_limit', limit: estimatesLimit });
        throw new Error(`Plan limit reached: You can only create ${estimatesLimit} estimates per month. Upgrade to create more.`);
      }
    }

    // 2. Create Estimate
    const docRef = await addDoc(collection(db, COLLECTIONS.ESTIMATES), {
      ...estimate,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });

    // 3. Increment Usage & Log Analytics
    if (session) {
      const newUsage = {
        ...session.usage,
        estimatesThisMonth: (session.usage.estimatesThisMonth || 0) + 1
      };
      // Optimistically update local session object if needed, but definitely update DB
      await dbService.saveSession({ ...session, usage: newUsage });
    }

    analyticsService.logEvent('estimate_created', user.uid, session?.plan, { estimateId: docRef.id });

    return await dbService.getHistory();
  },


  getHistory: async (lastDoc: any = null): Promise<{ items: any[], lastDoc: any }> => {
    const user = auth.currentUser;
    if (!user) return { items: [], lastDoc: null };

    let q = query(
      collection(db, COLLECTIONS.ESTIMATES),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // getDocs uses offline cache seamlessly
    try {
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      return { items, lastDoc: newLastDoc };
    } catch (e) {
      console.warn("History fetch failed (offline/no cache):", e);
      return { items: [], lastDoc: null };
    }
  },

  deleteEstimate: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.ESTIMATES, id));
    return await dbService.getHistory();
  },

  searchLeads: async (queryStr: string) => {
    // TODO: Implement full text search or simple filter
    return [];
  },

  // Leads & Logic Layer
  saveLead: async (lead: Lead) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Ensure ID exists
    const leadId = lead.id || doc(collection(db, COLLECTIONS.LEADS)).id;

    await setDoc(doc(db, COLLECTIONS.LEADS, leadId), {
      ...lead,
      id: leadId,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const session = await dbService.getSession();
    analyticsService.logEvent('lead_captured', user.uid, session?.plan, { leadId, source: 'manual' });
  },



  getLeads: async (): Promise<Lead[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(db, COLLECTIONS.LEADS),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Lead);
    } catch (e) {
      console.warn("Leads fetch error:", e);
      return [];
    }
  },

  updateLead: async (lead: Lead) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await dbService.saveLead(lead);

    if (lead.status === LeadStatus.HOT) {
      analyticsService.logEvent('lead_qualified_hot', user.uid, undefined, { leadId: lead.id, score: lead.score });
    }

    // --- AUTOMATION TRIGGERS ---
    if (lead.status === LeadStatus.HOT) {
      const calendarConfig = await dbService.getCalendarConfig();

      if (calendarConfig && calendarConfig.autoBookHotLeads) {
        // Check if appointment already exists for this lead
        const existingApps = await dbService.getAppointmentsForLead(lead.id);
        if (existingApps.length === 0) {
          // Book for "Tomorrow at 10 AM" (Stub logic for MVP)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);

          const end = new Date(tomorrow);
          end.setHours(11, 0, 0, 0);

          const newEvent: CalendarEvent = {
            id: doc(collection(db, COLLECTIONS.APPOINTMENTS)).id,
            title: `Walkthrough - ${lead.summary || 'New Lead'}`,
            start: tomorrow.toISOString(),
            end: end.toISOString(),
            attendees: [user.email || 'contractor@example.com'],
            type: 'walkthrough',
            leadId: lead.id
          };

          await dbService.createAppointment(newEvent);
          analyticsService.logEvent('appointment_autobooked', user.uid, undefined, { leadId: lead.id, time: tomorrow.toISOString() });
          // console.log("Auto-booked appointment for Hot Lead:", lead.id);

          // Trigger SMS Alert
          await dbService.triggerSmsAlert(lead);
        }
      }
    }
  },

  triggerSmsAlert: async (lead: Lead) => {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: import.meta.env.VITE_ADMIN_PHONE || '+15125550198',
          message: `🔥 HOT LEAD ALERT: ${lead.summary}\nPhone: ${lead.phone}\nScore: ${lead.score}%`
        })
      });

      if (!response.ok) throw new Error("SMS send failed");
      // console.log("SMS Alert sent for lead:", lead.id);
    } catch (e) {
      console.warn("SMS Alert failed:", e);
    }
  },

  // Appointments
  createAppointment: async (event: CalendarEvent) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, event.id), {
      ...event,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  },

  getAppointments: async (): Promise<CalendarEvent[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", user.uid),
      orderBy("start", "asc")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as CalendarEvent);
  },

  getAppointmentsForLead: async (leadId: string): Promise<CalendarEvent[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("userId", "==", user.uid),
      where("leadId", "==", leadId)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as CalendarEvent);
  },

  // Agent Configuration
  saveAgentConfig: async (config: AgentConfiguration) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Use user.uid as doc ID for 1:1 mapping
    await setDoc(doc(db, COLLECTIONS.AGENT_CONFIGS, user.uid), {
      ...config,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  getAgentConfig: async (): Promise<AgentConfiguration | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const snap = await getDoc(doc(db, COLLECTIONS.AGENT_CONFIGS, user.uid));
      if (snap.exists()) {
        return snap.data() as AgentConfiguration;
      }
    } catch (e) {
      console.warn("Agent config fetch failed:", e);
    }
    return null;
  },

  // Calendar Configuration
  saveCalendarConfig: async (config: CalendarConfig) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await setDoc(doc(db, COLLECTIONS.CALENDAR_CONFIGS, user.uid), {
      ...config,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  getCalendarConfig: async (): Promise<CalendarConfig | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const snap = await getDoc(doc(db, COLLECTIONS.CALENDAR_CONFIGS, user.uid));
      if (snap.exists()) {
        return snap.data() as CalendarConfig;
      }
    } catch (e) {
      console.warn("Calendar config fetch failed:", e);
    }
    return null;
  },

  // Waitlist Logic
  submitWaitlist: async (data: { name: string; email: string; phone: string; trade: string }) => {
    try {
      await addDoc(collection(db, COLLECTIONS.WAITLIST), {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'pending' // pending, invited, onboarded
      });
      // console.log("Waitlist entry saved:", data.email);
      return { success: true };
    } catch (e: any) {
      console.error("Waitlist save failed:", e);
      throw new Error("Could not join waitlist. Try again.");
    }
  },

  getWaitlist: async () => {
    try {
      const q = query(
        collection(db, COLLECTIONS.WAITLIST),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Waitlist fetch failed:", e);
      return [];
    }
  }
};
