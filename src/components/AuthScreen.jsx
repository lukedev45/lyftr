import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
          },
        });
        if (signupError) throw signupError;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSignupSuccess(true);
        } else if (data.session) {
          onAuth(data.session);
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        onAuth(data.session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'hsl(var(--success) / 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Check your email</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.5 }}>
          {"We've sent a confirmation link to"} <strong style={{ color: 'hsl(var(--text-primary))' }}>{email}</strong>. Click the link to activate your account, then come back here to log in.
        </p>
        <button
          className="btn-ghost"
          onClick={() => { setSignupSuccess(false); setMode('login'); }}
          style={{ marginTop: '24px' }}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '24px 0',
    }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>
          Lyftr<span style={{ color: 'hsl(var(--primary))' }}>.</span>
        </h1>
        <p style={{
          color: 'hsl(var(--text-muted))',
          fontSize: '0.9rem',
          marginTop: '8px',
        }}>
          Strength made simple
        </p>
      </div>

      {/* Auth Form */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          padding: '4px',
          background: 'hsl(var(--bg-input))',
          borderRadius: 'var(--radius-md)',
        }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: mode === 'login' ? 'hsl(var(--bg-elevated))' : 'transparent',
              color: mode === 'login' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
              transition: 'var(--transition-fast)',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: mode === 'signup' ? 'hsl(var(--bg-elevated))' : 'transparent',
              color: mode === 'signup' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
              transition: 'var(--transition-fast)',
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'hsl(var(--text-secondary))',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'hsl(var(--bg-input))',
                border: '1.5px solid transparent',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'var(--transition-fast)',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'hsl(var(--text-secondary))',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'hsl(var(--bg-input))',
                border: '1.5px solid transparent',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'var(--transition-fast)',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'hsl(var(--danger) / 0.1)',
              border: '1px solid hsl(var(--danger) / 0.3)',
              color: 'hsl(var(--danger))',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          >
            {loading ? (
              <span style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                border: '2px solid hsl(220 14% 6% / 0.3)',
                borderTopColor: 'hsl(220 14% 6%)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            ) : (
              mode === 'login' ? 'Log in' : 'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
