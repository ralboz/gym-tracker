import { Exercise, ExerciseHistory, WorkoutSetDTO } from "@/data/types";
import { getExerciseHistory } from "@/data/workoutsUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "@/theme/useTheme";

interface ExerciseInfoModalProps {
    visible: boolean;
    exercise: Exercise | null;
    onClose: () => void;
    onDuplicateExerciseSets?: (exerciseId: number, sets: WorkoutSetDTO[]) => void;
}

export const ExerciseInfoModal: React.FC<ExerciseInfoModalProps> = ({visible, exercise, onClose, onDuplicateExerciseSets}) => {
    const { colors } = useTheme();
    const [history, setHistory] = useState<ExerciseHistory | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && exercise) {
            setLoading(true);
            getExerciseHistory(exercise.id)
                .then(history => setHistory(history))
                .finally(() => setLoading(false));
        }
    }, [visible, exercise]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                            {exercise?.name || 'Exercise Info'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primaryAction} />
                            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading history...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            {history?.prSet ? (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="trophy" size={24} color="#FFD700" />
                                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Record</Text>
                                    </View>
                                    <View style={styles.prCard}>
                                        <View style={styles.prRow}>
                                            <Text style={[styles.prLabel, { color: '#666' }]}>Weight</Text>
                                            <Text style={[styles.prValue, { color: '#333' }]}>{history.prSet.weight} kg</Text>
                                        </View>
                                        <View style={styles.prRow}>
                                            <Text style={[styles.prLabel, { color: '#666' }]}>Reps</Text>
                                            <Text style={[styles.prValue, { color: '#333' }]}>{history.prSet.reps}</Text>
                                        </View>
                                        <View style={styles.prRow}>
                                            <Text style={[styles.prLabel, { color: '#666' }]}>Total Volume</Text>
                                            <Text style={[styles.prValue, { color: '#333' }]}>
                                                {(history.prSet.weight * history.prSet.reps).toFixed(1)} kg
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.section}>
                                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No workout history yet</Text>
                                </View>
                            )}

                            {history?.recentWorkouts && history.recentWorkouts.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="calendar" size={22} color={colors.primaryAction} />
                                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Workouts</Text>
                                    </View>

                                    {history.recentWorkouts.map((workout) => {
                                        const exerciseInstance = workout.exercises.find(
                                            e => e.id === exercise?.id
                                        );

                                        if (!exerciseInstance) return null;

                                        const totalVolume = exerciseInstance.sets.reduce(
                                            (sum, set) => sum + (set.weight * set.reps),
                                            0
                                        );

                                        return (
                                            <View key={workout.id} style={[styles.workoutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                <View style={styles.workoutHeader}>
                                                    <Text style={[styles.workoutDate, { color: colors.textPrimary }]}>
                                                        {formatDate(workout.created_date)}
                                                    </Text>
                                                    <View style={styles.workoutHeaderRight}>
                                                        <Text style={[styles.workoutVolume, { color: colors.primaryAction }]}>
                                                            {totalVolume.toFixed(0)} kg total
                                                        </Text>
                                                        {onDuplicateExerciseSets && (
                                                            <TouchableOpacity
                                                                onPress={() => onDuplicateExerciseSets(exercise!.id, exerciseInstance.sets)}
                                                                style={[styles.duplicateWorkoutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                                            >
                                                                <Ionicons name="copy-outline" size={18} color={colors.primaryAction} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={styles.setsGrid}>
                                                    {exerciseInstance.sets.map((set) => (
                                                        <View key={set.id} style={[styles.setChip, { backgroundColor: colors.card, borderColor: colors.primaryAction }]}>
                                                            <Text style={[styles.setChipText, { color: colors.primaryAction }]}>
                                                                {set.weight}kg × {set.reps}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>

                                                {exerciseInstance.notes && (
                                                    <View style={[styles.notesContainer, { borderTopColor: colors.border }]}>
                                                        <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                                                        <Text style={[styles.notesText, { color: colors.textMuted }]}>
                                                            {exerciseInstance.notes}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        width: '100%',
        height: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
        marginRight: 12,
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    prCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    prRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    prLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    prValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    workoutCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    workoutHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    workoutDate: {
        fontSize: 16,
        fontWeight: '600',
    },
    workoutVolume: {
        fontSize: 14,
        fontWeight: '600',
    },
    setsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    setChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    setChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 6,
    },
    notesText: {
        fontSize: 14,
        fontStyle: 'italic',
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 40,
    },
    duplicateWorkoutBtn: {
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
});
