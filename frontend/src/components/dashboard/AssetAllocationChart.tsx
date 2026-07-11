'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatAssetType, getAssetColor } from '@/lib/utils';

interface AllocationSlice {
  label: string;
  value: number;
  percentage: number;
}

interface Props {
  data: AllocationSlice[];
  title?: string;
}

export default function AssetAllocationChart({ data, title = 'Asset Allocation' }: Props) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: formatAssetType(d.label),
    value: d.value,
    percentage: d.percentage,
    color: getAssetColor(d.label),
  }));

  return (
    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
        {title}
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 200, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          {chartData.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < chartData.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: item.color,
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {item.percentage?.toFixed(1)}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
