export const EXERCISES = {
  SQUAT: { id: 'squat', name: 'Squat', increment: 5 },
  BENCH: { id: 'bench', name: 'Bench Press', increment: 5 },
  PRESS: { id: 'press', name: 'Overhead Press', increment: 2.5 }, // Micro-loading common
  DEADLIFT: { id: 'deadlift', name: 'Deadlift', increment: 10 },
};

export const WORKOUT_TYPES = {
  A: 'A',
  B: 'B'
};

export const ROUTINES = {
  [WORKOUT_TYPES.A]: [
      { exerciseId: 'squat', sets: 3, reps: 5 },
      { exerciseId: 'press', sets: 3, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 } // Deadlift is 1x5
  ],
  [WORKOUT_TYPES.B]: [
      { exerciseId: 'squat', sets: 3, reps: 5 },
      { exerciseId: 'bench', sets: 3, reps: 5 },
      { exerciseId: 'deadlift', sets: 1, reps: 5 }
  ]
};

/**
* Returns the next workout type based on the previous one.
* Order: A -> B -> A -> B
*/
export function getNextWorkoutType(lastType) {
  return lastType === WORKOUT_TYPES.A ? WORKOUT_TYPES.B : WORKOUT_TYPES.A;
}
