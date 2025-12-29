import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, Button, ActivityIndicator } from "react-native";
import { BACKEND_URL } from "./config/config";

export default function PracticeScreen() {
  const { id, category } = useLocalSearchParams();   // <-- FIXED HERE
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPractice() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/get_practices?category=${category}`
        );
        const data = await response.json();

        // Find the practice with matching id
        const selected = data.find((p) => String(p.id) === String(id));
        setPractice(selected);
      } catch (error) {
        console.log("Error loading practice:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPractice();
  }, [id, category]);

  if (loading || !practice) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function handleDone() {
    try {
      await fetch(`${BACKEND_URL}/mark_done`, { method: "POST" });

      router.push("/stats");
    } catch (error) {
      console.log("Error sending done:", error);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        {practice.name}
      </Text>

      <Image
        source={{ uri: `${BACKEND_URL}/get_gif/${practice.gif_filename}` }}
        style={{
          width: 300,
          height: 300,
          alignSelf: "center",
          marginBottom: 20,
        }}
      />

      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Instruction: Do this practice slowly for a few seconds.
      </Text>

      <Button title="Done" onPress={handleDone} />
    </View>
  );
}
