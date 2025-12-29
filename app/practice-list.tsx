import { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BACKEND_URL } from "./config/config";

export default function PracticeList() {
  const { category } = useLocalSearchParams();   // <-- FIXED
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("PracticeList mounted with category:", category);

  async function fetchPractices() {
    try {
      console.log("Fetching from backend:", `${BACKEND_URL}/get_practices?category=${category}`);

      const response = await fetch(`${BACKEND_URL}/get_practices?category=${category}`);

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Received data:", data);

      setPractices(data);
    } catch (error) {
      console.log("Error loading practices:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchPractices();
}, [category]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Practices in: {category}
      </Text>

      {practices.map((practice) => (
        <View key={practice.id} style={{ marginVertical: 10 }}>
          <Button
            title={practice.name}
            onPress={() =>
              router.push(`/practice?id=${practice.id}&category=${category}`)
            }
          />
        </View>
      ))}
    </View>
  );
}
