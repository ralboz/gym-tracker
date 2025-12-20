import React, {useState, useCallback, useEffect, useMemo} from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    DeviceEventEmitter,
    ScrollView,
    Modal,
    Alert
} from "react-native";
import {Exercise, MuscleGroup, WorkoutDTO, WorkoutExerciseDTO, WorkoutSetDTO} from "@/data/types";
import { Ionicons } from '@expo/vector-icons';
import {useLocalSearchParams, useRouter} from "expo-router";
import {deleteWorkout, saveNewWorkout, updateWorkout} from "@/data/workoutsUtils";
import {loadExercises} from "@/data/dataUtils";
import NumberWheel from "@/components/NumberWheel";

const muscleGroups: MuscleGroup[] = [
    'chest','back','shoulders','rear_delts','traps',
    'biceps','triceps','forearms',
    'quads','hamstrings','glutes','calves',
    'abs','obliques','hip_flexors','core',
    'posterior_chain','full_body',
];

export default function AddScreen() {
    const router = useRouter();
    const { workout: workoutParam, t } = useLocalSearchParams<{ workout?: string; t?: string }>();

    // Main state
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutDTO | null>(null);
    const [exercises, setExercises] = useState<WorkoutExerciseDTO[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [isNumberWheelVisible, setIsNumberWheelVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

    // Editing state
    const [currentEditingWorkout, setCurrentEditingWorkout] = useState<WorkoutExerciseDTO | null>(null);
    const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<'weight' | 'reps' | null>(null);
    const [wheelValue, setWheelValue] = useState(0);
    const [pendingSet, setPendingSet] = useState<Partial<WorkoutSetDTO> | null>(null);
    const [notesText, setNotesText] = useState('');

    const resetState = () => {
        setCurrentWorkout(null);
        setExercises([]);
        setSearchQuery('');
        setSelectedMuscle(null);
        setNotesText('');
        setCurrentEditingWorkout(null);
        setEditingSetIndex(null);
        setEditingField(null);
        setPendingSet(null);
        setIsModalVisible(false);
        setIsNotesModalVisible(false);
        setIsNumberWheelVisible(false);
    }

    // Initialize data (exercises to pick from + workout)
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);

            try {
                // Load available exercises
                const allExercises = await loadExercises();
                setAvailableExercises(allExercises);

                // Load current workout if editing
                if (workoutParam) {
                    const parsedWorkout = JSON.parse(decodeURIComponent(workoutParam as string));
                    setCurrentWorkout(parsedWorkout);
                    setExercises(parsedWorkout.exercises || []);
                }
            } catch (error) {
                console.error('Failed to initialize data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [workoutParam, t]);

    const handleSaveWorkout = useCallback(async () => {
        // at least one exercise exists
        if (exercises.length === 0) {
            Alert.alert('No Exercises', 'Add at least one exercise to save this workout.');
            return;
        }

        // ALL exercises must have at least one set
        const allHaveSets = exercises.every(exercise => exercise.sets.length > 0);

        if (!allHaveSets) {
            const exercisesWithoutSets = exercises.filter(ex => ex.sets.length === 0);
            Alert.alert(
                'Incomplete Exercises',
                `${exercisesWithoutSets.length} exercise(s) have no sets. Please add at least one set to each exercise or remove them.`
            );
            return;
        }

        try {
            const workoutData: WorkoutDTO = {
                id: currentWorkout?.id || Date.now(),
                created_date: currentWorkout?.created_date || Date.now(),
                exercises,
            };

            if (currentWorkout?.id && currentWorkout.id >= 0) {
                await updateWorkout(workoutData);
            } else {
                await saveNewWorkout(workoutData);
            }

            resetState();
            router.replace('/');
        } catch (error) {
            console.error('Failed to save workout:', error);
            Alert.alert('Error', 'Failed to save workout. Please try again.');
        }
    }, [exercises, currentWorkout, router]);

    const handleDeleteWorkout = useCallback(() => {
        if(!workoutParam) {
            // early return for case that user clicked to add new workout but didnt add anything to it yet
            resetState();
            router.push('/');
        }
        else
        {
            Alert.alert(
                `${currentWorkout ? 'Delete' : 'Cancel'} Workout`,
                `Are you sure you want to ${currentWorkout ? 'delete' : 'cancel'} this workout?`,
                [
                    { text: 'No', style: 'cancel' },
                    {
                        text: `Yes`,
                        style: 'destructive',
                        onPress: async () => {
                            if(currentWorkout)
                            {
                                await deleteWorkout(currentWorkout.id)
                            }
                            resetState();
                            router.push('/');
                        }
                    }
                ]
            );
        }
        
    }, [workoutParam, currentWorkout, router]);

    // DeviceEventEmitter listeners
    useEffect(() => {
        const handleAddExercise = () => setIsModalVisible(true);

        const subscription1 = DeviceEventEmitter.addListener('ADD-EXERCISE', handleAddExercise);
        const subscription2 = DeviceEventEmitter.addListener('SAVE-WORKOUT', handleSaveWorkout);
        const subscription3 = DeviceEventEmitter.addListener('DELETE-WORKOUT', handleDeleteWorkout);

        return () => {
            subscription1?.remove();
            subscription2?.remove();
            subscription3?.remove();
        };
    }, [exercises, currentWorkout, router, handleSaveWorkout, handleDeleteWorkout]);

    // Handlers
    const handleAddExercise = useCallback((exercise: Exercise) => {
        const newWorkoutExercise: WorkoutExerciseDTO = {
            ...exercise,
            sets: [],
            notes: "",
        };
        setExercises(prev => [...prev, newWorkoutExercise]);
        setIsModalVisible(false);
        setSearchQuery('');
        setSelectedMuscle(null);
    }, []);

    const handleDeleteExercise = useCallback((exerciseId: number) => {
        setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    }, []);

    const handleAddSet = useCallback((workoutExerciseId: number) => {
        const workoutExercise = exercises.find(ex => ex.id === workoutExerciseId);
        if (!workoutExercise) return;

        setCurrentEditingWorkout(workoutExercise);
        setEditingSetIndex(-1);
        setPendingSet({ weight: 40 });
        setEditingField('weight');
        setWheelValue(40);
        setIsNumberWheelVisible(true);
    }, [exercises]);

    const handleDeleteSet = useCallback((setId: number) => {
        setExercises(prevExercises =>
            prevExercises.map(exercise => ({
                ...exercise,
                sets: exercise.sets.filter(set => set.id !== setId)
            }))
        );
    }, []);

    const handleOpenNumberWheel = useCallback((
        workoutExercise: WorkoutExerciseDTO,
        workoutSet: WorkoutSetDTO,
        setIndex: number,
        field: 'weight' | 'reps'
    ) => {
        setCurrentEditingWorkout(workoutExercise);
        setEditingSetIndex(setIndex);
        setEditingField(field);
        setWheelValue(workoutSet[field]);
        setIsNumberWheelVisible(true);
    }, []);

    const handleCloseNumberWheel = useCallback(() => {
        setIsNumberWheelVisible(false);

        if (!currentEditingWorkout || editingField === null || wheelValue === undefined) {
            resetEditingState();
            return;
        }

        const isNewSet = editingSetIndex === -1;

        if (isNewSet) {
            if (editingField === 'weight') {
                // Switch to reps input
                setPendingSet({ weight: wheelValue });
                setEditingField('reps');
                setWheelValue(10);
                setTimeout(() => setIsNumberWheelVisible(true), 300);
                return;
            } else {
                // wheelValue is now reps so we can complete the addition of the new set
                const newSet: WorkoutSetDTO = {
                    id: Date.now(),
                    weight: pendingSet?.weight || 40,
                    reps: wheelValue,
                };
                updateExerciseSets(currentEditingWorkout.id, prevSets => [...prevSets, newSet]);
            }
        } else {
            // Update existing set
            updateExerciseSets(currentEditingWorkout.id, prevSets =>
                prevSets.map((set, index) =>
                    index === editingSetIndex ? { ...set, [editingField!]: wheelValue } : set
                )
            );
        }

        resetEditingState();
    }, [currentEditingWorkout, editingSetIndex, editingField, wheelValue, pendingSet]);

    const updateExerciseSets = useCallback((exerciseId: number, updateFn: (sets: WorkoutSetDTO[]) => WorkoutSetDTO[]) => {
        setExercises(prev =>
            prev.map(exercise =>
                exercise.id === exerciseId ? { ...exercise, sets: updateFn(exercise.sets) } : exercise
            )
        );
    }, []);

    const resetEditingState = useCallback(() => {
        setEditingSetIndex(null);
        setEditingField(null);
        setPendingSet(null);
        setCurrentEditingWorkout(null);
    }, []);

    const handleShowNoteInput = useCallback((workoutExercise: WorkoutExerciseDTO) => {
        setCurrentEditingWorkout(workoutExercise);
        setNotesText(workoutExercise.notes || '');
        setIsNotesModalVisible(true);
    }, []);

    const handleSaveNotes = useCallback(() => {
        if (!currentEditingWorkout) return;

        setExercises(prev =>
            prev.map(exercise =>
                exercise.id === currentEditingWorkout.id
                    ? { ...exercise, notes: notesText }
                    : exercise
            )
        );
        setIsNotesModalVisible(false);
        setCurrentEditingWorkout(null);
    }, [currentEditingWorkout, notesText]);

    // Filtered exercises for search
    const filteredExercises = useMemo(() =>
            availableExercises.filter(exercise => {
                const matchesSearch = exercise.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                const matchesMuscle = !selectedMuscle ||
                    exercise.primary_muscle_group_id === selectedMuscle;
                return matchesSearch && matchesMuscle;
            }),
    [availableExercises, searchQuery, selectedMuscle]);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <ActivityIndicator size="large" color="#007AFF"/>
                    <Text style={{marginTop: 12}}>Loading workout...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {exercises.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={{fontSize: 18, marginBottom: 8}}>No exercises added yet</Text>
                    <Text style={{color: '#666'}}>Tap + to add exercises</Text>
                </View>
            ) : (
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{paddingBottom: 100}}
                    showsVerticalScrollIndicator={true}
                >
                    {exercises.map(workoutExercise => (
                        <View key={workoutExercise.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <Text style={styles.exerciseName}>{workoutExercise.name}</Text>
                                <TouchableOpacity
                                    onPress={() => handleDeleteExercise(workoutExercise.id)}
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
                                                onPress={() => handleOpenNumberWheel(workoutExercise, set, index, 'weight')}
                                            >
                                                <Text style={styles.editableField}>{set.weight} kg</Text>
                                            </TouchableOpacity>
                                            <Text style={{fontSize: 16}}>×</Text>
                                            <TouchableOpacity
                                                onPress={() => handleOpenNumberWheel(workoutExercise, set, index, 'reps')}
                                            >
                                                <Text style={styles.editableField}>{set.reps} reps</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteSet(set.id)}
                                            style={styles.deleteSetBtn}
                                        >
                                            <Ionicons name="trash-sharp" size={16} color="#FF3B30"/>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    onPress={() => handleAddSet(workoutExercise.id)}
                                    style={styles.actionBtn}
                                >
                                    <Ionicons name="add" size={20} color="#007AFF"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleShowNoteInput(workoutExercise)}
                                    style={styles.actionBtn}
                                >
                                    <Ionicons name="create-outline" size={20} color="#007AFF"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Number Wheel Modal */}
            <Modal visible={isNumberWheelVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.numberWheelModal}>
                        <View style={styles.wheelHeader}>
                            <Text style={styles.wheelHeaderText}>
                                {editingField === 'weight' ? 'Set Weight (kg)' : 'Set Reps'}
                            </Text>
                        </View>
                        <NumberWheel
                            label={editingField === 'weight' ? 'Weight (kg)' : 'Reps'}
                            value={wheelValue}
                            min={editingField === 'weight' ? 0 : 1}
                            max={editingField === 'weight' ? 500 : 50}
                            step={1}
                            onValueChange={setWheelValue}
                        />
                        <TouchableOpacity onPress={handleCloseNumberWheel} style={styles.saveButton}>
                            <Text style={{color: 'white', fontWeight: '600'}}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Notes Modal */}
            <Modal visible={isNotesModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.notesModal}>
                        <View style={styles.notesHeader}>
                            <Text style={styles.notesHeaderText}>Exercise Notes</Text>
                        </View>
                        <TextInput
                            style={styles.notesInput}
                            multiline
                            placeholder="Add notes for this exercise..."
                            value={notesText}
                            onChangeText={setNotesText}
                            textAlignVertical="top"
                        />
                        <View style={styles.notesButtonContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsNotesModalVisible(false);
                                    setCurrentEditingWorkout(null);
                                }}
                                style={[styles.notesButton, styles.cancelButton]}
                            >
                                <Text style={{color: 'white', fontWeight: '600'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveNotes}
                                style={[styles.notesButton, styles.saveNotesButton]}
                            >
                                <Text style={{color: 'white', fontWeight: '600'}}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Exercise Search Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
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
                            contentContainerStyle={{ paddingVertical: 16, alignItems: 'center' }}
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
                            {muscleGroups.map(group => (
                                <TouchableOpacity
                                    key={group}
                                    onPress={() => setSelectedMuscle(selectedMuscle === group ? null : group)}
                                    style={[
                                        styles.muscleChip,
                                        selectedMuscle === group && styles.muscleChipActive,
                                    ]}
                                >
                                    <Text style={selectedMuscle === group ? {color: 'white'} : {}}>{group}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* FlatList - Takes remaining space */}
                        <FlatList
                            data={filteredExercises}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.exerciseItem}
                                    onPress={() => handleAddExercise(item)}
                                >
                                    <Text style={styles.exerciseListItemName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            style={{flex: 1}}
                            contentContainerStyle={{paddingBottom: 16}}
                        />

                        {/* Close Button - Fixed */}
                        <TouchableOpacity
                            onPress={() => {
                                setIsModalVisible(false);
                                setSearchQuery('');
                                setSelectedMuscle(null);
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={{color: 'white', fontWeight: '600'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        gap: 10,
        marginTop: 60,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
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
        shadowOffset: { width: 0, height: 4 },
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
    numberWheelModal: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    wheelHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    wheelHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
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
    notesModal: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        height: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
    },
    notesHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#F8F9FA',
    },
    notesHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    notesInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    notesButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    notesButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    saveNotesButton: {
        backgroundColor: '#007AFF',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
});
