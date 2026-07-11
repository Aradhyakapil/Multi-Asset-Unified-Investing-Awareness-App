'use client';

import { TrendingUp, TrendingDown, IndianRupee, PiggyBank, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercent, pnlClass } from '@/lib/utils';

interface Props {
  totalNetWorth: number;
  totalInvested: number;
  totalPnl: number;
  pnlPercentage: number;
}

export default function NetWorthCard({ totalNetWorth, totalInvested, totalPnl, pnlPercentage }: Props) {
  const isProfit = totalPnl >= 0;

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--gradient-brand)',
        borderRadius: 'var(--radius-xl)',
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          right: 60,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IndianRupee size={16} color="rgba(255,255,255,0.7)" />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Total Net Worth
          </p>
        </div>

        <h2
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
            marginBottom: 16,
            lineHeight: 1,
          }}
        >
          {formatCurrency(totalNetWorth)}
        </h2>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PiggyBank size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Invested</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
                {formatCurrency(totalInvested)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: isProfit ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isProfit ? (
                <TrendingUp size={16} color="#34d399" />
              ) : (
                <TrendingDown size={16} color="#f87171" />
              )}
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>P&L</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: isProfit ? '#34d399' : '#f87171' }}>
                {formatCurrency(totalPnl)} ({formatPercent(pnlPercentage)})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Returns</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
                {formatPercent(pnlPercentage)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
