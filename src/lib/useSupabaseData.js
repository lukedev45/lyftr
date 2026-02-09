import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

/**
 * Hook to manage all Supabase data: profile, workouts, and sets.
 * Falls back to localStorage if Supabase is unavailable.
 */
export function useSupabaseData(session) {
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);

  // Profile / weights
  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('lyftr_weights');
    return saved ? JSON.parse(saved) : { squat: 135, bench: 95, press: 65, deadlift: 225 };
  });

  // Workout history
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('lyftr_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Unit preference
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('lyftr_unit') || 'lbs';
  });

  // Load data from Supabase on mount
  useEffect(() => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile) {
          if (profile.current_weights) {
            setWeights(profile.current_weights);
          }
          if (profile.unit_preference) {
            setUnit(profile.unit_preference);
          }
        }

        // Load workouts with sets
        const { data: workouts } = await supabase
          .from('workouts')
          .select(`
            *,
            workout_sets (*),
            exercise_notes (*)
          `)
          .eq('user_id', userId)
          .order('workout_date', { ascending: true });

        if (workouts && workouts.length > 0) {
          const historyEntries = workouts.map(w => ({
            id: w.id,
            type: w.workout_type,
            date: w.workout_date,
            duration: w.duration_minutes,
            notes: w.notes,
            weights: w.workout_sets?.reduce((acc, s) => {
              if (!s.is_warmup) {
                acc[s.exercise_id] = s.weight;
              }
              return acc;
            }, {}) || {},
            sets: w.workout_sets || [],
            exerciseNotes: w.exercise_notes || [],
            unit: w.workout_sets?.[0]?.unit || 'lbs',
          }));
          setHistory(historyEntries);
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Save weights to Supabase + localStorage
  const updateWeights = useCallback(async (newWeights) => {
    setWeights(newWeights);
    localStorage.setItem('lyftr_weights', JSON.stringify(newWeights));

    if (supabase && userId) {
      await supabase
        .from('profiles')
        .update({ current_weights: newWeights })
        .eq('id', userId);
    }
  }, [userId]);

  // Save unit preference
  const updateUnit = useCallback(async (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('lyftr_unit', newUnit);

    if (supabase && userId) {
      await supabase
        .from('profiles')
        .update({ unit_preference: newUnit })
        .eq('id', userId);
    }
  }, [userId]);

  // Save a completed workout to Supabase
  const saveWorkout = useCallback(async (workoutData) => {
    const localEntry = {
      ...workoutData,
      date: workoutData.date || new Date().toISOString(),
      unit,
    };

    // Update local state immediately
    setHistory(prev => {
      const next = [...prev, localEntry];
      localStorage.setItem('lyftr_history', JSON.stringify(next));
      return next;
    });

    // Also persist weights
    localStorage.setItem('lyftr_weights', JSON.stringify(workoutData.weights || weights));

    if (!supabase || !userId) return localEntry;

    try {
      // Create workout row
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          workout_type: workoutData.type,
          workout_date: localEntry.date,
          duration_minutes: workoutData.duration || null,
          completed: true,
          notes: workoutData.notes || null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert sets
      if (workoutData.setsData && workoutData.setsData.length > 0) {
        const setsToInsert = workoutData.setsData.map(s => ({
          workout_id: workout.id,
          user_id: userId,
          exercise_id: s.exerciseId,
          set_number: s.setNumber,
          weight: s.weight,
          target_reps: s.targetReps,
          completed_reps: s.completedReps,
          rpe: s.rpe || null,
          is_warmup: s.isWarmup || false,
          unit,
        }));

        await supabase.from('workout_sets').insert(setsToInsert);
      }

      // Insert exercise notes
      if (workoutData.exerciseNotes && workoutData.exerciseNotes.length > 0) {
        const notesToInsert = workoutData.exerciseNotes
          .filter(n => n.note && n.note.trim())
          .map(n => ({
            workout_id: workout.id,
            user_id: userId,
            exercise_id: n.exerciseId,
            note: n.note.trim(),
          }));

        if (notesToInsert.length > 0) {
          await supabase.from('exercise_notes').insert(notesToInsert);
        }
      }

      // Update profile weights
      await supabase
        .from('profiles')
        .update({ current_weights: workoutData.weights || weights })
        .eq('id', userId);

      localEntry.id = workout.id;
    } catch (err) {
      console.error('Failed to save workout to Supabase:', err);
    }

    return localEntry;
  }, [userId, unit, weights]);

  return {
    loading,
    weights,
    setWeights: updateWeights,
    history,
    unit,
    setUnit: updateUnit,
    saveWorkout,
  };
}
