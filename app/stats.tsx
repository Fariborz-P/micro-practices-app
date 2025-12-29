import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { BACKEND_URL } from "./config/config";

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const response = await fetch(`${BACKEND_URL}/get_stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.log("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Your Stats</Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Streak: {stats.total_streak}
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Total Points: {stats.total_points}
      </Text>

      <Button title="Refresh" onPress={fetchStats} />
    </View>
  );
}
