import React, {useCallback, useState} from "react";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {Picker} from "@react-native-picker/picker";
import {Exercise, MuscleGroup} from "@/data/types";
import {createExercise} from "@/data/dataUtils";
import {getMuscleGroupOptions}  from '@/data/muscleGroups';


export const AddNewExerciseForm: React.FC = () =>
{
    const [newExercise, setNewExercise] = useState<Omit<Exercise,'id'>>({
        name: "",
        primary_muscle_group_id: 'chest' as MuscleGroup,
        secondary_muscle_group_id: null as MuscleGroup | null
    });

    const muscleGroups = getMuscleGroupOptions();

    const alterNewExerciseField = (value: string) => {
        setNewExercise({...newExercise, name: value});
    };

    const updatePrimaryMuscle = (value: MuscleGroup) => {
        setNewExercise({...newExercise, primary_muscle_group_id: value});
    };

    const updateSecondaryMuscle = (value: MuscleGroup | null) => {
        setNewExercise({...newExercise, secondary_muscle_group_id: value});
    };

    const handleAddNewExercise = useCallback(() => {
        if (newExercise.name.trim() && newExercise.primary_muscle_group_id) {
            createExercise(newExercise);
            // Reset form
            setNewExercise({
                name: "",
                primary_muscle_group_id: 'chest' as MuscleGroup,
                secondary_muscle_group_id: null
            });
        }
    }, [newExercise]);

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.headingText}>Add new exercise</Text>
                <TextInput
                    style={styles.exerciseInput}
                    placeholder="Exercise name..."
                    value={newExercise.name}
                    onChangeText={alterNewExerciseField}
                    autoFocus
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Primary Muscle Group *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={newExercise.primary_muscle_group_id}
                        onValueChange={updatePrimaryMuscle}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {muscleGroups.map((group) => (
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
                        selectedValue={newExercise.secondary_muscle_group_id ?? null}
                        onValueChange={updateSecondaryMuscle}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="None" value={null} />
                        {muscleGroups.map((group) => (
                            <Picker.Item
                                key={group.value}
                                label={group.label}
                                value={group.value}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <Pressable style={styles.addButton} onPress={handleAddNewExercise}>
                <Text style={styles.addButtonText}>Add Exercise</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20,
        marginTop: 60,
        backgroundColor: '#fff'
    },
    section: { gap: 8 },
    headingText: { fontSize: 20, fontWeight: '500' },
    label: { fontSize: 16, fontWeight: '500', color: '#333' },
    exerciseInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden'
    },
    picker: { height: 50 },
    pickerItem: { fontSize: 16, height: 50 },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600'
    }
});
