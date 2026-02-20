import { WorkoutDTO } from '@/data/types';
import { loadWorkouts } from '@/data/workoutsUtils';
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function HomeScreen(){
    const [workouts, setWorkouts] = useState<WorkoutDTO[]>([]);
    const router = useRouter();
    const { colors } = useTheme();

    useFocusEffect(
        useCallback(() => {
            loadWorkouts().then(setWorkouts);
        }, [])
    );

    const getMuscleGroups = (workout: WorkoutDTO): string[] => {
        const groups = new Set<string>();
        workout.exercises.forEach(exercise => {
            groups.add(exercise.primary_muscle_group_id);
            if (exercise.secondary_muscle_group_id) {
                groups.add(exercise.secondary_muscle_group_id);
            }
        });
        return Array.from(groups);
    };

    const getStats = (workout: WorkoutDTO) => {
        const numExercises = workout.exercises.length;
        const numSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
        const totalVolume = workout.exercises.reduce((total, ex) => {
            return total + ex.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0);
        }, 0);
        return { numExercises, numSets, totalVolume };
    };

    const renderWorkoutCard = ({ item: workout }: { item: WorkoutDTO }) => {
        const muscleGroups = getMuscleGroups(workout);
        const { numExercises, numSets, totalVolume } = getStats(workout);

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={[styles.cardHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {new Date(workout.created_date).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.muscleGroups}>
                        <Text style={[styles.muscleLabel, { color: colors.textMuted }]}>Muscles:</Text>
                        <Text style={[styles.muscleGroupsText, { color: colors.textPrimary }]}>{muscleGroups.join(', ')}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{numExercises}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Exercises</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{numSets}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sets</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{totalVolume.toLocaleString()}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Volume</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primaryAction }]} onPress={() => {
                        router.push(`/add?workoutId=${workout.id}`);
                    }}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (!workouts.length) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No workouts yet</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={[...workouts].sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())}
                renderItem={renderWorkoutCard}
                keyExtractor={workout => workout.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContainer, { paddingBottom: 24, flexGrow: 1 }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 48,
        marginBottom: 90,
        paddingBottom: 32
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardContent: {
        padding: 20,
    },
    muscleGroups: {
        marginBottom: 16,
    },
    muscleLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    muscleGroupsText: {
        fontSize: 16,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    cardActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
    },
});
