import { useState } from 'react';
import { EXERCISES, ROUTINES } from '../logic/startingStrength';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';

export function WorkoutLogger({ type, onComplete, onCancel, unit, weights, onWeightChange }) {
  const routine = ROUTINES[type];
  const [showTimer, setShowTimer] = useState(false);
  const [startTime] = useState(() => Date.now());

  const handleSetComplete = () => {
    setShowTimer(true);
  };

  const formatElapsed = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    if (elapsed < 1) return 'Just started';
    return `${elapsed} min`;
  };

  return (
    <div className="animate-fade-in">
      {showTimer && <RestTimer onDismiss={() => setShowTimer(false)} />}

      {/* Workout header */}
      <div style={{
        padding: showTimer ? '60px 0 16px' : '24px 0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'padding 0.3s ease',
      }}>
        <div>
          <button
            onClick={onCancel}
            className="btn-ghost"
            style={{ padding: '4px 0', marginBottom: '4px', fontSize: '0.8rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Cancel
          </button>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}>
            Workout
            <span style={{ color: 'hsl(var(--primary))', fontSize: '2rem', fontWeight: 900 }}>{type}</span>
          </h2>
        </div>

        <div style={{
          textAlign: 'right',
          fontSize: '0.75rem',
          color: 'hsl(var(--text-muted))',
        }}>
          <div style={{ fontWeight: 500 }}>{formatElapsed()}</div>
          <div style={{ fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
            {routine.length} exercises
          </div>
        </div>
      </div>

      {/* Exercise Cards */}
      <div style={{ marginBottom: '24px' }} className="stagger">
        {routine.map((item) => {
          const exercise = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
          return (
            <ExerciseCard
              key={item.exerciseId}
              exercise={exercise}
              sets={item.sets}
              reps={item.reps}
              targetWeight={weights[item.exerciseId]}
              onWeightChange={(w) => onWeightChange(item.exerciseId, w)}
              unit={unit}
              onSetComplete={handleSetComplete}
            />
          );
        })}
      </div>

      {/* Finish button */}
      <button
        className="btn-primary"
        onClick={() => onComplete({
          type,
          date: new Date().toISOString(),
          weights: { ...weights },
          duration: Math.floor((Date.now() - startTime) / 60000),
        })}
        style={{ marginBottom: '16px' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Finish Workout
      </button>
    </div>
  );
}
