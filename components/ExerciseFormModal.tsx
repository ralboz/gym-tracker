import { createExercise, deleteExercise, updateExercise } from "@/data/dataUtils";
import { getMuscleGroupOptions } from "@/data/muscleGroups";
import { Exercise, MuscleGroup } from "@/data/types";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "@/theme/useTheme";

interface ExerciseFormModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseToEdit?: Exercise | null;
    onExerciseUpdated?: () => void;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({visible, onClose, exerciseToEdit = null, onExerciseUpdated}) => {
    const { colors } = useTheme();

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
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.headingText, { color: colors.textPrimary }]}>
                            {isEditMode ? 'Edit Exercise' : 'Add New Exercise'}
                        </Text>
                        {isEditMode && (
                            <TouchableOpacity
                                onPress={handleDeleteExercise}
                                style={[styles.deleteExerciseBtn, { backgroundColor: colors.surface }]}
                            >
                                <Ionicons name="trash-sharp" size={20} color={colors.destructiveAction}/>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.section}>
                        <TextInput
                            style={[styles.exerciseInput, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                            placeholder="Exercise name..."
                            value={exercise.name}
                            onChangeText={alterExerciseField}
                            autoFocus={!isEditMode}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Primary Muscle Group *</Text>
                        <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                            <Picker
                                selectedValue={exercise.primary_muscle_group_id}
                                onValueChange={updatePrimaryMuscle}
                                style={[styles.picker, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                                itemStyle={[styles.pickerItem, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                                dropdownIconColor={colors.textPrimary}
                            >
                                {muscleGroups.map(group => (
                                    <Picker.Item
                                        key={group.value}
                                        label={group.label}
                                        value={group.value}
                                        color={colors.textPrimary}
                                        style={{ backgroundColor: colors.inputBackground }}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Secondary Muscle Group</Text>
                        <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
                            <Picker
                                selectedValue={exercise.secondary_muscle_group_id ?? null}
                                onValueChange={updateSecondaryMuscle}
                                style={[styles.picker, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                                itemStyle={[styles.pickerItem, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                                dropdownIconColor={colors.textPrimary}
                            >
                                <Picker.Item label="None" value={null} color={colors.textPrimary} style={{ backgroundColor: colors.inputBackground }} />
                                {muscleGroups.map(group => (
                                    <Picker.Item
                                        key={group.value}
                                        label={group.label}
                                        value={group.value}
                                        color={colors.textPrimary}
                                        style={{ backgroundColor: colors.inputBackground }}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.rightButtons}>
                            <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={onClose}>
                                <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                            </Pressable>
                            <Pressable style={[styles.addButton, { backgroundColor: colors.primaryAction }]} onPress={handleSaveExercise}>
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
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalCard: {
        width: "100%",
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
    },
    closeText: {
        fontSize: 18,
    },
    section: {
        rowGap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
    },
    exerciseInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    pickerContainer: {
        borderRadius: 10,
        overflow: "hidden",
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
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 5,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "500",
    },
    addButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
    },
    deleteExerciseBtn: {
        padding: 8,
        borderRadius: 8,
    },
});
