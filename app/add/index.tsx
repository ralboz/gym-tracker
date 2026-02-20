import { ExerciseCard } from "@/components/ExerciseCard";
import { ExerciseFormModal } from "@/components/ExerciseFormModal";
import { ExerciseInfoModal } from "@/components/ExerciseInfoModal";
import { ExerciseSearchModal } from "@/components/ExerciseSearchModal";
import { NotesModal } from "@/components/NotesModal";
import { NumberWheelModal } from "@/components/NumberWheelModal";
import { loadExercises } from "@/data/dataUtils";
import { Exercise, WorkoutDTO, WorkoutExerciseDTO, WorkoutSetDTO } from "@/data/types";
import { deleteWorkout, loadWorkoutById, saveNewWorkout, updateWorkout } from "@/data/workoutsUtils";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

const LoadingState = () => (
    <View style={styles.container}>
        <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#007AFF"/>
            <Text style={{marginTop: 12}}>Loading workout...</Text>
        </View>
    </View>
);

const EmptyState = () => (
    <View style={styles.emptyState}>
        <Text style={{fontSize: 18, marginBottom: 8}}>No exercises added yet</Text>
        <Text style={{color: '#666'}}>Tap + to add exercises</Text>
    </View>
);

export default function AddScreen() {
    const router = useRouter();
    const { workoutId: workoutIdParam } = useLocalSearchParams<{ workoutId?: string; }>();

    // Main state
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutDTO | null>(null);
    const [exercises, setExercises] = useState<WorkoutExerciseDTO[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [isExerciseSearchModalVisible, setIsExerciseSearchModalVisible] = useState(false);
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [isNumberWheelVisible, setIsNumberWheelVisible] = useState(false);
    const [isExerciseFormVisible, setIsExerciseFormVisible] = useState(false);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
        setNotesText('');
        setCurrentEditingWorkout(null);
        setEditingSetIndex(null);
        setEditingField(null);
        setPendingSet(null);
        setIsExerciseSearchModalVisible(false);
        setIsNotesModalVisible(false);
        setIsNumberWheelVisible(false);
    };

    const resetEditingState = () => {
        setEditingSetIndex(null);
        setEditingField(null);
        setPendingSet(null);
        setCurrentEditingWorkout(null);
    };

    // Initialize data (exercises to pick from + workout)
    useFocusEffect(
        useCallback(() => {
            const initializeData = async () => {
                setLoading(true);

                try {
                    // Load available exercises
                    const allExercises = await loadExercises();
                    setAvailableExercises(allExercises);

                    // Load current workout if editing
                    if (workoutIdParam) {
                        const workout = await loadWorkoutById(Number(workoutIdParam));
                        if (workout) {
                            setCurrentWorkout(workout);
                            setExercises(workout.exercises || []);
                        }
                    }
                } catch (error) {
                    console.error('Failed to initialize data:', error);
                } finally {
                    setLoading(false);
                }
            };

            initializeData();
        }, [workoutIdParam])
    );

    // Handlers
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
        if(!workoutIdParam) {
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
    }, [workoutIdParam, currentWorkout, router]);

    const handleAddExercise = useCallback(async (exercise: Exercise) => {
        const newWorkoutExercise: WorkoutExerciseDTO = {
            ...exercise,
            sets: [],
            notes: "",
        };
        setExercises(prev => [...prev, newWorkoutExercise]);
        setIsExerciseSearchModalVisible(false);
    }, []);

    const handleCreateExercise = useCallback(() => {
        setIsExerciseFormVisible(true);
    }, []);

    const handleExerciseCreated = useCallback(async () => {
        const allExercises = await loadExercises();
        setAvailableExercises(allExercises);

        // Find the newly created exercise and add it to the current workout
        const newExercise = allExercises.reduce((max, ex) => ex.id > max.id ? ex : max, allExercises[0]);
        if (newExercise) {
            handleAddExercise(newExercise);
        }

        setIsExerciseFormVisible(false);
        setIsExerciseSearchModalVisible(false);
    }, [handleAddExercise]);

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

    const handleDuplicateSet = useCallback((exerciseId: number, set: WorkoutSetDTO) => {
        const newSet: WorkoutSetDTO = {
            id: Date.now(),
            weight: set.weight,
            reps: set.reps,
        };
        setExercises(prev =>
            prev.map(exercise =>
                exercise.id === exerciseId
                    ? { ...exercise, sets: [...exercise.sets, newSet] }
                    : exercise
            )
        );
    }, []);

    const updateExerciseSets = useCallback((exerciseId: number, updateFn: (sets: WorkoutSetDTO[]) => WorkoutSetDTO[]) => {
        setExercises(prev =>
            prev.map(exercise =>
                exercise.id === exerciseId ? { ...exercise, sets: updateFn(exercise.sets) } : exercise
            )
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
    }, [currentEditingWorkout, editingField, wheelValue, editingSetIndex, pendingSet?.weight, updateExerciseSets]);

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

    const handleCancelNotes = useCallback(() => {
        setIsNotesModalVisible(false);
        setCurrentEditingWorkout(null);
    }, []);

    const handleShowExerciseInfo = useCallback((workoutExercise: WorkoutExerciseDTO) => {
        setSelectedExercise(workoutExercise);
        setIsInfoModalVisible(true);
    }, []);

    const handleDuplicateExerciseSets = useCallback((exerciseId: number, sets: WorkoutSetDTO[]) => {
        const applyDuplicate = () => {
            const newSets: WorkoutSetDTO[] = sets.map(set => ({
                id: Date.now() + Math.random(),
                weight: set.weight,
                reps: set.reps,
            }));
            setExercises(prev =>
                prev.map(exercise =>
                    exercise.id === exerciseId
                        ? { ...exercise, sets: newSets }
                        : exercise
                )
            );
            setIsInfoModalVisible(false);
        };

        const currentExercise = exercises.find(ex => ex.id === exerciseId);
        if (currentExercise && currentExercise.sets.length > 0) {
            Alert.alert(
                'Overwrite Sets',
                'This exercise already has sets. Duplicating will replace them. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Overwrite', style: 'destructive', onPress: applyDuplicate },
                ]
            );
        } else {
            applyDuplicate();
        }
    }, [exercises]);

    // DeviceEventEmitter listeners
    useEffect(() => {
        const handleAddExercise = () => setIsExerciseSearchModalVisible(true);

        const subscription1 = DeviceEventEmitter.addListener('ADD-EXERCISE', handleAddExercise);
        const subscription2 = DeviceEventEmitter.addListener('SAVE-WORKOUT', handleSaveWorkout);
        const subscription3 = DeviceEventEmitter.addListener('DELETE-WORKOUT', handleDeleteWorkout);

        return () => {
            subscription1?.remove();
            subscription2?.remove();
            subscription3?.remove();
        };
    }, [exercises, currentWorkout, router, handleSaveWorkout, handleDeleteWorkout]);

    if (loading) {
        return (
            <LoadingState />
        );
    }

    return (
        <View style={styles.container}>
            {exercises.length === 0 ? (
                <EmptyState />
            ) : (
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{paddingBottom: 100}}
                    showsVerticalScrollIndicator={true}
                >
                    {exercises.map(workoutExercise => (
                        <ExerciseCard
                            key={workoutExercise.id}
                            workoutExercise={workoutExercise}
                            onDeleteExercise={handleDeleteExercise}
                            onAddSet={handleAddSet}
                            onDeleteSet={handleDeleteSet}
                            onDuplicateSet={handleDuplicateSet}
                            onEditSet={handleOpenNumberWheel}
                            onShowNotes={handleShowNoteInput}
                            onShowExerciseInfo={handleShowExerciseInfo}
                        />
                    ))}
                </ScrollView>
            )}

            {/* MODALS */}
            <NumberWheelModal
                visible={isNumberWheelVisible}
                value={wheelValue}
                field={editingField}
                onValueChange={setWheelValue}
                onSave={handleCloseNumberWheel}
            />

            <NotesModal
                visible={isNotesModalVisible}
                notes={notesText}
                onNotesChange={setNotesText}
                onSave={handleSaveNotes}
                onCancel={handleCancelNotes}
            />

            <ExerciseSearchModal
                visible={isExerciseSearchModalVisible}
                availableExercises={availableExercises}
                onSelectExercise={handleAddExercise}
                onClose={() => setIsExerciseSearchModalVisible(false)}
                onCreateExercise={handleCreateExercise}
            />

            <ExerciseInfoModal
                visible={isInfoModalVisible}
                exercise={selectedExercise}
                onClose={() => setIsInfoModalVisible(false)}
                onDuplicateExerciseSets={handleDuplicateExerciseSets}
            />

            <ExerciseFormModal
                visible={isExerciseFormVisible}
                exerciseToEdit={null}
                onClose={() => setIsExerciseFormVisible(false)}
                onExerciseUpdated={handleExerciseCreated}
            />

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
    loadingState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
