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
import React, {useMemo, useState} from "react";
import {Exercise, MuscleGroup} from "@/data/types";
import { MUSCLE_GROUPS } from '@/data/muscleGroups';

interface ExerciseSearchModalProps {
    visible: boolean;
    availableExercises: Exercise[];
    onSelectExercise: (exercise: Exercise) => void;
    onClose: () => void;
}

export const ExerciseSearchModal: React.FC<ExerciseSearchModalProps> = ({visible, availableExercises, onSelectExercise, onClose}) =>
{
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Search Input - Fixed */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />

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
                                !selectedMuscle && styles.muscleChipActive,
                            ]}
                        >
                            <Text style={!selectedMuscle ? {color: 'white'} : {}}>All</Text>
                        </TouchableOpacity>
                        {MUSCLE_GROUPS.map(group => (
                            <TouchableOpacity
                                key={group}
                                onPress={() => setSelectedMuscle(selectedMuscle === group ? null : group)}
                                style={[
                                    styles.muscleChip,
                                    selectedMuscle === group && styles.muscleChipActive,
                                ]}
                            >
                                <Text style={selectedMuscle === group ? {color: 'white'} : {}}>
                                    {group}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* FlatList - Takes remaining space */}
                    <FlatList
                        data={filteredExercises}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.exerciseItem}
                                onPress={() => handleSelectExercise(item)}
                            >
                                <Text style={styles.exerciseListItemName}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={{flex: 1}}
                        contentContainerStyle={{paddingBottom: 16}}
                    />

                    {/* Close Button - Fixed */}
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.closeButton}
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
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
    searchInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
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
        borderColor: '#ccc',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    muscleChipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    exerciseItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
    },
});