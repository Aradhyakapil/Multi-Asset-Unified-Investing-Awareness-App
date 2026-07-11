import { create } from 'zustand';
import { portfolioApi, ingestionApi } from '@/lib/api';

interface PortfolioState {
  summary: any | null;
  holdings: any[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchHoldings: () => Promise<void>;
  triggerSync: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  summary: null,
  holdings: [],
  loading: false,
  syncing: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const res = await portfolioApi.getSummary();
      set({ summary: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load portfolio', loading: false });
    }
  },

  fetchHoldings: async () => {
    try {
      const res = await portfolioApi.getHoldings();
      set({ holdings: res.data });
    } catch (err: any) {
      console.error('Failed to load holdings:', err);
    }
  },

  triggerSync: async () => {
    set({ syncing: true });
    try {
      await ingestionApi.triggerSync();
      // Wait a bit for async processing, then refresh
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await portfolioApi.getSummary();
      set({ summary: res.data, syncing: false });
    } catch (err: any) {
      set({ syncing: false });
      console.error('Sync failed:', err);
    }
  },
}));
