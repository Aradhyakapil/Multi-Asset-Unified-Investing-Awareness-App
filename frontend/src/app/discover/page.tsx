'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assetApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import AssetCard from '@/components/discover/AssetCard';
import CoPilotPanel from '@/components/ai/CoPilotPanel';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { Compass, Search, SlidersHorizontal } from 'lucide-react';

const ASSET_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REIT', label: 'REITs' },
  { value: 'INVIT', label: 'InvITs' },
  { value: 'CORPORATE_BOND', label: 'Corp Bonds' },
  { value: 'GOVERNMENT_BOND', label: 'Govt Bonds' },
  { value: 'MUTUAL_FUND', label: 'Mutual Funds' },
];

const RISK_LEVELS = [
  { value: '', label: 'All Risk Levels' },
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'AGGRESSIVE', label: 'Aggressive' },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [copilotAsset, setCopilotAsset] = useState<any>(null);

  useEffect(() => {
    fetchAssets();
  }, [assetType, riskLevel]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (assetType) params.assetType = assetType;
      if (riskLevel) params.riskLevel = riskLevel;
      const res = await assetApi.discover(params);
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = search
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.ticker.toLowerCase().includes(search.toLowerCase()) ||
          a.sector?.toLowerCase().includes(search.toLowerCase())
      )
    : assets;

  return (
    <>
      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
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
            <Compass size={28} style={{ color: '#06d6a0' }} />
            Asset Discovery Hub
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Explore equities, REITs, InvITs, and bonds. Click any asset for an AI suitability check.
          </p>
        </div>

        {/* Filters */}
        <div
          className="card"
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            padding: '16px 20px',
          }}
        >
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              className="input"
              placeholder="Search by name, ticker, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
              id="asset-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
          </div>

          <select
            className="input"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            style={{ width: 'auto', minWidth: 140, cursor: 'pointer' }}
            id="asset-type-filter"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            style={{ width: 'auto', minWidth: 140, cursor: 'pointer' }}
            id="risk-level-filter"
          >
            {RISK_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Showing {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
          {assetType && ` · Type: ${assetType}`}
          {riskLevel && ` · Risk: ${riskLevel}`}
        </p>

        {/* Asset Grid */}
        {loading ? (
          <LoadingPage />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {filteredAssets.map((asset, i) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                delay={i}
                onViewDetails={(a) => setCopilotAsset(a)}
                onInvest={(a) => router.push(`/invest/${a.id}`)}
              />
            ))}
          </div>
        )}

        {!loading && filteredAssets.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ fontSize: 16 }}>No assets found matching your filters.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Try adjusting the filters above.</p>
          </div>
        )}
      </div>

      {/* AI Co-Pilot */}
      {copilotAsset && (
        <CoPilotPanel asset={copilotAsset} onClose={() => setCopilotAsset(null)} />
      )}
    </>
  );
}
