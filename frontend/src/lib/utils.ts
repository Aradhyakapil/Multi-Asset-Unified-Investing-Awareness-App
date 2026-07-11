/** Format a number as Indian Rupees */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a number as Indian Rupees with decimals */
export function formatCurrencyPrecise(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format percentage */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/** Get CSS class for profit/loss text */
export function pnlClass(value: number): string {
  return value >= 0 ? 'profit-text' : 'loss-text';
}

/** Get human-readable asset type label */
export function formatAssetType(type: string): string {
  const map: Record<string, string> = {
    EQUITY: 'Equity',
    MUTUAL_FUND: 'Mutual Fund',
    REIT: 'REIT',
    INVIT: 'InvIT',
    CORPORATE_BOND: 'Corp Bond',
    GOVERNMENT_BOND: 'Govt Bond',
  };
  return map[type] || type;
}

/** Get human-readable risk level label */
export function formatRiskLevel(level: string): string {
  const map: Record<string, string> = {
    CONSERVATIVE: 'Conservative',
    MODERATE: 'Moderate',
    AGGRESSIVE: 'Aggressive',
  };
  return map[level] || level;
}

/** Get human-readable broker source label */
export function formatBrokerSource(source: string): string {
  const map: Record<string, string> = {
    ZERODHA: 'Zerodha',
    GROWW: 'Groww',
    NSDL: 'NSDL',
    CDSL: 'CDSL',
    ACCOUNT_AGGREGATOR: 'Account Aggregator',
  };
  return map[source] || source;
}

/** Chart color by asset type */
export function getAssetColor(type: string): string {
  const map: Record<string, string> = {
    EQUITY: '#6366f1',
    MUTUAL_FUND: '#8b5cf6',
    REIT: '#06d6a0',
    INVIT: '#f59e0b',
    CORPORATE_BOND: '#3b82f6',
    GOVERNMENT_BOND: '#ec4899',
  };
  return map[type] || '#94a3b8';
}

/** Chart color by broker */
export function getBrokerColor(broker: string): string {
  const map: Record<string, string> = {
    ZERODHA: '#6366f1',
    GROWW: '#06d6a0',
    NSDL: '#f59e0b',
    CDSL: '#3b82f6',
    ACCOUNT_AGGREGATOR: '#ec4899',
  };
  return map[broker] || '#94a3b8';
}

/** cn() utility for conditional classnames */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
