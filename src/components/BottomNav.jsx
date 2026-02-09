export function BottomNav({ activeTab, onTabChange, hasActiveWorkout }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        <button
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>

        <button
          className={`nav-tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => onTabChange('workout')}
          aria-label="Workout"
          aria-current={activeTab === 'workout' ? 'page' : undefined}
          style={{ position: 'relative' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11" />
            <path d="M6.5 17.5h11" />
            <path d="M3 10v4" />
            <path d="M21 10v4" />
            <path d="M6.5 6.5v11" />
            <path d="M17.5 6.5v11" />
            <path d="M12 3v18" />
          </svg>
          {hasActiveWorkout && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '12px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'hsl(var(--primary))',
            }} />
          )}
          Workout
        </button>

        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
          aria-label="Progress"
          aria-current={activeTab === 'history' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Progress
        </button>

        <button
          className={`nav-tab ${activeTab === 'coach' ? 'active' : ''}`}
          onClick={() => onTabChange('coach')}
          aria-label="Coach"
          aria-current={activeTab === 'coach' ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Coach
        </button>
      </div>
    </nav>
  );
}
