import React from "react";
import {View, StyleSheet} from "react-native";
import {AddNewExerciseForm} from "@/components/AddNewExerciseForm";

export default function SettingsScreen() {




    return (
        <View style={styles.container}>
            <AddNewExerciseForm />
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
    }
});
