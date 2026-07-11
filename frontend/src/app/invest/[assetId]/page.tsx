'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assetApi, aiApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency, formatAssetType } from '@/lib/utils';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  XCircle,
  GraduationCap,
  Sparkles,
  PartyPopper,
} from 'lucide-react';

export default function InvestPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'quiz' | 'invest' | 'success'>('quiz');

  // Quiz state
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Investment state
  const [investAmount, setInvestAmount] = useState('');

  useEffect(() => {
    if (assetId) {
      assetApi
        .getById(assetId)
        .then((res) => setAsset(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));

      setQuizLoading(true);
      aiApi
        .knowledgeCheck(assetId)
        .then((res) => setQuiz(res.data))
        .catch(console.error)
        .finally(() => setQuizLoading(false));
    }
  }, [assetId]);

  const handleQuizSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const passed = correct >= 2; // Must get 2/3
    setQuizPassed(passed);
    setQuizSubmitted(true);
    if (passed) {
      setTimeout(() => setStep('invest'), 1500);
    }
  };

  const handleInvest = () => {
    // Mock investment — just show success
    setStep('success');
  };

  if (loading) return <LoadingPage />;
  if (!asset) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: 60 }}>
        <p>Asset not found.</p>
        <button className="btn-primary" onClick={() => router.push('/discover')} style={{ marginTop: 16 }}>
          Back to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: 700 }}>
      {/* Back button */}
      <button
        className="btn-ghost"
        onClick={() => router.push('/discover')}
        style={{ marginBottom: 24 }}
      >
        <ArrowLeft size={16} />
        Back to Discovery
      </button>

      {/* Asset Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className={`badge badge-${asset.assetType.toLowerCase()}`}>
            {formatAssetType(asset.assetType)}
          </span>
          {asset.isAlternateAsset && (
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>
              Alternate Asset
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{asset.name}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {asset.issuer} · {asset.sector} · ₹{asset.currentPrice}
        </p>
        {asset.description && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.7 }}>
            {asset.description}
          </p>
        )}
      </div>

      {/* Step: Quiz */}
      {step === 'quiz' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <GraduationCap size={22} color="#8b5cf6" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Knowledge Check</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Answer 2 out of 3 correctly to proceed. This prevents mis-selling.
              </p>
            </div>
          </div>

          {quizLoading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <LoadingSpinner size={32} />
              <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                Generating questions...
              </p>
            </div>
          ) : quiz?.questions ? (
            <>
              {quiz.questions.map((q: any, qi: number) => (
                <div
                  key={qi}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    {qi + 1}. {q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt: string, oi: number) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = quizSubmitted && oi === q.correctIndex;
                      const isWrong = quizSubmitted && isSelected && oi !== q.correctIndex;

                      return (
                        <button
                          key={oi}
                          onClick={() => {
                            if (!quizSubmitted) setAnswers({ ...answers, [qi]: oi });
                          }}
                          disabled={quizSubmitted}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${
                              isCorrect
                                ? '#10b981'
                                : isWrong
                                ? '#ef4444'
                                : isSelected
                                ? '#6366f1'
                                : 'var(--border-default)'
                            }`,
                            background: isCorrect
                              ? 'rgba(16, 185, 129, 0.1)'
                              : isWrong
                              ? 'rgba(239, 68, 68, 0.1)'
                              : isSelected
                              ? 'rgba(99, 102, 241, 0.1)'
                              : 'transparent',
                            textAlign: 'left',
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            cursor: quizSubmitted ? 'default' : 'pointer',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {isCorrect && <CheckCircle size={16} color="#10b981" />}
                          {isWrong && <XCircle size={16} color="#ef4444" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  className="btn-primary"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(answers).length < quiz.questions.length}
                  style={{
                    width: '100%',
                    padding: 14,
                    opacity: Object.keys(answers).length < quiz.questions.length ? 0.5 : 1,
                  }}
                >
                  <ShieldCheck size={18} />
                  Submit Knowledge Check
                </button>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 20,
                    borderRadius: 'var(--radius-md)',
                    background: quizPassed
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {quizPassed ? (
                    <>
                      <CheckCircle size={32} color="#10b981" />
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981', marginTop: 8 }}>
                        Knowledge Check Passed! ✅
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Proceeding to investment...
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle size={32} color="#ef4444" />
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', marginTop: 8 }}>
                        Please review the concepts
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        You need 2/3 correct to proceed. This protects you from uninformed investments.
                      </p>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setAnswers({});
                          setQuizSubmitted(false);
                        }}
                        style={{ marginTop: 12 }}
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Step: Investment Form */}
      {step === 'invest' && (
        <div className="card animate-slide-in-up">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="#6366f1" />
            Simulate Investment
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Investment Amount (₹)
            </label>
            <input
              className="input"
              type="number"
              placeholder={`Min: ₹${asset.minInvestment || 1000}`}
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              id="invest-amount-input"
              style={{ fontSize: 18, fontWeight: 600, padding: '14px 16px' }}
            />
          </div>

          {investAmount && Number(investAmount) > 0 && (
            <div
              className="glass-card"
              style={{ padding: 16, marginBottom: 20 }}
            >
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Order Summary</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>Asset</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{asset.ticker}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>Price per unit</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>₹{asset.currentPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>Units</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {(Number(investAmount) / asset.currentPrice).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-default)',
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {formatCurrency(Number(investAmount))}
                </span>
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleInvest}
            disabled={!investAmount || Number(investAmount) <= 0}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              opacity: !investAmount || Number(investAmount) <= 0 ? 0.5 : 1,
            }}
          >
            Confirm Investment (Simulated)
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            This is a simulated investment for demonstration purposes only.
          </p>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="card animate-slide-in-up" style={{ textAlign: 'center', padding: 48 }}>
          <PartyPopper size={48} color="#06d6a0" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Investment Successful! 🎉
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            You have simulated an investment of {formatCurrency(Number(investAmount))} in {asset.name}.
            <br />
            This would appear in your unified portfolio dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => router.push('/')}>
              View Dashboard
            </button>
            <button className="btn-secondary" onClick={() => router.push('/discover')}>
              Discover More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
