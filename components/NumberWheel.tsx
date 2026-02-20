import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { useTheme } from '@/theme/useTheme';

interface NumberWheelProps {
    initialValue?: number;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    onValueChange?: (value: number) => void;
}

const NumberWheel: React.FC<NumberWheelProps> = ({
        initialValue = 10,
        value: externalValue,
        onValueChange,
        min = 0,
        max = 1043, // max decided based on Ronnie Coleman's leg press record video
        step = 1,
        label = '',
    }) => {
    const { colors } = useTheme();

    const numbers = React.useMemo(() => {
        return Array.from(
            { length: Math.floor((max - min) / step) + 2 },
            (_, i) => ({
                label: (min + i * step).toString(),
                value: min + i * step,
            })
        );
    }, [min, max, step]);

    const selectedIndex = numbers.findIndex(
        (num) => num.value === (externalValue ?? initialValue)
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
            <WheelPickerExpo
                height={300}
                width={150}
                initialSelectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                items={numbers}
                backgroundColor={colors.surface}
                selectedStyle={{ borderColor: colors.primaryAction, borderWidth: 1 }}
                onChange={({ item }) => {
                    const newValue = item.value as number;
                    onValueChange?.(newValue);
                }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    display: {
        height: 50,
        width: 120,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 8,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        width: 120,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        borderWidth: 2,
        paddingHorizontal: 16,
    },
});

export default NumberWheel;
