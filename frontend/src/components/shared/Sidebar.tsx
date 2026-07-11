'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Bot,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Wallet,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/discover', label: 'Discover Assets', icon: Compass },
  { href: '/invest', label: 'Invest', icon: TrendingUp },
  { href: '/profile', label: 'My Profile', icon: UserRound },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="btn-ghost"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 45,
          display: 'none',
        }}
        id="mobile-menu-toggle"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="copilot-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ display: 'block' }}
        />
      )}

      <aside className={cn('sidebar', mobileOpen && 'open')} id="app-sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
              <span className="gradient-text">WealthWise</span>
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
              SUPER APP
            </p>
          </div>
          {/* Mobile close */}
          <button
            className="btn-ghost"
            onClick={() => setMobileOpen(false)}
            style={{ marginLeft: 'auto', display: mobileOpen ? 'flex' : 'none' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 12,
              paddingLeft: 12,
            }}
          >
            Navigation
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--color-brand-primary)'
                        : '3px solid transparent',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 32 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 12,
                paddingLeft: 12,
              }}
            >
              AI Assistant
            </p>
            <div
              className="glass-card"
              style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(6, 214, 160, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="#06d6a0" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>AI Co-Pilot</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Ask about any asset
                </p>
              </div>
            </div>
          </div>
        </nav>

        {/* User section */}
        {user && (
          <div
            style={{
              borderTop: '1px solid var(--border-default)',
              paddingTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
              }}
            >
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {user.riskLevel} Investor
              </p>
            </div>
            <button
              className="btn-ghost"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
