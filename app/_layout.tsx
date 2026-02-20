import { Ionicons } from '@expo/vector-icons';
import type {
    NavigationHelpers,
    ParamListBase,
    TabNavigationState
} from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps } from 'react';
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/useTheme';

function CustomTabBar({state, navigation}: {
    state: TabNavigationState<ParamListBase>;
    navigation: NavigationHelpers<ParamListBase>;
}) {
    const { colors } = useTheme();
    const currentRoute = state.routes[state.index];
    const isAddScreen = currentRoute.name === 'add/index';

    if (isAddScreen) {
        return (
            <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('DELETE-WORKOUT');
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color={colors.iconDefault} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('ADD-EXERCISE');
                    }}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.iconDefault} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('SAVE-WORKOUT');
                    }}
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color={colors.iconDefault} />
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
        <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
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
                            color={isFocused ? colors.iconActive : colors.iconDefault}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function InnerLayout() {
    const { mode } = useTheme();

    return (
        <>
            <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
            <Tabs
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <CustomTabBar {...props} />}
            >
                <Tabs.Screen name="index" options={{ title: "Home" }} />
                <Tabs.Screen name="add/index" options={{ title: "Add" }} />
                <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
            </Tabs>
            <Toast />
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <InnerLayout />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        height: 60,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
