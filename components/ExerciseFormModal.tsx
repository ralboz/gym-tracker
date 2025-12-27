import React, {useCallback, useEffect, useState} from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert, TouchableOpacity,
} from "react-native";
import {Picker} from "@react-native-picker/picker";
import {Exercise, MuscleGroup} from "@/data/types";
import {createExercise, updateExercise, deleteExercise} from "@/data/dataUtils";
import {getMuscleGroupOptions} from "@/data/muscleGroups";
import Toast from "react-native-toast-message";
import {Ionicons} from "@expo/vector-icons";

interface ExerciseFormModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseToEdit?: Exercise | null;
    onExerciseUpdated?: () => void;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({visible, onClose, exerciseToEdit = null, onExerciseUpdated}) => {

    const [exercise, setExercise] = useState<Omit<Exercise, "id">>({
        name: "",
        primary_muscle_group_id: "chest" as MuscleGroup,
        secondary_muscle_group_id: null as MuscleGroup | null,
    });

    const isEditMode = !!exerciseToEdit;
    const muscleGroups = getMuscleGroupOptions();

    useEffect(() => {
        if (exerciseToEdit) {
            setExercise({
                name: exerciseToEdit.name,
                primary_muscle_group_id: exerciseToEdit.primary_muscle_group_id,
                secondary_muscle_group_id: exerciseToEdit.secondary_muscle_group_id,
            });
        } else {
            setExercise({
                name: "",
                primary_muscle_group_id: "chest" as MuscleGroup,
                secondary_muscle_group_id: null,
            });
        }
    }, [exerciseToEdit, visible]);

    const alterExerciseField = (value: string) => {
        setExercise(prev => ({...prev, name: value}));
    };

    const updatePrimaryMuscle = (value: MuscleGroup) => {
        setExercise(prev => ({...prev, primary_muscle_group_id: value}));
    };

    const updateSecondaryMuscle = (value: MuscleGroup | null) => {
        setExercise(prev => ({...prev, secondary_muscle_group_id: value}));
    };

    const handleSaveExercise = useCallback(async () => {
        if (exercise.name.trim() && exercise.name.trim().length > 3 && exercise.primary_muscle_group_id) {
            try {
                if (isEditMode && exerciseToEdit) {
                    await updateExercise(exerciseToEdit.id, exercise);
                    Toast.show({
                        type: 'success',
                        text1: 'Exercise updated successfully',
                        visibilityTime: 2000,
                        position: 'bottom',
                    });
                } else {
                    await createExercise(exercise);
                    Toast.show({
                        type: 'success',
                        text1: 'New exercise added successfully',
                        visibilityTime: 2000,
                        position: 'bottom',
                    });
                }

                onExerciseUpdated?.();
                onClose();
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to save exercise',
                    visibilityTime: 2000,
                    position: 'bottom',
                });
            }
        } else {
            Alert.alert("Invalid Exercise", "Please fill in all required fields.");
        }
    }, [exercise, isEditMode, exerciseToEdit, onClose, onExerciseUpdated]);

    const handleDeleteExercise = useCallback(() => {
        if (!exerciseToEdit) return;

        Alert.alert(
            "Delete Exercise",
            `Are you sure you want to delete "${exerciseToEdit.name}"? This action cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteExercise(exerciseToEdit.id);
                            Toast.show({
                                type: 'success',
                                text1: 'Exercise deleted successfully',
                                visibilityTime: 2000,
                                position: 'bottom',
                            });
                            onExerciseUpdated?.();
                            onClose();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Failed to delete exercise',
                                visibilityTime: 2000,
                                position: 'bottom',
                            });
                        }
                    }
                }
            ]
        );
    }, [exerciseToEdit, onClose, onExerciseUpdated]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headingText}>
                            {isEditMode ? 'Edit Exercise' : 'Add New Exercise'}
                        </Text>
                        {isEditMode && (
                            <TouchableOpacity
                                onPress={handleDeleteExercise}
                                style={styles.deleteExerciseBtn}
                            >
                                <Ionicons name="trash-sharp" size={20} color="#FF3B30"/>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.section}>
                        <TextInput
                            style={styles.exerciseInput}
                            placeholder="Exercise name..."
                            value={exercise.name}
                            onChangeText={alterExerciseField}
                            autoFocus={!isEditMode}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Primary Muscle Group *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={exercise.primary_muscle_group_id}
                                onValueChange={updatePrimaryMuscle}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                {muscleGroups.map(group => (
                                    <Picker.Item
                                        key={group.value}
                                        label={group.label}
                                        value={group.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Secondary Muscle Group</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={exercise.secondary_muscle_group_id ?? null}
                                onValueChange={updateSecondaryMuscle}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="None" value={null} />
                                {muscleGroups.map(group => (
                                    <Picker.Item
                                        key={group.value}
                                        label={group.label}
                                        value={group.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.rightButtons}>
                            <Pressable style={styles.secondaryButton} onPress={onClose}>
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable style={styles.addButton} onPress={handleSaveExercise}>
                                <Text style={styles.addButtonText}>
                                    {isEditMode ? 'Save Changes' : 'Add Exercise'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
        gap: 15
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    headingText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    closeText: {
        fontSize: 18,
        color: "#6B7280",
    },
    section: {
        rowGap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4B5563",
    },
    exerciseInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#F9FAFB",
        color: "#111827",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#F9FAFB",
    },
    picker: {
        height: 60,
    },
    pickerItem: {
        fontSize: 16,
        height: 50,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginTop: 8,
    },
    rightButtons: {
        flexDirection: "row",
        columnGap: 8,
    },
    secondaryButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    addButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
    },
    deleteExerciseBtn: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 8,
    },
});
