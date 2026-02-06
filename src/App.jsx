import { useState, useEffect } from 'react'
import './index.css'
import { WorkoutLogger } from './components/WorkoutLogger'
import { WORKOUT_TYPES, getNextWorkoutType } from './logic/startingStrength'
import { ContributionGraph } from './components/ContributionGraph' // Will create next

function App() {
  const [activeWorkout, setActiveWorkout] = useState(null);
  
  // Persist history in localStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('lyftr_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [nextType, setNextType] = useState(WORKOUT_TYPES.A);

  useEffect(() => {
    // Determine next workout type based on last history entry
    if (history.length > 0) {
      const last = history[history.length - 1];
      setNextType(getNextWorkoutType(last.type));
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem('lyftr_history', JSON.stringify(history));
  }, [history]);

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleComplete = (data) => {
    setHistory(prev => [...prev, data]);
    setActiveWorkout(null);
  };

  return (
    <div className="app-container">
      <header style={{ padding: '2rem 0', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.2rem'}}>
            Lyftr<span style={{ color: 'hsl(var(--primary))' }}>.</span>
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Strength made simple.</p>
        </div>
        <button 
          onClick={toggleTheme}
          style={{ 
            padding: '8px', 
            borderRadius: '50%', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--bg-input)',
            color: 'var(--text-secondary)',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      
      <main>
        {activeWorkout ? (
          <div className="animation-fade-in">
             <button 
                onClick={() => setActiveWorkout(null)}
                style={{ color: 'hsl(var(--text-muted))', marginBottom: '1rem', fontSize: '0.9rem' }}
             >
               ← Cancel Workout
             </button>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
               Workout {activeWorkout}
             </h2>
             <WorkoutLogger type={activeWorkout} onComplete={handleComplete} />
          </div>
        ) : (
          <div className="dashboard animation-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
               <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ready to train?</h2>
               <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
                 Next up is <strong>Workout {nextType}</strong>
               </p>
               <button 
                 className="btn-primary"
                 onClick={() => setActiveWorkout(nextType)}
               >
                 Start Workout {nextType}
               </button>
            </div>

            <section>
              <h3 style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Activity
              </h3>
              <ContributionGraph history={history} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
