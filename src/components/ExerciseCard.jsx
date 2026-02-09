import { useState, useMemo } from 'react';
import { calculateWarmup } from '../logic/warmup';

export function ExerciseCard({ exercise, targetWeight, onWeightChange, sets, reps, unit, onSetComplete }) {
  const [actualReps, setActualReps] = useState({});
  const [completedSets, setCompletedSets] = useState({});
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const warmups = useMemo(() => calculateWarmup(targetWeight, unit), [targetWeight, unit]);

  const workSets = Array(sets).fill(null).map((_, i) => ({
    type: 'work',
    weight: targetWeight,
    reps: reps,
    index: i
  }));

  const allSetsComplete = workSets.every((_, i) => completedSets[i]);

  const handleToggleSet = (index) => {
    const wasComplete = completedSets[index];
    setCompletedSets(prev => ({
      ...prev,
      [index]: !wasComplete
    }));
    if (!wasComplete) {
      // Auto-fill reps if empty
      if (!actualReps[index]) {
        setActualReps(prev => ({ ...prev, [index]: reps }));
      }
      // Trigger rest timer
      if (onSetComplete) onSetComplete();
    }
  };

  const handleRepChange = (index, value) => {
    setActualReps(prev => ({ ...prev, [index]: value }));
  };

  const increment = unit === 'kg' ? 2.5 : 5;

  return (
    <div
      className="card"
      style={{
        marginBottom: '12px',
        padding: '0',
        overflow: 'hidden',
        borderLeft: allSetsComplete ? '3px solid hsl(var(--success))' : '3px solid hsl(var(--primary))',
        opacity: allSetsComplete ? 0.75 : 1,
        transition: 'var(--transition)',
      }}
    >
      {/* Exercise Header */}
      <div style={{
        padding: '16px 16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--text-primary))' }}>
            {exercise.name}
          </h3>
          {allSetsComplete && (
            <span className="pill pill-success" style={{ marginTop: '4px', display: 'inline-flex' }}>
              Complete
            </span>
          )}
        </div>

        {/* Weight stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={() => onWeightChange(Math.max(0, targetWeight - increment))}
            style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'hsl(var(--bg-input))', color: 'hsl(var(--text-muted))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700,
            }}
            aria-label="Decrease weight"
          >
            -
          </button>
          <div style={{
            minWidth: '65px', textAlign: 'center',
            fontWeight: 800, fontSize: '1rem',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            color: 'hsl(var(--text-primary))',
          }}>
            {targetWeight}
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginLeft: '1px', fontWeight: 500 }}>{unit}</span>
          </div>
          <button
            onClick={() => onWeightChange(targetWeight + increment)}
            style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'hsl(var(--bg-input))', color: 'hsl(var(--text-muted))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700,
            }}
            aria-label="Increase weight"
          >
            +
          </button>
        </div>
      </div>

      {/* Warmup Sets - Compact timeline */}
      {warmups.length > 0 && (
        <div style={{ padding: '12px 16px 0' }}>
          <div className="section-label" style={{ marginBottom: '6px' }}>Warmup</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
            {warmups.map((set, i) => (
              <div
                key={`warmup-${i}`}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'hsl(var(--bg-input))',
                  fontSize: '0.75rem',
                  color: 'hsl(var(--text-muted))',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {set.sets}x{set.reps} @ {set.weight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Sets */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div className="section-label" style={{ marginBottom: '8px' }}>
          Work sets -- {sets}x{reps} @ {targetWeight}{unit}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {workSets.map((set, i) => {
            const isComplete = completedSets[i];
            const repVal = actualReps[i] || '';
            const hitTarget = repVal && Number(repVal) >= reps;

            return (
              <div key={`work-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Rep input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={String(reps)}
                    value={repVal}
                    onChange={(e) => handleRepChange(i, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 8px',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-sm)',
                      background: isComplete
                        ? (hitTarget ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--danger) / 0.15)')
                        : 'hsl(var(--bg-input))',
                      border: isComplete
                        ? (hitTarget ? '1.5px solid hsl(var(--success) / 0.5)' : '1.5px solid hsl(var(--danger) / 0.5)')
                        : '1.5px solid transparent',
                      color: 'hsl(var(--text-primary))',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      fontVariantNumeric: 'tabular-nums',
                      outline: 'none',
                      transition: 'var(--transition-fast)',
                    }}
                  />
                </div>

                {/* Check button */}
                <button
                  onClick={() => handleToggleSet(i)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isComplete ? 'hsl(var(--success))' : 'hsl(var(--bg-elevated))',
                    color: isComplete ? 'hsl(220 14% 6%)' : 'hsl(var(--text-muted))',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    transition: 'var(--transition-fast)',
                    animation: isComplete ? 'check-pop 0.25s ease-out' : 'none',
                  }}
                >
                  {isComplete ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    `Set ${i + 1}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes toggle */}
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="btn-ghost"
          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
        >
          {showNotes ? 'Hide notes' : '+ Add note'}
        </button>
        {showNotes && (
          <textarea
            placeholder="How did this feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'hsl(var(--bg-input))',
              border: '1px solid transparent',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.85rem',
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
