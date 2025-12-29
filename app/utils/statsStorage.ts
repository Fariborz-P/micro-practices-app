import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "USER_STATS";

export type UserStats = {
  totalPoints: number;
  streak: number;
  lastDoneDate: string | null;
};

const DEFAULT_STATS: UserStats = {
  totalPoints: 0,
  streak: 0,
  lastDoneDate: null,
};

// Load stats from storage
export async function loadStats(): Promise<UserStats> {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return DEFAULT_STATS;
  } catch (e) {
    console.log("Error loading stats:", e);
    return DEFAULT_STATS;
  }
}

// Save stats to storage
export async function saveStats(stats: UserStats) {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.log("Error saving stats:", e);
  }
}

// Reset stats (optional, useful for debugging)
export async function resetStats() {
  await AsyncStorage.removeItem(STATS_KEY);
}
