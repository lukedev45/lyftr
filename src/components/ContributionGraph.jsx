import { useMemo } from 'react';

export function ContributionGraph({ history }) {
  // Simple visualization: Last 28 days (4 weeks)
  // 7 rows (days), 4 columns (weeks) or just a grid.
  // GitHub style is usually Columns = Weeks, Rows = Days (Sun-Sat).
  
  // Let's generate a grid for the last 12 weeks (approx 3 months) to look nice.
  
  const calendarData = useMemo(() => {
    const today = new Date();
    const data = [];
    const historyDates = new Set(history.map(h => new Date(h.date).toDateString()));

    // Generate last 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        data.push({
            date: d,
            active: historyDates.has(d.toDateString())
        });
    }
    return data;
  }, [history]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px', maxWidth: '100%' }}>
          {/* 
             This is a simplified linear view (just boxes). 
             For true GitHub style (weeks x days), we need CSS grid with 7 rows.
          */}
      </div>
      
      {/* 
         Better implementation: Grid with 7 rows (days) and autodata columns. 
         Let's try a standard flex wrap or grid for the boxes.
         Actually, let's stick to the GitHub layout: 
         Grid auto-flow column, 7 rows.
      */}
      <div style={{ 
          display: 'grid', 
          gridTemplateRows: 'repeat(7, 1fr)', 
          gridAutoFlow: 'column', 
          gap: '4px', 
          height: '100px', // Approx 7 * (10 + 4)
      }}>
          {calendarData.map((day, i) => (
              <div 
                  key={i}
                  title={day.date.toDateString()}
                  style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: day.active ? 'hsl(var(--success))' : 'hsl(var(--bg-input))'
                  }}
              />
          ))}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', gap: '5px', alignItems: 'center' }}>
          <span>Less</span>
          <div style={{ width: '10px', height: '10px', background: 'hsl(var(--bg-input))', borderRadius: '2px'}}></div>
          <div style={{ width: '10px', height: '10px', background: 'hsl(var(--success))', borderRadius: '2px'}}></div>
          <span>More</span>
      </div>
    </div>
  );
}
