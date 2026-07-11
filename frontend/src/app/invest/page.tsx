'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import AssetCard from '@/components/discover/AssetCard';
import CoPilotPanel from '@/components/ai/CoPilotPanel';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import {
  TrendingUp,
  Building2,
  Zap,
  FileText,
  Landmark,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = [
  {
    label: 'REITs',
    value: 'REIT',
    icon: Building2,
    color: '#06d6a0',
    description: 'Earn rental income from Grade A office spaces — no property ownership needed.',
    highlight: '6–8% yield',
  },
  {
    label: 'InvITs',
    value: 'INVIT',
    icon: Zap,
    color: '#f59e0b',
    description: 'Invest in highways, power grids, and telecom towers — stable infrastructure cash flows.',
    highlight: '8–12% yield',
  },
  {
    label: 'Corporate Bonds',
    value: 'CORPORATE_BOND',
    icon: FileText,
    color: '#3b82f6',
    description: 'Fixed-income bonds from AAA/AA rated corporates — higher yield than FDs.',
    highlight: '8–10% coupon',
  },
  {
    label: 'Govt Bonds',
    value: 'GOVERNMENT_BOND',
    icon: Landmark,
    color: '#ec4899',
    description: 'Sovereign guaranteed bonds — zero credit risk with predictable returns.',
    highlight: '7–7.5% yield',
  },
];

export default function InvestPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { summary } = usePortfolioStore();

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('REIT');
  const [copilotAsset, setCopilotAsset] = useState<any>(null);

  useEffect(() => {
    fetchByType(activeType);
  }, [activeType]);

  const fetchByType = async (type: string) => {
    setLoading(true);
    try {
      const res = await assetApi.discover({ assetType: type });
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Available capital: a rough estimate based on portfolio
  const availableCapital = summary?.totalNetWorth ? summary.totalNetWorth * 0.15 : null;

  return (
    <>
      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <TrendingUp size={28} style={{ color: '#6366f1' }} />
            Invest in Alternate Assets
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Diversify beyond equities — explore REITs, InvITs, and bonds tailored to your risk profile.
          </p>
        </div>

        {/* Investment Tip Banner */}
        {availableCapital && (
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: '16px 20px',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.06) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.2)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IndianRupee size={20} color="#818cf8" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                Suggested allocation for diversification
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Based on your portfolio, consider allocating up to{' '}
                <span style={{ color: '#818cf8', fontWeight: 700 }}>
                  {formatCurrency(availableCapital)}
                </span>{' '}
                (15%) into alternate assets for better risk-adjusted returns.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => router.push('/discover')}
              style={{ flexShrink: 0, fontSize: 12, padding: '8px 16px' }}
            >
              Explore All
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Category Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeType === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveType(cat.value)}
                id={`invest-category-${cat.value.toLowerCase()}`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${cat.color}20 0%, ${cat.color}08 100%)`
                    : 'var(--bg-card)',
                  border: `1.5px solid ${isActive ? cat.color : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-base)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  boxShadow: isActive ? `0 0 20px ${cat.color}25` : 'none',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: `${cat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Icon size={20} color={cat.color} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: isActive ? cat.color : 'var(--text-primary)' }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                  {cat.description}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  {cat.highlight}
                </span>
              </button>
            );
          })}
        </div>

        {/* Why Alternate Assets Banner */}
        <div
          className="card animate-fade-in"
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-start',
            marginBottom: 32,
            background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.06) 0%, rgba(6, 214, 160, 0.02) 100%)',
            borderColor: 'rgba(6, 214, 160, 0.15)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={18} color="#06d6a0" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Why invest in alternate assets?</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Traditional equity portfolios are heavily correlated with market volatility. REITs, InvITs, and bonds
              provide <strong style={{ color: 'var(--text-primary)' }}>uncorrelated returns</strong> through rental
              income and infrastructure cash flows — helping reduce overall portfolio risk while boosting yield.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'SEBI Regulated', icon: '🏛️' },
              { label: '90% Income Distribution (REIT)', icon: '💸' },
              { label: 'Listed on NSE/BSE', icon: '📈' },
              { label: 'Tax-efficient', icon: '✅' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Grid */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {CATEGORIES.find((c) => c.value === activeType)?.label} Assets
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              ({assets.length} available)
            </span>
          </h2>

          {loading ? (
            <LoadingPage />
          ) : assets.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {assets.map((asset, i) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  delay={i}
                  onViewDetails={(a) => setCopilotAsset(a)}
                  onInvest={(a) => router.push(`/invest/${a.id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 60,
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ fontSize: 16 }}>No assets in this category yet.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Try exploring other categories or check back soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Co-Pilot */}
      {copilotAsset && (
        <CoPilotPanel asset={copilotAsset} onClose={() => setCopilotAsset(null)} />
      )}
    </>
  );
}
