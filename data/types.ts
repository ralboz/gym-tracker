export type MuscleGroup =
    | 'chest' | 'back' | 'shoulders' | 'rear_delts' | 'traps'
    | 'biceps' | 'triceps' | 'forearms'
    | 'quads' | 'hamstrings' | 'glutes' | 'calves'
    | 'abs' | 'obliques' | 'hip_flexors' | 'core'
    | 'posterior_chain' | 'full_body';

export interface Exercise {
  id: number;
  name: string;
  primary_muscle_group_id: MuscleGroup;
  secondary_muscle_group_id: MuscleGroup | null;
}

export interface WorkoutSetDTO {
  id: number;
  weight: number;
  reps: number;
}

export interface WorkoutExerciseDTO extends Exercise {
  notes: string;
  sets: WorkoutSetDTO[];
}

export interface WorkoutDTO {
  id: number;
  created_date: number;
  exercises: WorkoutExerciseDTO[];
}

export interface ExerciseHistory {
  prSet: WorkoutSetDTO | null;
  recentWorkouts: WorkoutDTO[];
}