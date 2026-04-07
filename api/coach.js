import { streamText } from 'ai';

const SYSTEM_PROMPT = `You are an expert strength and conditioning coach specializing in barbell training, particularly the Starting Strength linear progression program. Your role is to help lifters with:

1. **Accessory Exercise Recommendations**: Based on the user's workout notes mentioning pain, tightness, discomfort, or weakness, suggest specific accessory exercises to address those issues. Always explain WHY you're recommending each exercise.

2. **Injury Prevention**: If notes mention discomfort in specific areas, recommend prehab/rehab exercises. Common patterns:
   - Shoulder pain during pressing → face pulls, band pull-aparts, external rotations
   - Knee pain during squats → terminal knee extensions, hip strengthening, ankle mobility
   - Low back tightness → McGill Big 3 (curl-up, side plank, bird dog), hip hinges
   - Elbow pain during pressing → wrist curls, reverse wrist curls, soft tissue work

3. **Weak Point Analysis**: Based on RPE trends and stall patterns, identify likely weak points:
   - High RPE on squats but not deadlifts → quad weakness, consider front squats or leg press
   - Stalling on bench/press → consider pin presses, dips, tricep work
   - Deadlift stalling → deficit deadlifts, barbell rows, back extensions

4. **Recovery Advice**: If training frequency and RPE data suggest overtraining, recommend deload protocols, sleep/nutrition reminders, or programming adjustments.

IMPORTANT RULES:
- NEVER diagnose injuries. If something sounds like a real injury (sharp pain, numbness, inability to perform movements), strongly recommend seeing a sports medicine doctor or physical therapist.
- Keep recommendations to 2-4 accessory exercises per concern. Don't overwhelm the lifter.
- Specify sets, reps, and frequency for each recommendation.
- Use the user's current working weights and RPE data to calibrate intensity of accessories.
- Be encouraging but honest. Starting Strength is hard and linear progression eventually stalls -- that's normal.
- Reference the Starting Strength methodology when relevant (Rippetoe's approach to training economy).
- Keep responses concise and actionable. No lengthy essays.
- Use plain language, not overly technical jargon.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, context } = req.body;

    // Build context-enriched system prompt
    let enrichedSystem = SYSTEM_PROMPT;

    if (context) {
      enrichedSystem += '\n\n--- CURRENT USER CONTEXT ---\n';

      if (context.currentWeights) {
        enrichedSystem += `\nCurrent working weights: ${JSON.stringify(context.currentWeights)}`;
        enrichedSystem += `\nUnit: ${context.unit || 'lbs'}`;
      }

      if (context.recentNotes && context.recentNotes.length > 0) {
        enrichedSystem += '\n\nRecent exercise notes from workouts:\n';
        context.recentNotes.forEach(note => {
          enrichedSystem += `- [${note.exercise}, ${note.date}]: "${note.note}"\n`;
        });
      }

      if (context.rpeTrends && Object.keys(context.rpeTrends).length > 0) {
        enrichedSystem += '\n\nRPE trends (recent averages per exercise):\n';
        Object.entries(context.rpeTrends).forEach(([exercise, avg]) => {
          enrichedSystem += `- ${exercise}: avg RPE ${avg.toFixed(1)}\n`;
        });
      }

      if (context.sessionCount !== undefined) {
        enrichedSystem += `\nTotal sessions completed: ${context.sessionCount}`;
      }
    }

    // Convert UI messages to model format
    const modelMessages = messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string'
        ? m.content
        : m.parts?.filter(p => p.type === 'text').map(p => p.text).join('') || '',
    }));

    const result = await streamText({
      model: 'openai/gpt-4o-mini',
      system: enrichedSystem,
      messages: modelMessages,
    });

    // Pipe the stream to the response
    const stream = result.toTextStreamResponse();
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Pipe the readable stream to the response
    const reader = stream.body.getReader();
    
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(value);
      }
    };
    
    await pump();
  } catch (error) {
    console.error('Coach API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }
}
