/**
 * Rounds weight to the nearest increment (default 5 for lbs, 2.5 for kg)
 */
export function roundWeight(weight, increment = 5) {
  return Math.round(weight / increment) * increment;
}

/**
 * Calculates warmup sets based on working weight.
 * Protocol:
 * 1. 2x5 @ Empty Bar (45lbs / 20kg)
 * 2. 1x5 @ 40% (approx)
 * 3. 1x3 @ 60% (approx)
 * 4. 1x2 @ 80% (approx)
 * 
 * Note: The exact Starting Strength warmup formula often uses strict percentages 
 * of the difference between bar and work weight, but simplistic percentages 
 * work well for a general app.
 * 
 * Using SS specific "jump" logic:
 * Target = Work Weight
 * Bar = 45
 * Gap = Target - Bar
 * Set 1: Bar
 * Set 2: Bar + (Gap * 0.25) -> 5 reps
 * Set 3: Bar + (Gap * 0.50) -> 3 reps
 * Set 4: Bar + (Gap * 0.75) -> 2 reps
 */
export function calculateWarmup(workWeight, unit = 'lbs') {
  const isMetric = unit === 'kg';
  const barWeight = isMetric ? 20 : 45;
  const increment = isMetric ? 2.5 : 5;

  if (workWeight <= barWeight) return [];

  const sets = [];
  
  // Empty bar sets
  sets.push({ weight: barWeight, reps: 5, sets: 2, type: 'warmup' });

  const gap = workWeight - barWeight;
  
  // If the gap is small, we might not need all warmups
  const minGap = isMetric ? 10 : 20;

  if (workWeight > barWeight + minGap) {
      const w1 = roundWeight(barWeight + (gap * 0.25), increment);
      const w2 = roundWeight(barWeight + (gap * 0.50), increment);
      const w3 = roundWeight(barWeight + (gap * 0.75), increment);

      // Filter out duplicate weights if they round to the same thing
      const warmups = [
          { weight: w1, reps: 5, sets: 1, type: 'warmup' },
          { weight: w2, reps: 3, sets: 1, type: 'warmup' },
          { weight: w3, reps: 2, sets: 1, type: 'warmup' }
      ];

      // Dedup logic: only add if significantly heavier than previous
      let lastWeight = barWeight;
      warmups.forEach(set => {
          if (set.weight > lastWeight && set.weight < workWeight) {
              sets.push(set);
              lastWeight = set.weight;
          }
      });
  }

  return sets;
}
