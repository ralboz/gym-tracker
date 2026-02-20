import { MUSCLE_GROUPS } from '@/data/muscleGroups';
import { Exercise, MuscleGroup } from "@/data/types";
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "@/theme/useTheme";

interface ExerciseSearchModalProps {
    visible: boolean;
    availableExercises: Exercise[];
    onSelectExercise: (exercise: Exercise) => void;
    onClose: () => void;
    onCreateExercise?: () => void;
}

export const ExerciseSearchModal: React.FC<ExerciseSearchModalProps> = ({visible, availableExercises, onSelectExercise, onClose, onCreateExercise}) =>
{
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

    const filteredExercises = useMemo(() =>
            availableExercises.filter(exercise => {
                const matchesSearch = exercise.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                const matchesMuscle = !selectedMuscle ||
                    exercise.primary_muscle_group_id === selectedMuscle;
                return matchesSearch && matchesMuscle;
            }),
        [availableExercises, searchQuery, selectedMuscle]
    );

    const handleClose = () => {
        setSearchQuery('');
        setSelectedMuscle(null);
        onClose();
    };

    const handleSelectExercise = (exercise: Exercise) => {
        onSelectExercise(exercise);
        setSearchQuery('');
        setSelectedMuscle(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.searchRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                        <TextInput
                            style={[styles.searchInput, { flex: 1, color: colors.textPrimary }]}
                            placeholder="Search exercises..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {onCreateExercise && (
                            <TouchableOpacity
                                onPress={onCreateExercise}
                                style={styles.createButton}
                                testID="create-exercise-button"
                            >
                                <Ionicons name="add-circle-outline" size={28} color={colors.primaryAction} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Muscle Filters - Fixed */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.muscleFilterRow}
                        contentContainerStyle={{paddingVertical: 16, alignItems: 'center'}}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedMuscle(null)}
                            style={[
                                styles.muscleChip,
                                { borderColor: colors.border },
                                !selectedMuscle && { backgroundColor: colors.primaryAction, borderColor: colors.primaryAction },
                            ]}
                        >
                            <Text style={!selectedMuscle ? {color: 'white'} : {color: colors.textPrimary}}>All</Text>
                        </TouchableOpacity>
                        {MUSCLE_GROUPS.map(group => (
                            <TouchableOpacity
                                key={group}
                                onPress={() => setSelectedMuscle(selectedMuscle === group ? null : group)}
                                style={[
                                    styles.muscleChip,
                                    { borderColor: colors.border },
                                    selectedMuscle === group && { backgroundColor: colors.primaryAction, borderColor: colors.primaryAction },
                                ]}
                            >
                                <Text style={selectedMuscle === group ? {color: 'white'} : {color: colors.textPrimary}}>
                                    {group}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>


                    {filteredExercises.length === 0 &&
                        (<Text style={{padding: 10, color: colors.destructiveAction}}>No exercises found, please go to settings to add exercises.</Text>)
                    }
                    {/* FlatList - Takes remaining space */}
                    <FlatList
                        data={filteredExercises}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={[styles.exerciseItem, { borderBottomColor: colors.border }]}
                                onPress={() => handleSelectExercise(item)}
                            >
                                <Text style={[styles.exerciseListItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={{flex: 1}}
                        contentContainerStyle={{paddingBottom: 16}}
                    />

                    {/* Close Button - Fixed */}
                    <TouchableOpacity
                        onPress={handleClose}
                        style={[styles.closeButton, { backgroundColor: colors.destructiveAction }]}
                    >
                        <Text style={{color: 'white', fontWeight: '600'}}>Close</Text>
                    </TouchableOpacity>
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
    },
    modalContent: {
        borderRadius: 16,
        width: '90%',
        height: '80%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    searchInput: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    createButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    muscleFilterRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 6,
        maxHeight: 70,
    },
    muscleChip: {
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseListItemName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    closeButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
    },
});