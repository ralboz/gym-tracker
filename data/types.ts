export type MuscleGroup =
    | 'chest' | 'back' | 'shoulders' | 'rear delts' | 'traps'
    | 'biceps' | 'triceps' | 'forearms'
    | 'quads' | 'hamstrings' | 'glutes' | 'calves'
    | 'abs' | 'full body';

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