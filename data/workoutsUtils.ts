import AsyncStorage from '@react-native-async-storage/async-storage';
import {ExerciseHistory, WorkoutDTO, WorkoutSetDTO} from "@/data/types";

export const WORKOUTS_KEY = 'workouts';

export const loadWorkouts = async (): Promise<WorkoutDTO[]> => {
    const json = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!json) return [];
    return JSON.parse(json) as WorkoutDTO[];
};

export const saveWorkouts = async (workouts: WorkoutDTO[]) => {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
};

export const saveNewWorkout = async (newWorkout: WorkoutDTO): Promise<WorkoutDTO> => {
    const workouts = await loadWorkouts();
    const nextId = workouts.length ? Math.max(...workouts.map(w => w.id)) + 1 : 1;

    newWorkout = {
        ...newWorkout,
        id: nextId
    };

    const updated = [...workouts, newWorkout];
    await saveWorkouts(updated);
    return newWorkout;
};

export const updateWorkout = async (updatedWorkout: WorkoutDTO): Promise<WorkoutDTO> => {
    const workouts = await loadWorkouts();

    // Replace existing workout with same ID, or add as new if ID doesn't exist
    const updatedWorkouts = workouts.map(w =>
        w.id === updatedWorkout.id ? updatedWorkout : w
    );

    // add as new (fallback)
    if (!updatedWorkouts.some(w => w.id === updatedWorkout.id)) {
        updatedWorkouts.push(updatedWorkout);
    }

    await saveWorkouts(updatedWorkouts);
    return updatedWorkout;
};

export const deleteWorkout = async (workoutId: number): Promise<void> => {
    const workouts = await loadWorkouts();
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    await saveWorkouts(updatedWorkouts);
};

export const getExerciseHistory = async (exerciseId: number): Promise<ExerciseHistory> => {
    const workouts = await loadWorkouts();

    const relevantWorkouts = workouts
        .filter(w => w.exercises.some(e => e.id === exerciseId))
        .sort((a, b) => b.created_date - a.created_date);

    const recentWorkouts = relevantWorkouts.slice(0, 4);

    // Find PR set across all workouts
    let prSet: WorkoutSetDTO | null = null;
    let maxWeight = -1;

    for (const workout of relevantWorkouts) {
        const exerciseInstance = workout.exercises.find(e => e.id === exerciseId);
        if (exerciseInstance) {
            for (const set of exerciseInstance.sets) {
                if (set.weight > maxWeight) {
                    maxWeight = set.weight;
                    prSet = set;
                }
            }
        }
    }

    return {
        prSet,
        recentWorkouts,
    };
};