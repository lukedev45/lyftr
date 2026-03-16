import { useMemo } from 'react';

export function ContributionGraph({ history }) {
  const { calendarData, months } = useMemo(() => {
    const today = new Date();
    const data = [];

    // Count sessions per date for intensity
    const dateCounts = {};
    history.forEach(h => {
      const key = new Date(h.date).toDateString();
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    });

    // Generate last 91 days (13 weeks) for a clean grid
    for (let i = 90; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      data.push({
        date: d,
        count: dateCounts[d.toDateString()] || 0
      });
    }

    // Extract unique months for labels
    const monthSet = [];
    let lastMonth = -1;
    data.forEach((day, idx) => {
      const month = day.date.getMonth();
      if (month !== lastMonth) {
        monthSet.push({
          label: day.date.toLocaleString('default', { month: 'short' }),
          column: Math.floor(idx / 7)
        });
        lastMonth = month;
      }
    });

    return { calendarData: data, months: monthSet };
  }, [history]);

  const getColor = (count) => {
    if (count === 0) return 'hsl(var(--bg-input))';
    if (count === 1) return 'hsl(var(--success) / 0.5)';
    return 'hsl(var(--success))';
  };

  return (
    <div className="card" style={{ padding: '16px', overflow: 'hidden' }}>
      {/* Month labels */}
      <div style={{
        display: 'flex',
        gap: '0px',
        marginBottom: '6px',
        paddingLeft: '0px',
        fontSize: '0.65rem',
        color: 'hsl(var(--text-muted))',
        fontWeight: 500,
        overflow: 'hidden',
      }}>
        {months.map((m, i) => (
          <span key={i} style={{
            position: 'relative',
            left: `${m.column * 14}px`,
          }}>
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(7, 1fr)',
        gridAutoFlow: 'column',
        gap: '3px',
      }}>
        {calendarData.map((day, i) => (
          <div
            key={i}
            title={`${day.date.toLocaleDateString()} - ${day.count} session${day.count !== 1 ? 's' : ''}`}
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '3px',
              backgroundColor: getColor(day.count),
              transition: 'var(--transition-fast)',
            }}
          />
        ))}
      </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.65rem',
        color: 'hsl(var(--text-muted))',
      }}>
        <span>Less</span>
        <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'hsl(var(--bg-input))' }} />
        <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'hsl(var(--success) / 0.5)' }} />
        <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'hsl(var(--success))' }} />
        <span>More</span>
      </div>
    </div>
  );
}
