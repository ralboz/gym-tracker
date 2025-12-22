import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React from "react";

interface NotesModalProps {
    visible: boolean;
    notes: string;
    onNotesChange: (notes: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({visible, notes, onNotesChange, onSave, onCancel}) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.notesModal}>
                    <View style={styles.notesHeader}>
                        <Text style={styles.notesHeaderText}>Exercise Notes</Text>
                    </View>
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        placeholder="Add notes for this exercise..."
                        value={notes}
                        onChangeText={onNotesChange}
                        textAlignVertical="top"
                    />
                    <View style={styles.notesButtonContainer}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={[styles.notesButton, styles.cancelButton]}
                        >
                            <Text style={{color: 'white', fontWeight: '600'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onSave}
                            style={[styles.notesButton, styles.saveNotesButton]}
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
});
