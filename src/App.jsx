import { useState, useEffect } from 'react'
import './index.css'
import { WORKOUT_TYPES, getNextWorkoutType } from './logic/startingStrength'
import { Dashboard } from './components/Dashboard'
import { WorkoutLogger } from './components/WorkoutLogger'
import { History } from './components/History'
import { BottomNav } from './components/BottomNav'

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(null);

  // Persist history in localStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('lyftr_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('lyftr_weights');
    return saved ? JSON.parse(saved) : {
      squat: 135,
      bench: 95,
      press: 65,
      deadlift: 225
    };
  });

  const [nextType, setNextType] = useState(WORKOUT_TYPES.A);

  const [theme, setTheme] = useState('dark');
  const [unit, setUnit] = useState(() => {
    const saved = localStorage.getItem('lyftr_unit');
    return saved || 'lbs';
  });

  useEffect(() => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setNextType(getNextWorkoutType(last.type));
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem('lyftr_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('lyftr_weights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lyftr_unit', unit);
  }, [unit]);

  const updateWeight = (id, newWeight) => {
    setWeights(prev => ({ ...prev, [id]: newWeight }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleUnit = () => {
    setUnit(prev => {
      const newUnit = prev === 'lbs' ? 'kg' : 'lbs';
      const factor = newUnit === 'kg' ? 1 / 2.20462 : 2.20462;
      const increment = newUnit === 'kg' ? 2.5 : 5;

      const newWeights = {};
      Object.keys(weights).forEach(key => {
        newWeights[key] = Math.round((weights[key] * factor) / increment) * increment;
      });
      setWeights(newWeights);
      return newUnit;
    });
  };

  const handleComplete = (data) => {
    setHistory(prev => [...prev, { ...data, unit }]);
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

  const handleTabChange = (tab) => {
    // If switching to workout tab and there's an active workout, keep it
    // If no active workout and clicking workout tab, start one
    if (tab === 'workout' && !activeWorkout) {
      handleStartWorkout();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Settings bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 0 0',
      }}>
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
            width: '36px',
            height: '36px',
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
        {activeTab === 'home' && !activeWorkout && (
          <Dashboard
            nextType={nextType}
            weights={weights}
            onWeightChange={updateWeight}
            onStartWorkout={handleStartWorkout}
            history={history}
            unit={unit}
          />
        )}

        {(activeTab === 'workout' && activeWorkout) && (
          <WorkoutLogger
            type={activeWorkout}
            onComplete={handleComplete}
            onCancel={handleCancelWorkout}
            unit={unit}
            weights={weights}
            onWeightChange={updateWeight}
          />
        )}

        {activeTab === 'history' && (
          <History
            history={history}
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
  )
}

export default App
