import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, DeviceEventEmitter } from 'react-native';
import {clearAsyncStorage, dumpAsyncStorage, seedExercisesIfEmpty} from "@/data/dataUtils";
import {ComponentProps, useEffect} from "react";
import type {
    TabNavigationState,
    NavigationHelpers,
    ParamListBase
} from '@react-navigation/native';

function CustomTabBar({state, navigation}: {
    state: TabNavigationState<ParamListBase>;
    navigation: NavigationHelpers<ParamListBase>;
}) {    const currentRoute = state.routes[state.index];
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

    type IconName = ComponentProps<typeof Ionicons>['name'];

    const tabIcons: Record<string, IconName> = {
        'index': 'home-outline',
        'add/index': 'add-circle-outline',
        'settings/index': 'settings-outline',
    } as const;

    // Default navigation bar
    return (
        <View style={styles.tabBar}>
            {state.routes.map((route: { name: string; key: string }, index: number) => {
                const isFocused = state.index === index;

                const iconName = tabIcons[route.name] ?? 'question-circle-outline';

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
            <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
        </Tabs>
    );
}

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