import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutExerciseDTO, WorkoutSetDTO } from '@/data/types';

interface ExerciseCardProps {
    workoutExercise: WorkoutExerciseDTO;
    onDeleteExercise: (id: number) => void;
    onAddSet: (id: number) => void;
    onDeleteSet: (setId: number) => void;
    onEditSet: (
        workoutExercise: WorkoutExerciseDTO,
        set: WorkoutSetDTO,
        index: number,
        field: 'weight' | 'reps'
    ) => void;
    onShowNotes: (workoutExercise: WorkoutExerciseDTO) => void;
    onShowExerciseInfo: (workoutExercise: WorkoutExerciseDTO) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({workoutExercise, onDeleteExercise, onAddSet, onDeleteSet, onEditSet, onShowNotes, onShowExerciseInfo}) =>
{
    return (
        <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{workoutExercise.name}</Text>
                <TouchableOpacity
                    onPress={() => onDeleteExercise(workoutExercise.id)}
                    style={styles.deleteExerciseBtn}
                >
                    <Ionicons name="trash-sharp" size={20} color="#FF3B30"/>
                </TouchableOpacity>
            </View>

            <View style={styles.setsContainer}>
                {workoutExercise.sets.map((set, index) => (
                    <View key={set.id} style={styles.setRow}>
                        <View style={styles.setInfo}>
                            <Text style={{fontSize: 16, minWidth: 50}}>Set {index + 1}:</Text>
                            <TouchableOpacity
                                onPress={() => onEditSet(workoutExercise, set, index, 'weight')}
                            >
                                <Text style={styles.editableField}>{set.weight} kg</Text>
                            </TouchableOpacity>
                            <Text style={{fontSize: 16}}>×</Text>
                            <TouchableOpacity
                                onPress={() => onEditSet(workoutExercise, set, index, 'reps')}
                            >
                                <Text style={styles.editableField}>{set.reps} reps</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => onDeleteSet(set.id)}
                            style={styles.deleteSetBtn}
                        >
                            <Ionicons name="trash-sharp" size={16} color="#FF3B30"/>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    onPress={() => onAddSet(workoutExercise.id)}
                    style={styles.actionBtn}
                >
                    <Ionicons name="add" size={20} color="#007AFF"/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onShowNotes(workoutExercise)}
                    style={styles.actionBtn}
                >
                    <Ionicons name="create-outline" size={20} color="#007AFF"/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onShowExerciseInfo(workoutExercise)}
                    style={styles.actionBtn}
                >
                    <Ionicons name="information-circle-outline" size={20} color="#007AFF"/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    exerciseCard: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 15,
        marginBottom: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
    },
    deleteExerciseBtn: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
    setsContainer: {
        flexDirection: "column",
        gap: 8,
    },
    setRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    setInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    editableField: {
        fontSize: 18,
        textDecorationLine: 'underline',
        color: '#007AFF',
    },
    deleteSetBtn: {
        backgroundColor: '#f8f9fa',
        padding: 6,
        borderRadius: 6,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
});
