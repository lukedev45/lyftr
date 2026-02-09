/**
 * RPE-based rest period recommendations.
 *
 * Based on:
 * - Helms et al. (2016) "RPE and Velocity-Based Training"
 * - NSCA Essentials of Strength Training guidelines
 * - Practical Programming for Strength Training (Rippetoe & Baker)
 *
 * RPE Scale (Borg CR-10 adapted for resistance training):
 *   6   - Very light (warmup)
 *   7   - Light, 3+ reps in reserve
 *   8   - Moderate, 2 reps in reserve
 *   9   - Hard, 1 rep in reserve
 *   9.5 - Very hard, maybe 1 more rep
 *  10   - Maximal effort, no reps in reserve
 */

/**
 * Returns suggested rest duration in seconds based on RPE.
 *
 * Higher RPE = more neuromuscular fatigue = longer rest needed
 * for compound barbell movements (squat, bench, press, deadlift).
 */
export function getRestDuration(rpe) {
  if (rpe <= 6) return 60;       // Warmup territory: 1 min
  if (rpe <= 7) return 120;      // Light: 2 min
  if (rpe <= 7.5) return 150;    // Moderate-light: 2.5 min
  if (rpe <= 8) return 180;      // Moderate: 3 min
  if (rpe <= 8.5) return 210;    // Moderate-hard: 3.5 min
  if (rpe <= 9) return 270;      // Hard: 4.5 min
  if (rpe <= 9.5) return 330;    // Very hard: 5.5 min
  return 420;                     // Maximal: 7 min
}

/**
 * RPE descriptors for the UI.
 */
export const RPE_LABELS = {
  6:   'Light warmup',
  7:   'Could do 3+ more',
  8:   'Could do 2 more',
  9:   'Could do 1 more',
  9.5: 'Maybe 1 more',
  10:  'All-out max',
};

/**
 * The RPE values we show in the quick-select UI.
 * We focus on 6-10 in half-point increments for the
 * range most relevant to work sets.
 */
export const RPE_OPTIONS = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

/**
 * Format seconds into M:SS string.
 */
export function formatRestTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Returns a color hue hint for RPE visualization.
 * Lower RPE = green (easy), higher = red (hard).
 */
export function getRpeColor(rpe) {
  if (rpe <= 7) return 'hsl(var(--success))';
  if (rpe <= 8) return 'hsl(var(--primary))';
  if (rpe <= 9) return 'hsl(var(--warning))';
  return 'hsl(var(--danger))';
}
