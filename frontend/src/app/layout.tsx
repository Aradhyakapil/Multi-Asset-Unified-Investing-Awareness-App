import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'WealthWise — Unified Multi-Asset Investing Super App',
  description:
    'Consolidate your fragmented portfolio across brokers, discover alternate assets like REITs and InvITs, and get AI-powered suitability checks — all in one place.',
  keywords: 'investing, portfolio, REIT, InvIT, bonds, mutual funds, India, fintech',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
