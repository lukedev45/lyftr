import { useMemo } from 'react';
import { EXERCISES, ROUTINES } from '../logic/startingStrength';
import { ContributionGraph } from './ContributionGraph';

export function Dashboard({ nextType, weights, onWeightChange, onStartWorkout, onAddPastWorkout, history, unit }) {
  const routine = ROUTINES[nextType];

  const stats = useMemo(() => {
    const totalSessions = history.length;

    // Calculate streak (consecutive weeks with at least 1 session)
    let streak = 0;
    if (totalSessions > 0) {
      const now = new Date();
      const oneDay = 86400000;
      // Count consecutive days going back that have sessions within 3 day gaps
      const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      const lastDate = new Date(sorted[0].date);
      const daysSinceLast = Math.floor((now - lastDate) / oneDay);

      if (daysSinceLast <= 3) {
        streak = 1;
        for (let i = 1; i < sorted.length; i++) {
          const gap = Math.floor((new Date(sorted[i - 1].date) - new Date(sorted[i].date)) / oneDay);
          if (gap <= 4) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Days since last workout
    let daysSinceLast = null;
    if (totalSessions > 0) {
      const last = new Date(history[history.length - 1].date);
      daysSinceLast = Math.floor((new Date() - last) / 86400000);
    }

    return { totalSessions, streak, daysSinceLast };
  }, [history]);

  const increment = unit === 'kg' ? 2.5 : 5;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ padding: '24px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Lyftr<span style={{ color: 'hsl(var(--primary))' }}>.</span>
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginTop: '2px' }}>Strength made simple</p>
        </div>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }} className="stagger">
        <div className="card animate-fade-in-up" style={{ flex: 1, padding: '16px' }}>
          <div className="stat-number">{stats.totalSessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="card animate-fade-in-up" style={{ flex: 1, padding: '16px' }}>
          <div className="stat-number">{stats.streak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="card animate-fade-in-up" style={{ flex: 1, padding: '16px' }}>
          <div className="stat-number" style={{ color: stats.daysSinceLast !== null && stats.daysSinceLast <= 1 ? 'hsl(var(--success))' : undefined }}>
            {stats.daysSinceLast !== null ? stats.daysSinceLast : '--'}
          </div>
          <div className="stat-label">Days rest</div>
        </div>
      </div>

      {/* Workout Preview Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '4px' }}>Next workout</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'hsl(var(--primary))' }}>
                {nextType}
              </span>
            </div>
          </div>
          <div className="pill pill-primary">
            {routine.length} exercises
          </div>
        </div>

        {/* Exercise weight steppers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {routine.map((item) => {
            const exercise = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
            return (
              <div
                key={item.exerciseId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'hsl(var(--bg-input))',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                    {exercise.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    {item.sets}x{item.reps}
                  </div>
                </div>

                {/* Stepper control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => onWeightChange(item.exerciseId, Math.max(0, weights[item.exerciseId] - increment))}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'hsl(var(--bg-elevated))',
                      color: 'hsl(var(--text-secondary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      transition: 'var(--transition-fast)',
                    }}
                    aria-label={`Decrease ${exercise.name} weight`}
                  >
                    -
                  </button>
                  <div style={{
                    minWidth: '72px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    color: 'hsl(var(--text-primary))',
                  }}>
                    {weights[item.exerciseId]}
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginLeft: '2px', fontWeight: 500 }}>{unit}</span>
                  </div>
                  <button
                    onClick={() => onWeightChange(item.exerciseId, weights[item.exerciseId] + increment)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'hsl(var(--bg-elevated))',
                      color: 'hsl(var(--text-secondary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      transition: 'var(--transition-fast)',
                    }}
                    aria-label={`Increase ${exercise.name} weight`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={onStartWorkout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start Workout {nextType}
        </button>

        <button
          className="btn-ghost"
          onClick={onAddPastWorkout}
          style={{
            width: '100%',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.8rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Log a past workout
        </button>
      </div>

      {/* Activity Heatmap */}
      <section style={{ marginBottom: '20px' }}>
        <div className="section-label">Recent activity</div>
        <ContributionGraph history={history} />
      </section>
    </div>
  );
}
