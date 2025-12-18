import AsyncStorage from '@react-native-async-storage/async-storage';
import {exerciseSeedData} from "@/data/data";
import {Exercise} from "@/data/types";

const EXERCISES_KEY = 'exercises';

export const seedExercisesIfEmpty = async () => {
    const existing = await AsyncStorage.getItem(EXERCISES_KEY);
    if (existing) return;

    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exerciseSeedData));
};

export const loadExercises = async (): Promise<Exercise[]> => {
    const json = await AsyncStorage.getItem(EXERCISES_KEY);
    if (!json) return [];
    return JSON.parse(json) as Exercise[];
};

export const dumpAsyncStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    console.log('AsyncStorage dump:', Object.fromEntries(entries));
};

export const clearAsyncStorage = async () => {
    await AsyncStorage.clear()
};
