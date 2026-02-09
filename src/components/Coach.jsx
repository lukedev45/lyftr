import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { EXERCISES } from '../logic/startingStrength';

/**
 * AI Coach chat panel that reads workout context and
 * streams responses from /api/coach.
 */
export function Coach({ history, weights, unit }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Build workout context for the AI
  const context = useMemo(() => {
    // Collect recent exercise notes
    const recentNotes = [];
    const recentSessions = [...history].reverse().slice(0, 15);

    recentSessions.forEach(session => {
      if (session.exerciseNotes) {
        session.exerciseNotes.forEach(note => {
          const exercise = Object.values(EXERCISES).find(e => e.id === note.exercise_id || e.id === note.exerciseId);
          recentNotes.push({
            exercise: exercise?.name || note.exercise_id || note.exerciseId,
            date: new Date(session.date).toLocaleDateString(),
            note: note.note,
          });
        });
      }
    });

    // Calculate RPE trends from sets data
    const rpeTrends = {};
    recentSessions.forEach(session => {
      if (session.sets) {
        session.sets.forEach(set => {
          if (set.rpe && !set.is_warmup && !set.isWarmup) {
            const id = set.exercise_id || set.exerciseId;
            if (!rpeTrends[id]) rpeTrends[id] = [];
            rpeTrends[id].push(set.rpe);
          }
        });
      }
    });

    // Average the RPE values
    const rpeAverages = {};
    Object.entries(rpeTrends).forEach(([id, values]) => {
      const exercise = Object.values(EXERCISES).find(e => e.id === id);
      const name = exercise?.name || id;
      rpeAverages[name] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    return {
      currentWeights: weights,
      unit,
      recentNotes,
      rpeTrends: rpeAverages,
      sessionCount: history.length,
    };
  }, [history, weights, unit]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message for streaming
    const assistantMessage = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMessage]);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      console.error('Coach error:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I had trouble generating a response. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Suggested prompts
  const suggestions = [
    'What accessories would help my squat?',
    'My shoulders feel tight after pressing',
    'How should I handle a stall on bench?',
    'Suggest a deload protocol',
  ];

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100dvh - var(--nav-height) - 16px)',
    }}>
      {/* Header */}
      <header style={{ padding: '24px 0 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Coach
        </h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginTop: '2px' }}>
          AI-powered training advice
        </p>
      </header>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingBottom: '16px',
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'hsl(var(--primary) / 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ textAlign: 'center', maxWidth: '280px' }}>
              <p style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'hsl(var(--text-primary))',
                marginBottom: '4px',
              }}>
                Ask your coach anything
              </p>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>
                {"I'll analyze your workout history, RPE trends, and notes to give personalized accessory exercise and recovery suggestions."}
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              maxWidth: '360px',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="animate-fade-in-up"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '100px',
                    background: 'hsl(var(--bg-card))',
                    border: '1px solid hsl(var(--bg-elevated))',
                    color: 'hsl(var(--text-secondary))',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'var(--transition-fast)',
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user'
                  ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                  : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                background: msg.role === 'user'
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--bg-card))',
                color: msg.role === 'user'
                  ? 'hsl(220 14% 6%)'
                  : 'hsl(var(--text-primary))',
                border: msg.role === 'user' ? 'none' : '1px solid hsl(var(--bg-elevated))',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.content}
                {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '14px',
                    background: 'hsl(var(--primary))',
                    marginLeft: '2px',
                    animation: 'timer-pulse 0.8s ease-in-out infinite',
                    verticalAlign: 'text-bottom',
                    borderRadius: '1px',
                  }} />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 0',
          borderTop: '1px solid hsl(var(--bg-elevated))',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about exercises, pain, stalls..."
          disabled={isStreaming}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--bg-elevated))',
            color: 'hsl(var(--text-primary))',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'var(--transition-fast)',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: input.trim() && !isStreaming ? 'hsl(var(--primary))' : 'hsl(var(--bg-elevated))',
            color: input.trim() && !isStreaming ? 'hsl(220 14% 6%)' : 'hsl(var(--text-muted))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
