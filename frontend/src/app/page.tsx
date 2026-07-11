'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { authApi } from '@/lib/api';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import SyncButton from '@/components/dashboard/SyncButton';
import CoPilotPanel from '@/components/ai/CoPilotPanel';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { Activity, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, login, loadFromStorage } = useAuthStore();
  const { summary, holdings, loading, fetchSummary, fetchHoldings } = usePortfolioStore();
  const [loggingIn, setLoggingIn] = useState(false);
  const [copilotAsset, setCopilotAsset] = useState<any>(null);

  // Auto-login with demo credentials on first visit
  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !loggingIn) {
      setLoggingIn(true);
      authApi
        .login('demo@wealthwise.in', 'demo123')
        .then((res) => {
          login(
            {
              userId: res.data.userId,
              email: res.data.email,
              fullName: res.data.fullName,
              riskLevel: res.data.riskLevel,
            },
            res.data.token
          );
        })
        .catch((err) => console.error('Auto-login failed:', err))
        .finally(() => setLoggingIn(false));
    }
  }, [isAuthenticated]);

  // Fetch portfolio data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
      fetchHoldings();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || loading || loggingIn) return <LoadingPage />;

  return (
    <>
      <div className="page-content">
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: -0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Activity size={28} className="gradient-text" style={{ color: '#6366f1' }} />
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Welcome back, {user?.fullName}. Here&apos;s your unified portfolio view.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SyncButton />
          </div>
        </div>

        {summary && (
          <>
            {/* Net Worth Hero Card */}
            <NetWorthCard
              totalNetWorth={summary.totalNetWorth}
              totalInvested={summary.totalInvested}
              totalPnl={summary.totalPnl}
              pnlPercentage={summary.pnlPercentage}
            />

            {/* Charts Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 20,
                marginTop: 20,
              }}
            >
              <AssetAllocationChart
                data={summary.assetAllocation}
                title="Asset Allocation"
              />
              <PerformanceChart data={summary.performanceHistory} />
            </div>

            {/* Broker Split */}
            {summary.brokerSplit?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="card animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} color="#f59e0b" />
                    Broker-wise Split
                  </h3>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {summary.brokerSplit.map((b: any, i: number) => (
                      <div
                        key={i}
                        className="glass-card"
                        style={{
                          padding: '12px 20px',
                          minWidth: 140,
                          flex: 1,
                        }}
                      >
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          {b.label}
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 700 }}>
                          {b.percentage?.toFixed(1)}%
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ₹{(b.value / 100000).toFixed(1)}L
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Holdings Table */}
            <div style={{ marginTop: 20 }}>
              <HoldingsTable
                holdings={summary.topHoldings || holdings}
                onAssetClick={(h) => setCopilotAsset(h)}
              />
            </div>
          </>
        )}
      </div>

      {/* AI Co-Pilot Panel */}
      {copilotAsset && (
        <CoPilotPanel
          asset={copilotAsset}
          onClose={() => setCopilotAsset(null)}
        />
      )}
    </>
  );
}
