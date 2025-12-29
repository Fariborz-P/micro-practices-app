import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config/config";
import { loadStats } from "../utils/statsStorage";
import { getCachedPractices, setCachedPractices } from "../utils/practiceCache";

export default function HomeScreen() {
  const [stats, setStats] = useState({ total_streak: 0, total_points: 0 });

  useEffect(() => {
    async function loadLocalStats() {
      const localStats = await loadStats();
      setStats({
        total_points: localStats.totalPoints,
        total_streak: localStats.streak,
      });
    }

    loadLocalStats();

    async function prefetchPractices() {
      const categories = [
        "morning_stretching",
        "office",
        "daily_home_practices",
      ];

      for (const category of categories) {
        if (getCachedPractices(category)) continue;

        try {
          const response = await fetch(
            `${BACKEND_URL}/get_practices?category=${category}`
          );
          const data = await response.json();
          setCachedPractices(category, data);
        } catch (e) {
          console.log("Prefetch failed for", category);
        }
      }
    }

    prefetchPractices();
  }, []);

  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Mini Moves</Text>

        <View style={styles.topRightButtons}>
          <TouchableOpacity onPress={() => router.push("/all-practices")}>
            <Text style={styles.topButton}>📚</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.topButton}>👤</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/connections")}>
            <Text style={styles.topButton}>🔗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Buttons */}
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => router.push("/practice-session?category=morning_stretch")}
      >
        <Text style={styles.categoryText}>🌅 Morning Stretching</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => router.push("/practice-session?category=office")}
      >
        <Text style={styles.categoryText}>💼 Office Practices</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => router.push("/practice-session?category=daily_home_practices")}
      >
        <Text style={styles.categoryText}>🏠 Daily Home Practices</Text>
      </TouchableOpacity>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>🔥 Streak: {stats.total_streak} days</Text>
        <Text style={styles.statsText}>⭐ Points: {stats.total_points}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  topRightButtons: {
    flexDirection: "row",
    gap: 20,
  },
  topButton: {
    fontSize: 24,
  },
  categoryButton: {
    backgroundColor: "#e6f2ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#acd6ff",
  },
  categoryText: {
    fontSize: 20,
    fontWeight: "600",
  },
  statsBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statsText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
