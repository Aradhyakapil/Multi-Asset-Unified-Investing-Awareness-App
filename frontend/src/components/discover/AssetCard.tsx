'use client';

import { formatCurrency, formatAssetType } from '@/lib/utils';
import { TrendingUp, Info, ArrowRight } from 'lucide-react';

interface Asset {
  id: string;
  ticker: string;
  name: string;
  issuer: string;
  description: string;
  assetType: string;
  currentPrice: number;
  yieldPercent: number;
  minInvestment: number;
  riskLevel: string;
  sector: string;
  isAlternateAsset: boolean;
}

interface Props {
  asset: Asset;
  onViewDetails: (asset: Asset) => void;
  onInvest: (asset: Asset) => void;
  delay?: number;
}

export default function AssetCard({ asset, onViewDetails, onInvest, delay = 0 }: Props) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        animationDelay: `${delay * 0.05}s`,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onViewDetails(asset)}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 3,
          background:
            asset.assetType === 'REIT'
              ? '#06d6a0'
              : asset.assetType === 'INVIT'
              ? '#f59e0b'
              : asset.assetType === 'CORPORATE_BOND'
              ? '#3b82f6'
              : asset.assetType === 'GOVERNMENT_BOND'
              ? '#ec4899'
              : '#6366f1',
        }}
      />

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className={`badge badge-${asset.assetType.toLowerCase()}`}>
            {formatAssetType(asset.assetType)}
          </span>
          {asset.riskLevel && (
            <span className={`badge badge-${asset.riskLevel.toLowerCase()}`}>
              {asset.riskLevel}
            </span>
          )}
          {asset.isAlternateAsset && (
            <span
              className="badge"
              style={{
                background: 'rgba(139, 92, 246, 0.12)',
                color: '#a78bfa',
              }}
            >
              Alt Asset
            </span>
          )}
        </div>

        {/* Name & issuer */}
        <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
          {asset.name}
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {asset.issuer} · {asset.sector}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 16,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {asset.description}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            padding: '12px 0',
            borderTop: '1px solid var(--border-default)',
            marginBottom: 12,
          }}
        >
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Price
            </p>
            <p style={{ fontSize: 14, fontWeight: 700 }}>₹{asset.currentPrice}</p>
          </div>
          {asset.yieldPercent != null && (
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Yield
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-profit)' }}>
                {asset.yieldPercent}%
              </p>
            </div>
          )}
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Min Invest
            </p>
            <p style={{ fontSize: 14, fontWeight: 700 }}>
              {formatCurrency(asset.minInvestment)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(asset);
            }}
            style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
          >
            <Info size={14} />
            AI Analysis
          </button>
          <button
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onInvest(asset);
            }}
            style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
          >
            Invest
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
