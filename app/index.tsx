import { MUSCLE_GROUPS } from "@/data/muscleGroups";
import { MuscleGroup, WorkoutDTO } from "@/data/types";
import { loadWorkouts } from "@/data/workoutsUtils";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface WorkoutStats {
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  volumeThisWeek: number;
  avgVolumePerSession: number;
  mostTrainedMuscle: string | null;
}

function computeStats(workouts: WorkoutDTO[]): WorkoutStats {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let workoutsThisWeek = 0;
  let workoutsThisMonth = 0;
  let volumeThisWeek = 0;
  const muscleCount: Record<string, number> = {};

  for (const workout of workouts) {
    const date = new Date(workout.created_date);
    const volume = workout.exercises.reduce(
      (total, ex) =>
        total + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0,
    );

    if (date >= startOfWeek) {
      workoutsThisWeek++;
      volumeThisWeek += volume;
    }
    if (date >= startOfMonth) {
      workoutsThisMonth++;
    }

    for (const ex of workout.exercises) {
      muscleCount[ex.primary_muscle_group_id] =
        (muscleCount[ex.primary_muscle_group_id] || 0) + 1;
    }
  }

  const avgVolumePerSession =
    workoutsThisWeek > 0 ? Math.round(volumeThisWeek / workoutsThisWeek) : 0;

  const mostTrainedMuscle =
    Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    workoutsThisWeek,
    workoutsThisMonth,
    volumeThisWeek,
    avgVolumePerSession,
    mostTrainedMuscle,
  };
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<WorkoutDTO[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(
    null,
  );
  const [showStats, setShowStats] = useState(true);
  const router = useRouter();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadWorkouts().then(setWorkouts);
    }, []),
  );

  const stats = useMemo(() => computeStats(workouts), [workouts]);

  const sortedWorkouts = useMemo(
    () => [...workouts].sort((a, b) => b.created_date - a.created_date),
    [workouts],
  );

  const filteredWorkouts = useMemo(() => {
    if (!selectedMuscle) return sortedWorkouts;
    return sortedWorkouts.filter((workout) =>
      workout.exercises.some(
        (ex) =>
          ex.primary_muscle_group_id === selectedMuscle ||
          ex.secondary_muscle_group_id === selectedMuscle,
      ),
    );
  }, [sortedWorkouts, selectedMuscle]);

  const getMuscleGroups = (workout: WorkoutDTO): string[] => {
    const groups = new Set<string>();
    workout.exercises.forEach((exercise) => {
      groups.add(exercise.primary_muscle_group_id);
      if (exercise.secondary_muscle_group_id) {
        groups.add(exercise.secondary_muscle_group_id);
      }
    });
    return Array.from(groups);
  };

  const getWorkoutStats = (workout: WorkoutDTO) => {
    const numExercises = workout.exercises.length;
    const numSets = workout.exercises.reduce(
      (total, ex) => total + ex.sets.length,
      0,
    );
    const totalVolume = workout.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((setTotal, set) => setTotal + set.weight * set.reps, 0)
      );
    }, 0);
    return { numExercises, numSets, totalVolume };
  };

  const renderStatsCard = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.statsHeader}
        onPress={() => setShowStats((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.statsHeaderLeft}>
          <Ionicons name="stats-chart" size={20} color={colors.primaryAction} />
          <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
            Overview
          </Text>
        </View>
        <Ionicons
          name={showStats ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {showStats && (
        <View style={styles.statsGrid}>
          <View
            style={[styles.statsGridItem, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.statsGridValue, { color: colors.primaryAction }]}
            >
              {stats.workoutsThisWeek}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>
              This Week
            </Text>
          </View>
          <View
            style={[styles.statsGridItem, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.statsGridValue, { color: colors.primaryAction }]}
            >
              {stats.workoutsThisMonth}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>
              This Month
            </Text>
          </View>
          <View
            style={[styles.statsGridItem, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.statsGridValue, { color: colors.primaryAction }]}
            >
              {stats.volumeThisWeek >= 1000
                ? `${(stats.volumeThisWeek / 1000).toFixed(1)}k`
                : stats.volumeThisWeek.toLocaleString()}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>
              Vol (Week)
            </Text>
          </View>
          <View
            style={[styles.statsGridItem, { backgroundColor: colors.card }]}
          >
            <Text
              style={[styles.statsGridValue, { color: colors.primaryAction }]}
            >
              {stats.avgVolumePerSession >= 1000
                ? `${(stats.avgVolumePerSession / 1000).toFixed(1)}k`
                : stats.avgVolumePerSession.toLocaleString()}
            </Text>
            <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>
              Avg/Session
            </Text>
          </View>
        </View>
      )}

      {showStats && stats.mostTrainedMuscle && (
        <View style={[styles.mostTrained, { borderTopColor: colors.border }]}>
          <Ionicons name="flame" size={16} color={colors.primaryAction} />
          <Text
            style={[styles.mostTrainedText, { color: colors.textSecondary }]}
          >
            Most trained:{" "}
            <Text style={{ fontWeight: "700", color: colors.textPrimary }}>
              {stats.mostTrainedMuscle}
            </Text>
          </Text>
        </View>
      )}
    </View>
  );

  const renderMuscleFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterRow}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        onPress={() => setSelectedMuscle(null)}
        style={[
          styles.filterChip,
          { borderColor: colors.border },
          !selectedMuscle && {
            backgroundColor: colors.primaryAction,
            borderColor: colors.primaryAction,
          },
        ]}
      >
        <Text
          style={
            !selectedMuscle
              ? { color: "white", fontWeight: "600" }
              : { color: colors.textPrimary }
          }
        >
          All
        </Text>
      </TouchableOpacity>
      {MUSCLE_GROUPS.map((group) => (
        <TouchableOpacity
          key={group}
          onPress={() =>
            setSelectedMuscle(selectedMuscle === group ? null : group)
          }
          style={[
            styles.filterChip,
            { borderColor: colors.border },
            selectedMuscle === group && {
              backgroundColor: colors.primaryAction,
              borderColor: colors.primaryAction,
            },
          ]}
        >
          <Text
            style={
              selectedMuscle === group
                ? { color: "white", fontWeight: "600" }
                : { color: colors.textPrimary }
            }
          >
            {group}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWorkoutCard = ({ item: workout }: { item: WorkoutDTO }) => {
    const muscleGroups = getMuscleGroups(workout);
    const { numExercises, numSets, totalVolume } = getWorkoutStats(workout);

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.cardHeader,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(workout.created_date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.muscleGroups}>
            <Text style={[styles.muscleLabel, { color: colors.textMuted }]}>
              Muscles:
            </Text>
            <Text
              style={[styles.muscleGroupsText, { color: colors.textPrimary }]}
            >
              {muscleGroups.join(", ")}
            </Text>
          </View>

          <View style={styles.workoutStatsContainer}>
            <View style={styles.workoutStatItem}>
              <Text
                style={[
                  styles.workoutStatNumber,
                  { color: colors.textPrimary },
                ]}
              >
                {numExercises}
              </Text>
              <Text
                style={[styles.workoutStatLabel, { color: colors.textMuted }]}
              >
                Exercises
              </Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text
                style={[
                  styles.workoutStatNumber,
                  { color: colors.textPrimary },
                ]}
              >
                {numSets}
              </Text>
              <Text
                style={[styles.workoutStatLabel, { color: colors.textMuted }]}
              >
                Sets
              </Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text
                style={[
                  styles.workoutStatNumber,
                  { color: colors.textPrimary },
                ]}
              >
                {totalVolume.toLocaleString()}
              </Text>
              <Text
                style={[styles.workoutStatLabel, { color: colors.textMuted }]}
              >
                Volume
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryAction }]}
            onPress={() => {
              router.push(`/add?workoutId=${workout.id}`);
            }}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!workouts.length) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="barbell-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No workouts yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          Tap the + tab to log your first workout
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(workout) => workout.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
        ListHeaderComponent={
          <>
            {renderStatsCard()}
            {renderMuscleFilter()}
            {filteredWorkouts.length === 0 && selectedMuscle && (
              <View style={styles.noResults}>
                <Text
                  style={[styles.noResultsText, { color: colors.textMuted }]}
                >
                  No workouts targeting {selectedMuscle}
                </Text>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  statsGridItem: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  statsGridValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statsGridLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  mostTrained: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  mostTrainedText: {
    fontSize: 14,
  },
  filterRow: {
    marginBottom: 12,
    maxHeight: 50,
  },
  filterContent: {
    alignItems: "center",
    paddingVertical: 4,
  },
  filterChip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardContent: {
    padding: 20,
  },
  muscleGroups: {
    marginBottom: 16,
  },
  muscleLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  muscleGroupsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  workoutStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  workoutStatItem: {
    alignItems: "center",
    flex: 1,
  },
  workoutStatNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  workoutStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
  },
});
