import NumberWheel from "@/components/NumberWheel";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

interface NumberWheelModalProps {
    visible: boolean;
    value: number;
    field: 'weight' | 'reps' | null;
    onValueChange: (value: number) => void;
    onSave: () => void;
}

export const NumberWheelModal: React.FC<NumberWheelModalProps> = ({visible, value, field, onValueChange, onSave}) =>
{
    const { colors } = useTheme();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.numberWheelModal, { backgroundColor: colors.card }]}>
                    <View style={styles.wheelHeader}>
                        <Text style={[styles.wheelHeaderText, { color: colors.textPrimary }]}>
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
                    <TouchableOpacity onPress={onSave} style={[styles.saveButton, { backgroundColor: colors.primaryAction }]}>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberWheelModal: {
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
    },
    saveButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
});
