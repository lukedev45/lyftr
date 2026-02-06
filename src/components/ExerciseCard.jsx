import { useState, useMemo, useEffect } from 'react';
import { calculateWarmup } from '../logic/warmup';

export function ExerciseCard({ exercise, targetWeight, onWeightChange, sets, reps }) {
  // actualReps: { [index]: number }
  // Initialize with null to indicate "not done", or pre-fill?
  // User asked for "put in their own reps instead of just checking".
  // Best UX: Start empty or 0. User types 5. 
  // If we just use an input, we need to track the value.
  const [actualReps, setActualReps] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  const warmups = useMemo(() => calculateWarmup(targetWeight), [targetWeight]);

  const handleRepChange = (index, value) => {
    // If value is empty string, keep it as empty string for UI, but logic might need to handle it.
    // We'll store exactly what's typed, cast to number only when needed (or just store string).
    setActualReps(prev => ({
      ...prev,
      [index]: value
    }));
  };
  
  // Quick fill helper (optional, might clutter UI, but good for UX)
  const quickFill = (index) => {
     handleRepChange(index, reps);
  }

  const workSets = Array(sets).fill(null).map((_, i) => ({
      type: 'work',
      weight: targetWeight,
      reps: reps,
      index: i
  }));

  return (
    <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1.5rem', borderLeft: '4px solid hsl(var(--primary))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{exercise.name}</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ color: 'hsl(var(--text-secondary))' }}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <label style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Work Weight:</label>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="number"
            value={targetWeight}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            style={{
              width: '100%',
              background: 'hsl(var(--bg-input))',
              border: '1px solid transparent',
              color: 'hsl(var(--text-primary))',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600
            }}
          />
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-secondary))' }}>
            lbs
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="set-list">
          {warmups.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warmup</p>
              {warmups.map((set, i) => (
                <div key={`warmup-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'hsl(var(--text-muted))' }}>
                  <span>{set.sets} x {set.reps}</span>
                  <span>{set.weight} lbs</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-primary))', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Work Sets (Target: {reps})</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {workSets.map((set, i) => (
                <div key={`work-${i}`} style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="number"
                        placeholder={reps} 
                        value={actualReps[i] || ''}
                        onChange={(e) => handleRepChange(i, e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            // Green border/bg if matches target reps, regular otherwise
                            background: (actualReps[i] && Number(actualReps[i]) >= reps) 
                                ? 'hsl(var(--success) / 0.2)' 
                                : 'hsl(var(--bg-input))',
                            border: (actualReps[i] && Number(actualReps[i]) >= reps)
                                ? '1px solid hsl(var(--success))'
                                : '1px solid transparent',
                            color: 'hsl(var(--text-primary))',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                        }}
                    />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
