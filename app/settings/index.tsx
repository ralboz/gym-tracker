import React, {useCallback, useState} from "react";
import {View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ExerciseFormModal} from "@/components/ExerciseFormModal";
import {ExerciseSearchModal} from "@/components/ExerciseSearchModal";
import {Exercise} from "@/data/types";
import {useFocusEffect} from "@react-navigation/native";
import {clearAsyncStorage, loadExercises, seedExercisesIfEmpty} from "@/data/dataUtils";
import { exportData, importData } from "@/data/backup";

export default function SettingsScreen() {
    const [exerciseFormVisible, setExerciseFormVisible] = useState(false);
    const [exerciseSearchModalVisible, setExerciseSearchModalVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const loadAvailableExercises = useCallback(async () => {
        try {
            const allExercises = await loadExercises();
            setAvailableExercises(allExercises);
        } catch (error) {
            console.error('Failed to load exercises:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAvailableExercises();
        }, [loadAvailableExercises])
    );

    const handleExportPress = useCallback(async () => {
        setExportLoading(true);
        try {
            await exportData();
            Alert.alert('Success', 'Backup saved');
        } catch (error) {
            Alert.alert('Export Failed', 'Please try again');
        } finally {
            setExportLoading(false);
        }
    }, []);

    const handleImportPress = useCallback(async () => {
        setImportLoading(true);
        try {
            await importData();
            Alert.alert('Success', 'Data imported successfully! App will refresh.');
            loadAvailableExercises(); // Refresh data
        } catch (error) {
            Alert.alert('Import Failed', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setImportLoading(false);
        }
    }, [loadAvailableExercises]);

    const handleSeedExercises = useCallback(async () => {
        const success = await seedExercisesIfEmpty();
        if(success) {
            Alert.alert('Success', 'Seeded exercises successfully! App will refresh.');
            loadAvailableExercises();
        } else {
            Alert.alert('Seeding Failed', 'Unable to seed, as u already have exercises.');
        }
    }, [loadAvailableExercises]);

    const handleClearData = useCallback(async () => {
        Alert.alert(
            `This action cannot be undone`,
            `Are you sure you want to clear all data?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: `Yes`,
                    style: 'destructive',
                    onPress: async () => {
                        const success = await clearAsyncStorage();
                        if(success)
                        {
                            Alert.alert('Success', 'All data cleared successfully! App will refresh.');
                            loadAvailableExercises();
                        } else {
                            Alert.alert('Failed', 'Unable to clear data.');
                        }
                    }
                }
            ]
        );
    }, [loadAvailableExercises]);

    const handleExerciseSelected = useCallback((exercise: Exercise) => {
        setSelectedExercise(exercise);
        setExerciseSearchModalVisible(false);
        setExerciseFormVisible(true);
    }, []);

    const handleAddNewExercise = useCallback(() => {
        setSelectedExercise(null);
        setExerciseFormVisible(true);
    }, []);

    const handleFormClose = useCallback(() => {
        setExerciseFormVisible(false);
        setSelectedExercise(null);
    }, []);

    const handleExerciseUpdated = useCallback(() => {
        loadAvailableExercises();
    }, [loadAvailableExercises]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <View style={styles.settingsRow}>
                    <TouchableOpacity onPress={handleAddNewExercise} style={styles.button}>
                        <Ionicons name="add-outline" size={20} color="#FFFFFF"/>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setExerciseSearchModalVisible(true)}
                        style={styles.button}
                    >
                        <Ionicons name="create-outline" size={20} color="#FFFFFF"/>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.settingsRow}>
                    <TouchableOpacity
                        onPress={handleSeedExercises}
                        style={[styles.button]}
                        disabled={exportLoading}
                    >
                        <Ionicons name="chevron-collapse-outline" size={20} color="#FFFFFF"/>
                        <Text style={styles.buttonText}>
                            Import Default Exercises
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Actions</Text>
                <View style={styles.settingsRow}>
                    <TouchableOpacity
                        onPress={handleExportPress}
                        style={[styles.button, exportLoading && styles.buttonDisabled]}
                        disabled={exportLoading}
                    >
                        {exportLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF"/>
                        ) : (
                            <Ionicons name="download-outline" size={20} color="#FFFFFF"/>
                        )}
                        <Text style={styles.buttonText}>
                            {exportLoading ? 'Exporting...' : 'Export Data'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleImportPress}
                        style={[styles.button, importLoading && styles.buttonDisabled]}
                        disabled={importLoading}
                    >
                        {importLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF"/>
                        ) : (
                            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF"/>
                        )}
                        <Text style={styles.buttonText}>
                            {importLoading ? 'Importing...' : 'Import Data'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.settingsRow}>
                    <TouchableOpacity
                        onPress={handleClearData}
                        style={[styles.button]}
                        disabled={exportLoading}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF"/>
                        <Text style={styles.buttonText}>
                            Clear all data
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ExerciseFormModal
                visible={exerciseFormVisible}
                onClose={handleFormClose}
                exerciseToEdit={selectedExercise}
                onExerciseUpdated={handleExerciseUpdated}
            />
            <ExerciseSearchModal
                visible={exerciseSearchModalVisible}
                availableExercises={availableExercises}
                onSelectExercise={handleExerciseSelected}
                onClose={() => setExerciseSearchModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20,
        marginTop: 60,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827'
    },
    section: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        gap: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    settingsRow: {
        flexDirection: 'row',
        gap: 12
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#007AFF'
    },
    buttonDisabled: {
        backgroundColor: '#92C5F6'
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
});
