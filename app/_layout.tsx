import { Tabs , useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, DeviceEventEmitter } from 'react-native';
import {clearAsyncStorage, dumpAsyncStorage, seedExercisesIfEmpty} from "@/data/dataUtils";
import {useEffect} from "react";

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        height: 60,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


function CustomTabBar({ state, descriptors, navigation }) {
    const router = useRouter();

    const currentRoute = state.routes[state.index];
    const isAddScreen = currentRoute.name === 'add/index';

    if (isAddScreen) {
        // Special navigation bar
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('SAVE-WORKOUT');
                    }}
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('ADD-EXERCISE');
                    }}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('DELETE-WORKOUT');
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>
        );
    }

    // Default navigation bar
    return (
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                let iconName;
                switch (route.name) {
                    case 'index':
                        iconName = 'home-outline';
                        break;
                    case 'add/index':
                        iconName = 'add-circle-outline';
                        break;
                    case 'stats/index':
                        iconName = 'stats-chart-outline';
                        break;
                    default:
                        iconName = 'question-circle-outline';
                        break;
                }

                const onPress = () => {
                    navigation.navigate(route.name);
                };

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.tabButton}
                        onPress={onPress}
                    >
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={isFocused ? '#007AFF' : '#8E8E93'}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function RootLayout() {

    useEffect(() => {
        // clearAsyncStorage();
        seedExercisesIfEmpty().catch(console.error);
        // dumpAsyncStorage();
    }, []);

    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="add/index" options={{ title: "Add" }} />
            <Tabs.Screen name="stats/index" options={{ title: "Stats" }} />
        </Tabs>
    );
}

