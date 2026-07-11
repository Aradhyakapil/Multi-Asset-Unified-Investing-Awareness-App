'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface PerformancePoint {
  date: string;
  value: number;
}

interface Props {
  data: PerformancePoint[];
}

export default function PerformanceChart({ data }: Props) {
  const [timeframe, setTimeframe] = useState('1Y');
  const timeframes = ['1M', '3M', '6M', '1Y'];

  if (!data || data.length === 0) return null;

  // Filter data based on selected timeframe
  const filterData = () => {
    const monthsMap: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
    const months = monthsMap[timeframe] || 12;
    return data.slice(-months);
  };

  const chartData = filterData().map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    value: d.value,
  }));

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Portfolio Performance</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: timeframe === tf ? 600 : 400,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: timeframe === tf ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: timeframe === tf ? '#818cf8' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#performanceGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
