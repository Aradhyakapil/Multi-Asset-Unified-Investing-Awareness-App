'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { formatRiskLevel } from '@/lib/utils';
import {
  User,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  LogOut,
  Edit3,
  Briefcase,
  IndianRupee,
  BarChart3,
} from 'lucide-react';
import { profileApi } from '@/lib/api';

const RISK_QUESTIONS = [
  {
    id: 'horizon',
    question: 'What is your primary investment time horizon?',
    options: [
      { label: 'Less than 1 year (short-term)', value: 0 },
      { label: '1–3 years (medium-term)', value: 1 },
      { label: '3–7 years (long-term)', value: 2 },
      { label: '7+ years (very long-term)', value: 3 },
    ],
  },
  {
    id: 'loss_tolerance',
    question: 'If your portfolio dropped 20% in a month, what would you do?',
    options: [
      { label: 'Sell everything to stop the losses', value: 0 },
      { label: 'Sell some to reduce exposure', value: 1 },
      { label: 'Hold and wait for recovery', value: 2 },
      { label: 'Buy more at lower prices', value: 3 },
    ],
  },
  {
    id: 'income',
    question: 'What is your annual household income?',
    options: [
      { label: 'Under ₹5 Lakh', value: 0 },
      { label: '₹5–15 Lakh', value: 1 },
      { label: '₹15–50 Lakh', value: 2 },
      { label: 'Above ₹50 Lakh', value: 3 },
    ],
  },
  {
    id: 'experience',
    question: 'What is your investment experience level?',
    options: [
      { label: 'Beginner — just started', value: 0 },
      { label: 'Intermediate — a few years of experience', value: 1 },
      { label: 'Experienced — comfortable with volatility', value: 2 },
      { label: 'Expert — actively manage complex portfolios', value: 3 },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary financial goal?',
    options: [
      { label: 'Capital preservation — protect what I have', value: 0 },
      { label: 'Income — regular cash flows', value: 1 },
      { label: 'Balanced growth — steady appreciation', value: 2 },
      { label: 'Aggressive growth — maximum returns', value: 3 },
    ],
  },
];

function scoreToRisk(score: number): 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' {
  if (score <= 5) return 'CONSERVATIVE';
  if (score <= 10) return 'MODERATE';
  return 'AGGRESSIVE';
}

const RISK_CONFIG = {
  CONSERVATIVE: {
    color: '#10b981',
    emoji: '🛡️',
    description:
      'You prioritize capital safety over high returns. Government bonds, fixed-income instruments, and large-cap equities align well with your profile.',
    allocation: [
      { label: 'Debt / Bonds', pct: 60 },
      { label: 'Large Cap Equity', pct: 25 },
      { label: 'REITs / InvITs', pct: 15 },
    ],
  },
  MODERATE: {
    color: '#f59e0b',
    emoji: '⚖️',
    description:
      'You seek a balance of growth and stability. A mix of equities, mutual funds, and alternate assets like REITs/InvITs suits your approach.',
    allocation: [
      { label: 'Equity / MFs', pct: 50 },
      { label: 'Debt / Bonds', pct: 30 },
      { label: 'REITs / InvITs', pct: 20 },
    ],
  },
  AGGRESSIVE: {
    color: '#ef4444',
    emoji: '🚀',
    description:
      'You are comfortable with volatility and aim for maximum long-term growth. High-allocation to equities and growth-oriented alternate assets is ideal.',
    allocation: [
      { label: 'Equity / MFs', pct: 70 },
      { label: 'REITs / InvITs', pct: 20 },
      { label: 'Debt / Bonds', pct: 10 },
    ],
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, login, token } = useAuthStore();
  const [mode, setMode] = useState<'view' | 'quiz' | 'result'>('view');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [newRisk, setNewRisk] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const allAnswered = RISK_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);

  const handleSubmitQuiz = async () => {
    const risk = scoreToRisk(totalScore);
    setNewRisk(risk);
    setMode('result');

    // Attempt to save to backend
    if (user && token) {
      setSaving(true);
      try {
        await profileApi.updateRisk(risk);
        // Update local store
        login({ ...user, riskLevel: risk }, token);
      } catch (err) {
        console.error('Failed to update risk profile:', err);
        // Still update local store optimistically
        login({ ...user, riskLevel: risk }, token);
      } finally {
        setSaving(false);
      }
    }
  };

  const currentRisk = (newRisk || user?.riskLevel || 'MODERATE') as keyof typeof RISK_CONFIG;
  const riskConfig = RISK_CONFIG[currentRisk] || RISK_CONFIG.MODERATE;

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
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
            marginBottom: 8,
          }}
        >
          <User size={28} style={{ color: '#6366f1' }} />
          My Profile
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Manage your investor profile and risk assessment.
        </p>
      </div>

      {/* User Card */}
      <div
        className="card animate-fade-in"
        style={{
          marginBottom: 24,
          background: 'var(--gradient-brand)',
          border: 'none',
          padding: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 2 }}>
              {user?.fullName}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{user?.email}</p>
          </div>
          <button
            className="btn-ghost"
            onClick={logout}
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}
            id="logout-btn"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Risk Profile Card */}
      {mode === 'view' && (
        <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color={riskConfig.color} />
                Risk Profile
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Your investor type determines personalized asset recommendations.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setMode('quiz')}
              style={{ fontSize: 13, flexShrink: 0 }}
              id="retake-quiz-btn"
            >
              <Edit3 size={14} />
              Retake Assessment
            </button>
          </div>

          {/* Risk Level Display */}
          <div
            style={{
              padding: 20,
              borderRadius: 'var(--radius-md)',
              background: `${riskConfig.color}10`,
              border: `1px solid ${riskConfig.color}30`,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{riskConfig.emoji}</span>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: riskConfig.color }}>
                  {formatRiskLevel(currentRisk)} Investor
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Based on your risk assessment
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {riskConfig.description}
            </p>
          </div>

          {/* Suggested Allocation */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={15} color="var(--text-muted)" />
              Suggested Portfolio Allocation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {riskConfig.allocation.map((a) => (
                <div key={a.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.pct}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--bg-elevated)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${a.pct}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: riskConfig.color,
                        transition: 'width 0.8s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {mode === 'view' && (
        <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'View Dashboard', icon: BarChart3, href: '/', color: '#6366f1' },
              { label: 'Discover Alternate Assets', icon: TrendingUp, href: '/discover', color: '#06d6a0' },
              { label: 'Invest in REITs & Bonds', icon: IndianRupee, href: '/invest', color: '#f59e0b' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: `${item.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={item.color} />
                  </div>
                  <span style={{ fontSize: 14, flex: 1 }}>{item.label}</span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {mode === 'quiz' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Briefcase size={20} color="#8b5cf6" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Risk Assessment Questionnaire</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Answer all {RISK_QUESTIONS.length} questions to determine your investor profile.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {Object.keys(answers).length} / {RISK_QUESTIONS.length}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 4,
                borderRadius: 2,
                background: 'var(--bg-elevated)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(Object.keys(answers).length / RISK_QUESTIONS.length) * 100}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: 'var(--gradient-brand)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {RISK_QUESTIONS.map((q, qi) => (
              <div key={q.id}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  {qi + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        id={`quiz-q${qi}-opt${opt.value}`}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))
                        }
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--border-default)'}`,
                          background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          textAlign: 'left',
                          fontSize: 13,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? '#6366f1' : 'var(--border-hover)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#6366f1',
                              }}
                            />
                          )}
                        </div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button
              className="btn-secondary"
              onClick={() => { setMode('view'); setAnswers({}); }}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmitQuiz}
              disabled={!allAnswered}
              style={{ flex: 2, opacity: allAnswered ? 1 : 0.5 }}
              id="submit-quiz-btn"
            >
              <CheckCircle size={16} />
              Submit Assessment
            </button>
          </div>
        </div>
      )}

      {/* Result Mode */}
      {mode === 'result' && (() => {
        const resultRisk = scoreToRisk(totalScore) as keyof typeof RISK_CONFIG;
        const config = RISK_CONFIG[resultRisk];
        return (
          <div className="card animate-slide-in-up" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{config.emoji}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: config.color }}>
              You are a {formatRiskLevel(resultRisk)} Investor!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
              {config.description}
            </p>

            {saving && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Saving your profile...
              </p>
            )}
            {!saving && (
              <p style={{ fontSize: 12, color: 'var(--color-profit)', marginBottom: 16 }}>
                ✅ Profile updated successfully
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                onClick={() => { setMode('view'); setAnswers({}); }}
              >
                View Profile
              </button>
              <button
                className="btn-primary"
                onClick={() => router.push('/discover')}
              >
                Discover Assets
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
