import React from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme/useTheme";

interface NotesModalProps {
    visible: boolean;
    notes: string;
    onNotesChange: (notes: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({visible, notes, onNotesChange, onSave, onCancel}) => {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.notesModal, { backgroundColor: colors.card }]}>
                    <View style={[styles.notesHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                        <Text style={[styles.notesHeaderText, { color: colors.textPrimary }]}>Exercise Notes</Text>
                    </View>
                    <TextInput
                        style={[styles.notesInput, { color: colors.textPrimary, backgroundColor: colors.card }]}
                        multiline
                        placeholder="Add notes for this exercise..."
                        placeholderTextColor={colors.textMuted}
                        value={notes}
                        onChangeText={onNotesChange}
                        textAlignVertical="top"
                    />
                    <View style={[styles.notesButtonContainer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={[styles.notesButton, { backgroundColor: colors.textMuted }]}
                        >
                            <Text style={{color: 'white', fontWeight: '600'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onSave}
                            style={[styles.notesButton, { backgroundColor: colors.primaryAction }]}
                        >
                            <Text style={{color: 'white', fontWeight: '600'}}>Save</Text>
                        </TouchableOpacity>
                    </View>
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
    notesModal: {
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
    },
    notesHeaderText: {
        fontSize: 18,
        fontWeight: '600',
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
    },
    notesButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
});
