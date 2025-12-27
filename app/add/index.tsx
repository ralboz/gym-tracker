import React, {useState, useCallback, useEffect} from "react";
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    DeviceEventEmitter,
    ScrollView,
    Alert
} from "react-native";
import {Exercise, WorkoutDTO, WorkoutExerciseDTO, WorkoutSetDTO} from "@/data/types";
import {useLocalSearchParams, useRouter} from "expo-router";
import {deleteWorkout, saveNewWorkout, updateWorkout} from "@/data/workoutsUtils";
import {loadExercises} from "@/data/dataUtils";
import { NumberWheelModal } from "@/components/NumberWheelModal";
import { NotesModal } from "@/components/NotesModal";
import { ExerciseSearchModal } from "@/components/ExerciseSearchModal";
import {ExerciseCard} from "@/components/ExerciseCard";
import { ExerciseInfoModal } from "@/components/ExerciseInfoModal";
import {useFocusEffect} from "@react-navigation/native";

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
    const { workout: workoutParam } = useLocalSearchParams<{ workout?: string; }>();

    // Main state
    const [currentWorkout, setCurrentWorkout] = useState<WorkoutDTO | null>(null);
    const [exercises, setExercises] = useState<WorkoutExerciseDTO[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [isExerciseSearchModalVisible, setIsExerciseSearchModalVisible] = useState(false);
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [isNumberWheelVisible, setIsNumberWheelVisible] = useState(false);
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
        }, [workoutParam])
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

    const handleAddExercise = useCallback(async (exercise: Exercise) => {
        const newWorkoutExercise: WorkoutExerciseDTO = {
            ...exercise,
            sets: [],
            notes: "",
        };
        setExercises(prev => [...prev, newWorkoutExercise]);
        setIsExerciseSearchModalVisible(false);
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
            />

            <ExerciseInfoModal
                visible={isInfoModalVisible}
                exercise={selectedExercise}
                onClose={() => setIsInfoModalVisible(false)}
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
