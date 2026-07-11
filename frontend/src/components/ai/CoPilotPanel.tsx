'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatAssetType } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface Props {
  asset: any;
  onClose: () => void;
}

export default function CoPilotPanel({ asset, onClose }: Props) {
  const { user } = useAuthStore();
  const [suitability, setSuitability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch suitability on mount
  useEffect(() => {
    if (user && asset) {
      setLoading(true);
      aiApi
        .suitability(user.userId, asset.id)
        .then((res) => setSuitability(res.data))
        .catch((err) => {
          console.error('Suitability check failed:', err);
          setSuitability(null);
        })
        .finally(() => setLoading(false));
    }
  }, [user, asset]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || !user) return;
    const message = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);

    try {
      const res = await aiApi.chat(user.userId, message, asset?.id);
      setChatMessages((prev) => [...prev, { role: 'ai', text: res.data.response }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, I could not process your request. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const ratingConfig: Record<string, { icon: any; color: string; label: string }> = {
    SUITABLE: { icon: CheckCircle, color: '#10b981', label: 'Suitable for You' },
    MODERATE_FIT: { icon: AlertTriangle, color: '#f59e0b', label: 'Moderate Fit' },
    NOT_SUITABLE: { icon: ShieldCheck, color: '#ef4444', label: 'Not Suitable' },
  };

  return (
    <>
      <div className="copilot-overlay" onClick={onClose} />
      <div className="copilot-panel">
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
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
              background: 'rgba(6, 214, 160, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bot size={18} color="#06d6a0" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>AI Co-Pilot</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Suitability analysis for {asset?.name}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Asset summary */}
          <div
            className="glass-card"
            style={{ padding: 16, marginBottom: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={`badge badge-${asset?.assetType?.toLowerCase()}`}>
                {formatAssetType(asset?.assetType)}
              </span>
              {asset?.yieldPercent && (
                <span style={{ fontSize: 12, color: 'var(--color-profit)' }}>
                  Yield: {asset.yieldPercent}%
                </span>
              )}
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 600 }}>{asset?.name}</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {asset?.issuer} · ₹{asset?.currentPrice}
            </p>
          </div>

          {/* Suitability Result */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <LoadingSpinner size={32} />
            </div>
          ) : suitability ? (
            <div className="animate-fade-in">
              {/* Rating badge */}
              {(() => {
                const config = ratingConfig[suitability.suitabilityRating] || ratingConfig.MODERATE_FIT;
                const Icon = config.icon;
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      background: `${config.color}15`,
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={24} color={config.color} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: config.color }}>
                        {config.label}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Score: {suitability.suitabilityScore}/100 · Your Profile: {suitability.userRiskLevel}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Score bar */}
              <div style={{ marginBottom: 20 }}>
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
                      width: `${suitability.suitabilityScore}%`,
                      height: '100%',
                      borderRadius: 3,
                      background:
                        suitability.suitabilityScore >= 70
                          ? 'var(--color-profit)'
                          : suitability.suitabilityScore >= 45
                          ? 'var(--color-warning)'
                          : 'var(--color-loss)',
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="#8b5cf6" />
                  Analysis
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {suitability.explanation}
                </p>
              </div>

              {/* Benefits */}
              {suitability.benefits?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-profit)' }}>
                    ✅ Benefits
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {suitability.benefits.map((b: string, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0 }}>•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {suitability.riskFactors?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-warning)' }}>
                    ⚠️ Risk Factors
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {suitability.riskFactors.map((r: string, i: number) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0 }}>•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!suitability.aiGenerated && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>
                  This analysis uses a rule-based suitability engine. AI-powered analysis available with API key.
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Unable to generate suitability analysis. Please try again.
            </p>
          )}

          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 12,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: msg.role === 'user' ? 'var(--gradient-brand)' : 'rgba(6, 214, 160, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {msg.role === 'user' ? (
                      <User size={14} color="white" />
                    ) : (
                      <Bot size={14} color="#06d6a0" />
                    )}
                  </div>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-elevated)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(6, 214, 160, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bot size={14} color="#06d6a0" />
                  </div>
                  <LoadingSpinner size={20} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            className="input"
            placeholder="Ask about this asset... (e.g., 'Is this REIT safe?')"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            id="copilot-chat-input"
          />
          <button
            className="btn-primary"
            onClick={handleSendChat}
            disabled={!chatInput.trim() || chatLoading}
            style={{ padding: '10px 16px' }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
