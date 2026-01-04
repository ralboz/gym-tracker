import {Paths, File} from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import {Exercise, WorkoutDTO} from "@/data/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {EXERCISES_KEY} from "@/data/dataUtils";
import {WORKOUTS_KEY} from "@/data/workoutsUtils";
import * as Sharing from 'expo-sharing';

export const exportData = async (): Promise<void> => {
    try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `gym-backup-${timestamp}.json`;

        const path = `${Paths.cache.uri}${filename}`;
        const file = new File(path);

        const exercisesJson = await AsyncStorage.getItem(EXERCISES_KEY);
        const workoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY);
        const exercises: Exercise[] = exercisesJson ? JSON.parse(exercisesJson) : [];
        const workouts: WorkoutDTO[] = workoutsJson ? JSON.parse(workoutsJson) : [];

        const backup: GymBackup = {
            version: 1,
            timestamp: Date.now(),
            exercises,
            workouts,
        };

        file.create({overwrite: true});
        file.write(JSON.stringify(backup, null, 2));

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: `Save ${filename}`,
                UTI: 'public.json'
            });
        }
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
};



export interface GymBackup {
    version: 1;
    timestamp: number;
    exercises: Exercise[];
    workouts: WorkoutDTO[];
}

export const importData = async (): Promise<boolean> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
        if (result.canceled || !result.assets || result.assets.length === 0) {
            throw new Error('Import cancelled');
        }

        const asset = result.assets[0];
        const file = new File(asset.uri);
        console.log(file.textSync())

        const backup: GymBackup = JSON.parse(file.textSync() as string);

        // Validate structure
        if (backup.version !== 1 || !Array.isArray(backup.exercises) || !Array.isArray(backup.workouts)) {
            throw new Error('Invalid backup format');
        }

        await AsyncStorage.multiRemove(['exercises', 'workouts']);

        // Remapping IDs to avoid conflicts (reset to sequential)
        const exercises = backup.exercises.map((ex, index) => ({ ...ex, id: index + 1 }));
        const workouts = backup.workouts.map((w, index) => ({ ...w, id: index + 1 }));

        await AsyncStorage.setItem('exercises', JSON.stringify(exercises));
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));

        console.log('Import successful');
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
};