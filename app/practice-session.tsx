import { View, Text, Image, Button, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "./config/config";
import { loadStats, saveStats } from "./utils/statsStorage";
import {getCachedPractices,setCachedPractices} from "./utils/practiceCache";
// Target DONE practices per category (not "seen")
const TARGET_DONE = {
  morning_stretching: 3,
  office: 6,
  daily_home_practices: 4,
};

const MAX_SKIPS = 3;

export default function PracticeSession() {
  const { category } = useLocalSearchParams();
  const [practices, setPractices] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const targetDone = useMemo(() => {
    // fallback if category is unknown
    return TARGET_DONE[String(category)] ?? 3;
  }, [category]);

  useEffect(() => {
    async function loadPractices() {
      try {
        const cached = getCachedPractices(String(category));

        if (cached) {
          // Use cached data immediately
          const shuffled = [...cached].sort(() => Math.random() - 0.5);
          setPractices(shuffled);
          return;
        }

        const response = await fetch(
          `${BACKEND_URL}/get_practices?category=${category}`
        );
        const data = await response.json();

        // Cache for next time
        setCachedPractices(String(category), data);

        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setPractices(shuffled);


        setCurrentIndex(0);
        setDoneCount(0);
        setSkipCount(0);
      } catch (e) {
        console.log("Error loading session:", e);
      } finally {
        setLoading(false);
      }
    }

    loadPractices();
  }, [category]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, fontSize: 16 }}>
          Preparing today’s session…
        </Text>
      </View>
    );
  }


  // ✅ End when DONE count reached (not "seen count")
  if (doneCount >= targetDone) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 12 }}>
          🎉 You finished today’s session!
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>
          Done: {doneCount}/{targetDone} • Skips: {skipCount}/{MAX_SKIPS}
        </Text>
        <Button title="Back to Home" onPress={() => router.push("/")} />
      </View>
    );
  }

  // Edge case: user ran out of practices to cycle through
  if (currentIndex >= practices.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 22, textAlign: "center", marginBottom: 12 }}>
          ⚠️ No more practices available.
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>
          You completed {doneCount}/{targetDone} today.
        </Text>
        <Button title="Back to Home" onPress={() => router.push("/")} />
      </View>
    );
  }

  const practice = practices[currentIndex];

  function handleSkip() {
    if (skipCount >= MAX_SKIPS) {
      Alert.alert("Skip limit reached", "You can’t skip more today. Please do the current practice or go back.");
      return;
    }
    setSkipCount((s) => s + 1);
    setCurrentIndex((i) => i + 1);
  }

  async function handleDone() {
    // Load current stats
    const stats = await loadStats();

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let newStreak = stats.streak;
    if (stats.lastDoneDate !== today) {
      newStreak += 1;
    }

    const newStats = {
      totalPoints: stats.totalPoints + 10,
      streak: newStreak,
      lastDoneDate: today,
    };

    await saveStats(newStats);

    // Still notify backend (for future use)
    try {
      await fetch(`${BACKEND_URL}/mark_done`, { method: "POST" });
    } catch (e) {
      console.log("Backend not reachable (ok for MVP)");
    }

    setDoneCount((d) => d + 1);
    setCurrentIndex((i) => i + 1);
  }


  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Progress bar text */}
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          ✅ Done: {doneCount}/{targetDone}   •   ⏭️ Skips: {skipCount}/{MAX_SKIPS}
        </Text>

        <Text style={{ fontSize: 20, marginBottom: 10 }}>
          {String(category).replaceAll("_", " ").toUpperCase()}
        </Text>

        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
          {practice.name}
        </Text>

        <Image
          source={{ uri: `${BACKEND_URL}/get_gif/${practice.gif_filename}` }}
          style={{
            width: "100%",
            height: 300,
            alignSelf: "center",
            marginBottom: 20,
            borderRadius: 8,
          }}
          resizeMode="contain"
        />

        <Text style={{ fontSize: 18, marginBottom: 40 }}>
          {practice.instruction}
        </Text>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 20,
          borderTopWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "white",
        }}
      >
        <Button title="Skip" color="#999" onPress={handleSkip} />
        <Button title="Do it" onPress={handleDone} />
      </View>
    </View>
  );
}
