
import { SessionData, EstimateResult } from "../types";

const KEYS = {
  SESSION: 'myers_prod_session',
  HISTORY: 'myers_prod_history',
  SETTINGS: 'myers_prod_settings'
};

export const dbService = {
  // Session / Auth Persistence
  saveSession: (session: SessionData) => {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
  },
  
  getSession: (): SessionData | null => {
    const s = localStorage.getItem(KEYS.SESSION);
    return s ? JSON.parse(s) : null;
  },

  clearSession: () => {
    localStorage.removeItem(KEYS.SESSION);
  },

  // Project History Persistence
  saveEstimate: (estimate: any) => {
    const history = dbService.getHistory();
    const updated = [estimate, ...history];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  },

  getHistory: (): any[] => {
    const h = localStorage.getItem(KEYS.HISTORY);
    return h ? JSON.parse(h) : [];
  },

  deleteEstimate: (id: number) => {
    const history = dbService.getHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  }
};
