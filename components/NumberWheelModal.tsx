import {Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import NumberWheel from "@/components/NumberWheel";
import React from "react";

interface NumberWheelModalProps {
    visible: boolean;
    value: number;
    field: 'weight' | 'reps' | null;
    onValueChange: (value: number) => void;
    onSave: () => void;
}

export const NumberWheelModal: React.FC<NumberWheelModalProps> = ({visible, value, field, onValueChange, onSave}) =>
{
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.numberWheelModal}>
                    <View style={styles.wheelHeader}>
                        <Text style={styles.wheelHeaderText}>
                            {field === 'weight' ? 'Set Weight (kg)' : 'Set Reps'}
                        </Text>
                    </View>
                    <NumberWheel
                        label={field === 'weight' ? 'Weight (kg)' : 'Reps'}
                        value={value}
                        min={field === 'weight' ? 0 : 1}
                        max={field === 'weight' ? 500 : 50}
                        step={1}
                        onValueChange={onValueChange}
                    />
                    <TouchableOpacity onPress={onSave} style={styles.saveButton}>
                        <Text style={{color: 'white', fontWeight: '600'}}>Save</Text>
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
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
});
