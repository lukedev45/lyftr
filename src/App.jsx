import { useState, useEffect, useRef } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import { useSupabaseData } from './lib/useSupabaseData'
import { WORKOUT_TYPES, getNextWorkoutType } from './logic/startingStrength'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { WorkoutLogger } from './components/WorkoutLogger'
import { PastWorkoutLogger } from './components/PastWorkoutLogger'
import { History } from './components/History'
import { Coach } from './components/Coach'
import { BottomNav } from './components/BottomNav'

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showPastWorkout, setShowPastWorkout] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Virtual keyboard: scroll active input into view when keyboard opens
  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  // Offline indicator
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data hook -- uses Supabase when logged in, falls back to localStorage
  const {
    loading: dataLoading,
    weights,
    setWeights,
    history,
    unit,
    setUnit,
    saveWorkout,
  } = useSupabaseData(session);

  const [nextType, setNextType] = useState(WORKOUT_TYPES.A);

  useEffect(() => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setNextType(getNextWorkoutType(last.type));
    }
  }, [history]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateWeight = (id, newWeight) => {
    const newWeights = { ...weights, [id]: newWeight };
    setWeights(newWeights);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleUnit = () => {
    const newUnit = unit === 'lbs' ? 'kg' : 'lbs';
    const factor = newUnit === 'kg' ? 1 / 2.20462 : 2.20462;
    const increment = newUnit === 'kg' ? 2.5 : 5;

    const newWeights = {};
    Object.keys(weights).forEach(key => {
      newWeights[key] = Math.round((weights[key] * factor) / increment) * increment;
    });
    setWeights(newWeights);
    setUnit(newUnit);
  };

  const handleComplete = async (data) => {
    await saveWorkout({ ...data, unit });
    setActiveWorkout(null);
    setActiveTab('home');
  };

  const handleStartWorkout = () => {
    setActiveWorkout(nextType);
    setActiveTab('workout');
  };

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    setActiveTab('home');
  };

  const handleSavePastWorkout = async (data) => {
    await saveWorkout(data);
    setShowPastWorkout(false);
  };

  const handleTabChange = (tab) => {
    if (tab === 'workout' && !activeWorkout) {
      handleStartWorkout();
      return;
    }
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
        }}>
          Lyftr<span style={{ color: 'hsl(var(--primary))' }}>.</span>
        </h1>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2.5px solid hsl(var(--bg-elevated))',
          borderTopColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  // Auth screen if not logged in
  if (!session && supabase) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <AuthScreen onAuth={setSession} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Offline banner */}
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'hsl(var(--bg-elevated))',
          color: 'hsl(var(--text-secondary))',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '8px 16px',
          borderBottom: '1px solid hsl(var(--bg-card))',
        }}>
          You&apos;re offline — data saved locally
        </div>
      )}

      {/* Settings bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 0 0',
      }}>
        {session && (
          <button
            onClick={handleSignOut}
            className="btn-ghost"
            style={{ fontSize: '0.7rem', padding: '8px 12px', marginRight: 'auto' }}
          >
            Sign out
          </button>
        )}
        <button
          onClick={toggleUnit}
          className="btn-secondary"
          style={{
            fontSize: '0.75rem',
            padding: '6px 12px',
            borderRadius: '100px',
            fontWeight: 700,
          }}
        >
          {unit.toUpperCase()}
        </button>
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--bg-elevated))',
            color: 'hsl(var(--text-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main content area */}
      <main style={{ flex: 1 }}>
        {showPastWorkout && (
          <PastWorkoutLogger
            onSave={handleSavePastWorkout}
            onCancel={() => setShowPastWorkout(false)}
            unit={unit}
            currentWeights={weights}
          />
        )}

        {!showPastWorkout && activeTab === 'home' && !activeWorkout && (
          <Dashboard
            nextType={nextType}
            weights={weights}
            onWeightChange={updateWeight}
            onStartWorkout={handleStartWorkout}
            onAddPastWorkout={() => setShowPastWorkout(true)}
            history={history}
            unit={unit}
          />
        )}

        {!showPastWorkout && (activeTab === 'workout' && activeWorkout) && (
          <WorkoutLogger
            type={activeWorkout}
            onComplete={handleComplete}
            onCancel={handleCancelWorkout}
            unit={unit}
            weights={weights}
            onWeightChange={updateWeight}
          />
        )}

        {!showPastWorkout && activeTab === 'history' && (
          <History
            history={history}
            unit={unit}
            onAddPastWorkout={() => setShowPastWorkout(true)}
          />
        )}

        {!showPastWorkout && activeTab === 'coach' && (
          <Coach
            history={history}
            weights={weights}
            unit={unit}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasActiveWorkout={!!activeWorkout}
      />
    </div>
  );
}

export default App
