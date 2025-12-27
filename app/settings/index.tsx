import React, {useCallback, useState} from "react";
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import {ExerciseFormModal} from "@/components/ExerciseFormModal";
import {Ionicons} from "@expo/vector-icons";
import {Exercise} from "@/data/types";
import {useFocusEffect} from "@react-navigation/native";
import {loadExercises} from "@/data/dataUtils";
import {ExerciseSearchModal} from "@/components/ExerciseSearchModal";

export default function SettingsScreen() {
    const [exerciseFormVisible, setExerciseFormVisible] = useState(false);
    const [exerciseSearchModalVisible, setExerciseSearchModalVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
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
            <Text style={styles.title}>Exercise Management</Text>
            <View style={styles.settingsRow}>
                <TouchableOpacity
                    onPress={handleAddNewExercise}
                    style={styles.button}
                >
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
        fontSize: 18,
        fontWeight: '600',
        color: '#111827'
    },
    settingsRow: {
        flexDirection: 'row',
        gap: 10
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#007AFF'
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14
    }
});
