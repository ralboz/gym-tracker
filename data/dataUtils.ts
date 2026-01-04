import AsyncStorage from '@react-native-async-storage/async-storage';
import {exerciseSeedData} from "@/data/data";
import {Exercise} from "@/data/types";

export const EXERCISES_KEY = 'exercises';

export const seedExercisesIfEmpty = async (): Promise<boolean> => {
    const existing = await AsyncStorage.getItem(EXERCISES_KEY);
    if (existing) return false;
    try {
        await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exerciseSeedData));
        return true;
    } catch (error) {
        console.error('Failed to seed exercises:', error);
        return false;
    }
};

export const loadExercises = async (): Promise<Exercise[]> => {
    const json = await AsyncStorage.getItem(EXERCISES_KEY);
    if (!json) return [];
    return JSON.parse(json) as Exercise[];
};

export const createExercise = async (exercise: Omit<Exercise, 'id'>) => {
    const currentExercises = await loadExercises();

    const maxId = currentExercises.length > 0
        ? Math.max(...currentExercises.map(ex => ex.id))
        : 0;
    const newId = maxId + 1;

    const exerciseWithId: Exercise = {
        ...exercise,
        id: newId
    };

    currentExercises.push(exerciseWithId);
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(currentExercises));
};

export const updateExercise = async (id: number, exerciseData: Omit<Exercise, 'id'>): Promise<void> => {
    try {
        const currentExercises = await loadExercises();
        const updatedExercises = currentExercises.map(ex =>
            ex.id === id
                ? { ...ex, ...exerciseData }
                : ex
        );
        await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(updatedExercises));
    } catch (error) {
        console.error('Failed to update exercise:', error);
        throw error;
    }
};

export const deleteExercise = async (exerciseId: number): Promise<void> => {
    try {
        const currentExercises = await loadExercises();
        const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);
        await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(updatedExercises));
    } catch (error) {
        console.error('Failed to delete exercise:', error);
        throw error;
    }
};

export const dumpAsyncStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    console.log('AsyncStorage dump:', Object.fromEntries(entries));
};

export const clearAsyncStorage = async (): Promise<boolean> => {
    try{
        await AsyncStorage.clear();
        return true;
    } catch(error) {
        console.error('Failed to clear storage:', error);
        return false;
    }
};
