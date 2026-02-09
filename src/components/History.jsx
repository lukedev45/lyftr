import { useMemo, useState } from 'react';
import { EXERCISES, ROUTINES } from '../logic/startingStrength';
import { ContributionGraph } from './ContributionGraph';

// Simple inline sparkline component
function Sparkline({ data, color = 'hsl(var(--primary))' }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight last point */}
      {data.length > 0 && (() => {
        const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - 2 * padding);
        const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding);
        return <circle cx={lastX} cy={lastY} r="3" fill={color} />;
      })()}
    </svg>
  );
}

export function History({ history, unit }) {
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Get weight progression per exercise
  const progressData = useMemo(() => {
    const exerciseData = {};
    const exerciseIds = ['squat', 'bench', 'press', 'deadlift'];

    exerciseIds.forEach(id => {
      exerciseData[id] = [];
    });

    // Extract weights from history that has weights stored
    history.forEach(session => {
      if (session.weights) {
        Object.keys(session.weights).forEach(id => {
          if (exerciseData[id] !== undefined) {
            exerciseData[id].push({
              weight: session.weights[id],
              date: session.date,
              type: session.type,
            });
          }
        });
      }
    });

    return exerciseData;
  }, [history]);

  // Get PRs per exercise
  const prs = useMemo(() => {
    const result = {};
    Object.keys(progressData).forEach(id => {
      const weights = progressData[id].map(d => d.weight);
      result[id] = weights.length > 0 ? Math.max(...weights) : null;
    });
    return result;
  }, [progressData]);

  // Session list (most recent first)
  const sessions = useMemo(() => {
    return [...history].reverse();
  }, [history]);

  const exerciseList = Object.values(EXERCISES);

  return (
    <div className="animate-fade-in">
      <header style={{ padding: '24px 0 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Progress
        </h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginTop: '2px' }}>
          {history.length} total sessions
        </p>
      </header>

      {/* Activity Heatmap */}
      <section style={{ marginBottom: '24px' }}>
        <div className="section-label">Activity</div>
        <ContributionGraph history={history} />
      </section>

      {/* Lift Progress Cards */}
      <section style={{ marginBottom: '24px' }}>
        <div className="section-label">Lift progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {exerciseList.map(exercise => {
            const data = progressData[exercise.id] || [];
            const weights = data.map(d => d.weight);
            const pr = prs[exercise.id];
            const isSelected = selectedExercise === exercise.id;

            return (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(isSelected ? null : exercise.id)}
                className="card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid hsl(var(--primary) / 0.4)' : undefined,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                    {exercise.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    {pr !== null ? (
                      <>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                          color: 'hsl(var(--text-primary))',
                        }}>
                          {pr}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                          {unit} PR
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>No data yet</span>
                    )}
                  </div>
                </div>
                {weights.length >= 2 && (
                  <Sparkline data={weights} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected exercise detail */}
      {selectedExercise && progressData[selectedExercise]?.length > 0 && (
        <section style={{ marginBottom: '24px' }} className="animate-fade-in">
          <div className="section-label">
            {exerciseList.find(e => e.id === selectedExercise)?.name} history
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...progressData[selectedExercise]].reverse().slice(0, 10).map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < 9 ? '1px solid hsl(var(--bg-input))' : 'none',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                      Workout {entry.type}
                    </span>
                  </div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontVariantNumeric: 'tabular-nums',
                    color: entry.weight === prs[selectedExercise] ? 'hsl(var(--primary))' : 'hsl(var(--text-primary))',
                  }}>
                    {entry.weight} {unit}
                    {entry.weight === prs[selectedExercise] && (
                      <span style={{
                        marginLeft: '6px',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        PR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Sessions */}
      <section style={{ marginBottom: '24px' }}>
        <div className="section-label">Recent sessions</div>
        {sessions.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>No workouts yet. Start training!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.slice(0, 15).map((session, i) => {
              const date = new Date(session.date);
              const exercises = ROUTINES[session.type] || [];

              return (
                <div key={i} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '1.1rem', fontWeight: 800,
                        color: 'hsl(var(--primary))',
                        letterSpacing: '-0.02em',
                      }}>
                        {session.type}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {session.duration && (
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                        {session.duration} min
                      </span>
                    )}
                  </div>

                  {/* Exercise pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {exercises.map(item => {
                      const ex = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
                      const weight = session.weights ? session.weights[item.exerciseId] : null;
                      return (
                        <div
                          key={item.exerciseId}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'hsl(var(--bg-input))',
                            fontSize: '0.75rem',
                            color: 'hsl(var(--text-secondary))',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {ex.name} {weight ? `${weight}${session.unit || unit}` : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
