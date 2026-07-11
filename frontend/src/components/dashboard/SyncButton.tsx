'use client';

import { RefreshCw } from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export default function SyncButton() {
  const { syncing, triggerSync } = usePortfolioStore();

  return (
    <button
      className="btn-secondary"
      onClick={triggerSync}
      disabled={syncing}
      id="sync-ingestion-btn"
      style={{ opacity: syncing ? 0.6 : 1 }}
    >
      <RefreshCw
        size={16}
        style={{
          animation: syncing ? 'spin 1s linear infinite' : 'none',
        }}
      />
      {syncing ? 'Syncing...' : 'Simulate Ingestion Sync'}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}
