import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { BACKEND_URL } from "./config/config";

type Practice = {
  id: number;
  name: string;
  main_category: string;
};

export default function AllPractices() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPractices() {
      try {
        const response = await fetch(`${BACKEND_URL}/get_practices`);
        const data = await response.json();
        setPractices(data);
      } catch (e) {
        console.log("Error loading all practices:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchPractices();
  }, []);

  // Group practices by category
  const grouped = practices.reduce<Record<string, Practice[]>>((acc, p) => {
    if (!acc[p.main_category]) acc[p.main_category] = [];
    acc[p.main_category].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading practices...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 All Practices</Text>

      {Object.entries(grouped).map(([category, items]) => (
        <View key={category} style={styles.categoryBlock}>
          <Text style={styles.categoryTitle}>
            {category.replaceAll("_", " ").toUpperCase()}
          </Text>

          {items.map((practice) => (
            <TouchableOpacity
              key={practice.id}
              style={styles.practiceItem}
              onPress={() =>
                router.push(`/practice?id=${practice.id}&category=${category}`)
              }
            >
              <Text style={styles.practiceText}>{practice.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  categoryBlock: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  practiceItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f2f6ff",
    borderRadius: 8,
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 16,
  },
});
