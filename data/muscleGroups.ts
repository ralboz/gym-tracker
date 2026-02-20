import { MuscleGroup } from './types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'rear delts', 'traps',
    'biceps', 'triceps', 'forearms',
    'quads', 'hamstrings', 'glutes', 'calves',
    'abs', 'full body'
] as const;

export const getMuscleGroupOptions = () => MUSCLE_GROUPS.map(group => ({
    label: group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' '),
    value: group
}));

export const formatMuscleGroup = (group: MuscleGroup): string =>
    group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' ');
