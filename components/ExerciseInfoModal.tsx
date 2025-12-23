import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator
} from "react-native";
import React, {useEffect, useState} from "react";
import {getExerciseHistory} from "@/data/workoutsUtils";
import {ExerciseHistory, Exercise} from "@/data/types";
import {Ionicons} from "@expo/vector-icons";

interface ExerciseInfoModalProps {
    visible: boolean;
    exercise: Exercise | null;
    onClose: () => void;
}

export const ExerciseInfoModal: React.FC<ExerciseInfoModalProps> = ({visible, exercise, onClose}) => {
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle} numberOfLines={2}>
                            {exercise?.name || 'Exercise Info'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Loading history...</Text>
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
                                        <Text style={styles.sectionTitle}>Personal Record</Text>
                                    </View>
                                    <View style={styles.prCard}>
                                        <View style={styles.prRow}>
                                            <Text style={styles.prLabel}>Weight</Text>
                                            <Text style={styles.prValue}>{history.prSet.weight} kg</Text>
                                        </View>
                                        <View style={styles.prRow}>
                                            <Text style={styles.prLabel}>Reps</Text>
                                            <Text style={styles.prValue}>{history.prSet.reps}</Text>
                                        </View>
                                        <View style={styles.prRow}>
                                            <Text style={styles.prLabel}>Total Volume</Text>
                                            <Text style={styles.prValue}>
                                                {(history.prSet.weight * history.prSet.reps).toFixed(1)} kg
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.section}>
                                    <Text style={styles.emptyText}>No workout history yet</Text>
                                </View>
                            )}

                            {history?.recentWorkouts && history.recentWorkouts.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="calendar" size={22} color="#007AFF" />
                                        <Text style={styles.sectionTitle}>Recent Workouts</Text>
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
                                            <View key={workout.id} style={styles.workoutCard}>
                                                <View style={styles.workoutHeader}>
                                                    <Text style={styles.workoutDate}>
                                                        {formatDate(workout.created_date)}
                                                    </Text>
                                                    <Text style={styles.workoutVolume}>
                                                        {totalVolume.toFixed(0)} kg total
                                                    </Text>
                                                </View>

                                                <View style={styles.setsGrid}>
                                                    {exerciseInstance.sets.map((set) => (
                                                        <View key={set.id} style={styles.setChip}>
                                                            <Text style={styles.setChipText}>
                                                                {set.weight}kg × {set.reps}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>

                                                {exerciseInstance.notes && (
                                                    <View style={styles.notesContainer}>
                                                        <Ionicons name="document-text-outline" size={14} color="#666" />
                                                        <Text style={styles.notesText}>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
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
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
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
        color: '#666',
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
        color: '#333',
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
        color: '#666',
        fontWeight: '500',
    },
    prValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    workoutCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    workoutDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    workoutVolume: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    setsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    setChip: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    setChipText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 6,
    },
    notesText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 40,
    },
});
