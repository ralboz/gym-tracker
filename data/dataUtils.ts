import { exerciseSeedData } from "@/data/data";
import { Exercise } from "@/data/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MIGRATION_KEY = 'muscle_group_migration_v1';

const MUSCLE_GROUP_REMAP: Record<string, string> = {
    'obliques': 'abs',
    'hip_flexors': 'abs',
    'core': 'abs',
    'posterior_chain': 'back',
    'full_body': 'full body',
    'rear_delts': 'rear delts',
};

const remapMuscleGroup = (group: string | null): string | null => {
    if (!group) return null;
    return MUSCLE_GROUP_REMAP[group] ?? group;
};

// migration script due to change of muscle groups
export const migrateMuscleGroups = async (): Promise<void> => {
    const alreadyRun = await AsyncStorage.getItem(MIGRATION_KEY);
    if (alreadyRun) return;

    try {
        const exercisesJson = await AsyncStorage.getItem(EXERCISES_KEY);
        if (exercisesJson) {
            const exercises = JSON.parse(exercisesJson);
            const migrated = exercises.map((ex: any) => ({
                ...ex,
                primary_muscle_group_id: remapMuscleGroup(ex.primary_muscle_group_id) ?? ex.primary_muscle_group_id,
                secondary_muscle_group_id: remapMuscleGroup(ex.secondary_muscle_group_id),
            }));
            await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(migrated));
        }

        const workoutsJson = await AsyncStorage.getItem('workouts');
        if (workoutsJson) {
            const workouts = JSON.parse(workoutsJson);
            const migrated = workouts.map((w: any) => ({
                ...w,
                exercises: w.exercises.map((ex: any) => ({
                    ...ex,
                    primary_muscle_group_id: remapMuscleGroup(ex.primary_muscle_group_id) ?? ex.primary_muscle_group_id,
                    secondary_muscle_group_id: remapMuscleGroup(ex.secondary_muscle_group_id),
                })),
            }));
            await AsyncStorage.setItem('workouts', JSON.stringify(migrated));
        }

        await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    } catch (error) {
        console.error('Muscle group migration failed:', error);
    }
};
