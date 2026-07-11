'use client';

export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2.5px solid var(--border-default)',
        borderTopColor: 'var(--color-brand-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <LoadingSpinner size={40} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</p>
    </div>
  );
}

export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div className="skeleton" style={{ width: '100%', height, borderRadius: 'var(--radius-lg)' }} />
  );
}
