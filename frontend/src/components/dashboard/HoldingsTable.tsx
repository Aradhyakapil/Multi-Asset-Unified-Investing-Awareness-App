'use client';

import { formatCurrency, formatPercent, formatAssetType, formatBrokerSource, pnlClass } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Holding {
  id: string;
  ticker: string;
  assetName: string;
  assetType: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  brokerSource: string;
  sector: string;
}

interface Props {
  holdings: Holding[];
  onAssetClick?: (holding: Holding) => void;
}

export default function HoldingsTable({ holdings, onAssetClick }: Props) {
  if (!holdings || holdings.length === 0) return null;

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.3s', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Holdings</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {holdings.length} assets across all brokers
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            marginTop: 16,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-default)',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              {['Asset', 'Type', 'Qty', 'Avg Price', 'CMP', 'Value', 'P&L', 'Source'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    textAlign: h === 'Asset' ? 'left' : 'right',
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr
                key={h.id}
                onClick={() => onAssetClick?.(h)}
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  cursor: onAssetClick ? 'pointer' : 'default',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)')
                }
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{h.ticker}</span>
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.assetName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <span className={`badge badge-${h.assetType.toLowerCase()}`}>
                    {formatAssetType(h.assetType)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{h.quantity}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {formatCurrency(h.avgBuyPrice)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(h.currentPrice)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(h.currentValue)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                    }}
                  >
                    {h.pnl >= 0 ? (
                      <ArrowUpRight size={14} color="#10b981" />
                    ) : (
                      <ArrowDownRight size={14} color="#ef4444" />
                    )}
                    <span className={pnlClass(h.pnl)} style={{ fontWeight: 600 }}>
                      {formatPercent(h.pnlPercentage)}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatBrokerSource(h.brokerSource)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
