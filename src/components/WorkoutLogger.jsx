import { useState } from 'react';
import { EXERCISES, ROUTINES } from '../logic/startingStrength';
import { ExerciseCard } from './ExerciseCard';

export function WorkoutLogger({ type, onComplete }) {
  // Mock initial weights - in real app, load from history
  const [weights, setWeights] = useState({
    [EXERCISES.SQUAT.id]: 135,
    [EXERCISES.BENCH.id]: 95,
    [EXERCISES.PRESS.id]: 65,
    [EXERCISES.DEADLIFT.id]: 225
  });

  const routine = ROUTINES[type];

  const handleWeightChange = (id, newWeight) => {
    setWeights(prev => ({
      ...prev,
      [id]: newWeight
    }));
  };

  return (
    <div className="workout-logger">
      <div style={{ marginBottom: '2rem' }}>
        {routine.map((item, index) => {
          const exercise = Object.values(EXERCISES).find(e => e.id === item.exerciseId);
          return (
            <ExerciseCard
              key={item.exerciseId}
              exercise={exercise}
              sets={item.sets}
              reps={item.reps}
              targetWeight={weights[item.exerciseId]}
              onWeightChange={(w) => handleWeightChange(item.exerciseId, w)}
            />
          );
        })}
      </div>

      <button className="btn-primary" onClick={() => onComplete({ type, date: new Date().toISOString() })}>
        Finish Workout
      </button>
    </div>
  );
}
