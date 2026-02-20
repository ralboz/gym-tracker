import { WorkoutExerciseDTO, WorkoutSetDTO } from '@/data/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface ExerciseCardProps {
    workoutExercise: WorkoutExerciseDTO;
    onDeleteExercise: (id: number) => void;
    onAddSet: (id: number) => void;
    onDeleteSet: (setId: number) => void;
    onDuplicateSet: (exerciseId: number, set: WorkoutSetDTO) => void;
    onEditSet: (
        workoutExercise: WorkoutExerciseDTO,
        set: WorkoutSetDTO,
        index: number,
        field: 'weight' | 'reps'
    ) => void;
    onShowNotes: (workoutExercise: WorkoutExerciseDTO) => void;
    onShowExerciseInfo: (workoutExercise: WorkoutExerciseDTO) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({workoutExercise, onDeleteExercise, onAddSet, onDeleteSet, onDuplicateSet, onEditSet, onShowNotes, onShowExerciseInfo}) =>
{
    const { colors } = useTheme();

    return (
        <View style={[styles.exerciseCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.exerciseHeader}>
                <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>{workoutExercise.name}</Text>
                <TouchableOpacity
                    onPress={() => onDeleteExercise(workoutExercise.id)}
                    style={[styles.deleteExerciseBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Ionicons name="trash-sharp" size={20} color={colors.destructiveAction}/>
                </TouchableOpacity>
            </View>

            <View style={styles.setsContainer}>
                {workoutExercise.sets.map((set, index) => (
                    <View key={set.id} style={[styles.setRow, { backgroundColor: colors.surface }]}>
                        <View style={styles.setInfo}>
                            <Text style={{fontSize: 16, minWidth: 50, color: colors.textPrimary}}>Set {index + 1}:</Text>
                            <TouchableOpacity
                                onPress={() => onEditSet(workoutExercise, set, index, 'weight')}
                            >
                                <Text style={[styles.editableField, { color: colors.primaryAction }]}>{set.weight} kg</Text>
                            </TouchableOpacity>
                            <Text style={{fontSize: 16, color: colors.textPrimary}}>×</Text>
                            <TouchableOpacity
                                onPress={() => onEditSet(workoutExercise, set, index, 'reps')}
                            >
                                <Text style={[styles.editableField, { color: colors.primaryAction }]}>{set.reps} reps</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.setActions}>
                            <TouchableOpacity
                                onPress={() => onDuplicateSet(workoutExercise.id, set)}
                                style={[styles.duplicateSetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                                <Ionicons name="copy-outline" size={16} color={colors.primaryAction}/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onDeleteSet(set.id)}
                                style={[styles.deleteSetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                                <Ionicons name="trash-sharp" size={16} color={colors.destructiveAction}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    onPress={() => onAddSet(workoutExercise.id)}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Ionicons name="add" size={20} color={colors.primaryAction}/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onShowNotes(workoutExercise)}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Ionicons name="create-outline" size={20} color={colors.primaryAction}/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onShowExerciseInfo(workoutExercise)}
                    style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Ionicons name="information-circle-outline" size={20} color={colors.primaryAction}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    exerciseCard: {
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
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
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
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
    },
    deleteSetBtn: {
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    duplicateSetBtn: {
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    setActions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
});
