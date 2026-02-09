import { useState, useEffect, useCallback, useRef } from 'react';
import { formatRestTime, getRpeColor } from '../logic/rpe';

export function RestTimer({ onDismiss, suggestedDuration, rpe }) {
  const [duration, setDuration] = useState(suggestedDuration || 180);
  const [remaining, setRemaining] = useState(suggestedDuration || 180);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  // Update when suggested duration changes
  useEffect(() => {
    if (suggestedDuration) {
      setDuration(suggestedDuration);
      setRemaining(suggestedDuration);
      setIsRunning(true);
    }
  }, [suggestedDuration]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining]);

  const progress = ((duration - remaining) / duration) * 100;

  const handleSetDuration = (d) => {
    setDuration(d);
    setRemaining(d);
    setIsRunning(true);
  };

  const rpeColor = rpe ? getRpeColor(rpe) : 'hsl(var(--primary))';

  return (
    <div className="rest-timer-bar animate-fade-in">
      <div className="rest-timer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'hsl(var(--text-muted))',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              Rest
            </span>
            {rpe && (
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: rpeColor,
                whiteSpace: 'nowrap',
              }}>
                RPE {rpe}
              </span>
            )}
          </div>

          <div className="timer-display" style={{
            ...(remaining === 0 ? { animation: 'none', color: 'hsl(var(--success))' } : {}),
            color: remaining === 0 ? 'hsl(var(--success))' : rpeColor,
          }}>
            {remaining === 0 ? 'GO' : formatRestTime(remaining)}
          </div>

          <div className="timer-progress">
            <div className="timer-progress-fill" style={{
              width: `${progress}%`,
              background: rpeColor,
            }} />
          </div>
        </div>

        {/* Quick duration pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[90, 180, 300].map(d => (
            <button
              key={d}
              onClick={() => handleSetDuration(d)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 600,
                background: duration === d ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--bg-elevated))',
                color: duration === d ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                whiteSpace: 'nowrap',
              }}
            >
              {d < 60 ? `${d}s` : `${d / 60}m`}
            </button>
          ))}
        </div>

        <button
          onClick={onDismiss}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'hsl(var(--text-secondary))',
            background: 'hsl(var(--bg-elevated))',
            marginLeft: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
