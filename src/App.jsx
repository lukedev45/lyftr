import { useState, useEffect } from 'react'
import './index.css'
import { WorkoutLogger } from './components/WorkoutLogger'
import { WORKOUT_TYPES, getNextWorkoutType, ROUTINES, EXERCISES } from './logic/startingStrength'
import { ContributionGraph } from './components/ContributionGraph'

function App() {
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

  useEffect(() => {
    localStorage.setItem('lyftr_weights', JSON.stringify(weights));
  }, [weights]);

  const updateWeight = (id, newWeight) => {
    setWeights(prev => ({ ...prev, [id]: newWeight }));
  };

  const [theme, setTheme] = useState('dark');
  const [unit, setUnit] = useState(() => {
    const saved = localStorage.getItem('lyftr_unit');
    return saved || 'lbs';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lyftr_unit', unit);
  }, [unit]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleUnit = () => {
    setUnit(prev => {
      const newUnit = prev === 'lbs' ? 'kg' : 'lbs';
      // Convert current weights
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={toggleUnit}
            style={{ 
              padding: '0 12px', 
              borderRadius: '20px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--bg-input)',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.8rem',
              fontWeight: 700,
              height: '40px'
            }}
          >
            {unit.toUpperCase()}
          </button>
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
        </div>
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
             <WorkoutLogger 
               type={activeWorkout} 
               onComplete={handleComplete} 
               unit={unit} 
               weights={weights}
               onWeightChange={updateWeight}
             />
          </div>
        ) : (
          <div className="dashboard animation-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
               <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ready to train?</h2>
               <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
                 Next up is <strong>Workout {nextType}</strong>
               </p>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {WORKOUT_TYPES[nextType] === nextType && (
                    ROUTINES[nextType].map(item => {
                      const exercise = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
                      return (
                        <div key={item.exerciseId} style={{ background: 'hsl(var(--bg-input))', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
                           <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: '4px' }}>{exercise.name}</div>
                           <div style={{ display: 'flex', alignItems: 'center' }}>
                             <input 
                               type="number"
                               value={weights[item.exerciseId]}
                               onChange={(e) => updateWeight(item.exerciseId, Number(e.target.value))}
                               style={{ 
                                 background: 'none', 
                                 border: 'none', 
                                 color: 'hsl(var(--text-primary))', 
                                 fontSize: '1.1rem', 
                                 fontWeight: 700,
                                 width: '100%',
                                 outline: 'none'
                               }}
                             />
                             <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{unit}</span>
                           </div>
                        </div>
                      );
                    })
                  )}
               </div>

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
