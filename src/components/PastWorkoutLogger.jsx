import { useState, useMemo } from 'react';
import { EXERCISES, ROUTINES, WORKOUT_TYPES } from '../logic/startingStrength';

export function PastWorkoutLogger({ onSave, onCancel, unit, currentWeights }) {
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES.A);
  const [date, setDate] = useState(() => {
    const now = new Date();
    // Format as YYYY-MM-DD for the date input
    return now.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('12:00');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Per-exercise weights
  const [exerciseWeights, setExerciseWeights] = useState(() => ({ ...currentWeights }));

  // Per-set reps tracking: { [exerciseId]: { [setIndex]: repsValue } }
  const [setReps, setSetReps] = useState({});

  const routine = ROUTINES[workoutType];
  const increment = unit === 'kg' ? 2.5 : 5;

  const handleWeightChange = (exerciseId, delta) => {
    setExerciseWeights(prev => ({
      ...prev,
      [exerciseId]: Math.max(0, (prev[exerciseId] || 0) + delta),
    }));
  };

  const handleRepChange = (exerciseId, setIndex, value) => {
    setSetReps(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [setIndex]: value,
      },
    }));
  };

  const allSetsData = useMemo(() => {
    const sets = [];
    routine.forEach(item => {
      for (let i = 0; i < item.sets; i++) {
        const repsVal = setReps[item.exerciseId]?.[i];
        sets.push({
          exerciseId: item.exerciseId,
          setNumber: i + 1,
          weight: exerciseWeights[item.exerciseId] || 0,
          targetReps: item.reps,
          completedReps: repsVal !== undefined && repsVal !== '' ? Number(repsVal) : item.reps,
          rpe: null,
          isWarmup: false,
        });
      }
    });
    return sets;
  }, [routine, exerciseWeights, setReps]);

  const handleSave = () => {
    const dateTime = new Date(`${date}T${time}:00`);

    onSave({
      type: workoutType,
      date: dateTime.toISOString(),
      weights: { ...exerciseWeights },
      duration: duration ? Number(duration) : null,
      notes: notes.trim() || null,
      setsData: allSetsData,
      unit,
    });
  };

  // Check if the date is in the future
  const isFutureDate = new Date(`${date}T${time}:00`) > new Date();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ padding: '24px 0 16px' }}>
        <button
          onClick={onCancel}
          className="btn-ghost"
          style={{ padding: '4px 0', marginBottom: '4px', fontSize: '0.8rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}>
          Log Past Workout
        </h2>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginTop: '2px' }}>
          Add a workout you did previously
        </p>
      </div>

      {/* Date & Time */}
      <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>When</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'hsl(var(--bg-input))',
                border: '1.5px solid transparent',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'hsl(var(--bg-input))',
                border: '1.5px solid transparent',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>
        {isFutureDate && (
          <p style={{ color: 'hsl(var(--warning))', fontSize: '0.75rem', marginTop: '8px', fontWeight: 500 }}>
            This date is in the future
          </p>
        )}
      </div>

      {/* Workout Type */}
      <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Workout type</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.values(WORKOUT_TYPES).map(type => (
            <button
              key={type}
              onClick={() => setWorkoutType(type)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: workoutType === type ? 'hsl(var(--primary))' : 'hsl(var(--bg-input))',
                color: workoutType === type ? 'hsl(220 14% 6%)' : 'hsl(var(--text-secondary))',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                transition: 'var(--transition-fast)',
                border: workoutType === type ? 'none' : '1.5px solid hsl(var(--bg-elevated))',
              }}
            >
              {type}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {routine.map(item => {
            const ex = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
            return (
              <span
                key={item.exerciseId}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'hsl(var(--bg-input))',
                  fontSize: '0.75rem',
                  color: 'hsl(var(--text-secondary))',
                }}
              >
                {ex.name} {item.sets}x{item.reps}
              </span>
            );
          })}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ marginBottom: '12px' }} className="stagger">
        {routine.map(item => {
          const exercise = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
          const weight = exerciseWeights[item.exerciseId] || 0;

          return (
            <div
              key={item.exerciseId}
              className="card"
              style={{
                marginBottom: '10px',
                padding: '0',
                overflow: 'hidden',
                borderLeft: '3px solid hsl(var(--primary))',
              }}
            >
              {/* Exercise header with weight stepper */}
              <div style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                    {exercise.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    {item.sets}x{item.reps}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <button
                    onClick={() => handleWeightChange(item.exerciseId, -increment)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      background: 'hsl(var(--bg-input))', color: 'hsl(var(--text-muted))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700,
                    }}
                    aria-label={`Decrease ${exercise.name} weight`}
                  >
                    -
                  </button>
                  <div style={{
                    minWidth: '70px', textAlign: 'center',
                    fontWeight: 800, fontSize: '1.05rem',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    color: 'hsl(var(--text-primary))',
                  }}>
                    {weight}
                    <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginLeft: '2px', fontWeight: 500 }}>{unit}</span>
                  </div>
                  <button
                    onClick={() => handleWeightChange(item.exerciseId, increment)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      background: 'hsl(var(--bg-input))', color: 'hsl(var(--text-muted))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700,
                    }}
                    aria-label={`Increase ${exercise.name} weight`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Set reps inputs */}
              <div style={{ padding: '0 16px 14px' }}>
                <div className="section-label" style={{ marginBottom: '6px', fontSize: '0.65rem' }}>Reps per set</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: item.sets }, (_, i) => {
                    const repVal = setReps[item.exerciseId]?.[i] ?? '';
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={String(item.reps)}
                          value={repVal}
                          onChange={(e) => handleRepChange(item.exerciseId, i, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 8px',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--bg-input))',
                            border: '1.5px solid transparent',
                            color: 'hsl(var(--text-primary))',
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            fontVariantNumeric: 'tabular-nums',
                            outline: 'none',
                          }}
                        />
                        <span style={{
                          textAlign: 'center',
                          fontSize: '0.65rem',
                          color: 'hsl(var(--text-muted))',
                          fontWeight: 600,
                        }}>
                          Set {i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Duration */}
      <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Duration (optional)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 45"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'hsl(var(--bg-input))',
              border: '1.5px solid transparent',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontWeight: 500 }}>minutes</span>
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Notes (optional)</div>
        <textarea
          placeholder="How did the session go?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'hsl(var(--bg-input))',
            border: '1.5px solid transparent',
            color: 'hsl(var(--text-primary))',
            fontSize: '0.85rem',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {/* Save button */}
      <button
        className="btn-primary"
        onClick={handleSave}
        style={{ marginBottom: '16px' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Save Workout
      </button>
    </div>
  );
}
