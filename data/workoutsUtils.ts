import AsyncStorage from '@react-native-async-storage/async-storage';
import {WorkoutDTO} from "@/data/types";

const WORKOUTS_KEY = 'workouts';

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
