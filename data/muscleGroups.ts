import { MuscleGroup } from './types';

export const MUSCLE_GROUPS: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'rear_delts', 'traps',
    'biceps', 'triceps', 'forearms',
    'quads', 'hamstrings', 'glutes', 'calves',
    'abs', 'obliques', 'hip_flexors', 'core',
    'posterior_chain', 'full_body'
] as const;

export const getMuscleGroupOptions = () => MUSCLE_GROUPS.map(group => ({
    label: group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' '),
    value: group
}));

export const formatMuscleGroup = (group: MuscleGroup): string =>
    group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' ');
