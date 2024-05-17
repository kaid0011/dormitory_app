import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, Switch } from "react-native";
import { Link } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function HomeScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle theme
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Get today's date and next 4 dates
  const today = new Date();

  const nextDates: string[] = []; // Explicitly type the array as string[]
  for (let i = 0; i <= 4; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    nextDates.push(formatDate(nextDate));
  }

  function formatDate(date: Date): string {
    const options = { month: "long", day: "numeric", weekday: "long" };
    const month = date
      .toLocaleDateString("en-US", { month: "long" })
      .slice(0, 3);
    const day = date.toLocaleDateString("en-US", { day: "numeric" });
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .slice(0, 3);
    return `${month}\n${day}\n${dayOfWeek}`;
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <Text style={[styles.greeting, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
          Dormitory App
        </Text>
        <View style={styles.themeToggleContainer}>
          <FontAwesome6
            name={isDarkMode ? "sun" : "moon"}
            size={24}
            color={isDarkMode ? "#e2e2e2" : "#e2e2e2"}
            style={styles.themeIcon}
          />
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            style={styles.toggle}
          />
        </View>
      </View>
      <View style={styles.directory}>
        <Link style={isDarkMode ? styles.darkButton : styles.lightButton} href="./(sending)" asChild>
          <Pressable style={styles.buttonContent}>
            <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>Sending Laundry</Text>
          </Pressable>
        </Link>
        <Link style={isDarkMode ? styles.darkButton : styles.lightButton} href="./(returning)" asChild>
          <Pressable style={styles.buttonContent}>
            <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>Returning Laundry</Text>
          </Pressable>
        </Link>
        <Link style={isDarkMode ? styles.darkButton : styles.lightButton} href="./(balance)" asChild>
          <Pressable style={styles.buttonContent}>
            <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>Check Balance</Text>
          </Pressable>
        </Link>
        <Link style={isDarkMode ? styles.darkButton : styles.lightButton} href="./(history)" asChild>
          <Pressable style={styles.buttonContent}>
            <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>History</Text>
          </Pressable>
        </Link>
      </View>
      {/* <Button title="Sign Out" onPress={() => supabase.auth.signOut()} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  lightMode: {
    backgroundColor: "#fdfdfd",
  },
  darkMode: {
    backgroundColor: "#001b1d",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  directory: {
    alignItems: "center",
    width: "100%",
    paddingTop: 30,
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    paddingTop: 70,
  },
  lightHeader: {
    backgroundColor: "#00545E",
  },
  darkHeader: {
    backgroundColor: "#002a2e",
  },
  lightHeaderText: {
    color: "#e2e2e2",
  },
  darkHeaderText: {
    color: "#e2e2e2",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  themeToggleContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  themeIcon: {
    marginRight: 10,
  },
  toggle: {},
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  lightButton: {
    width: "80%",
    height: 100,
    backgroundColor: "#edc01c",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  lightButtonText: {
    color: "#382d06",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  darkButton: {
    width: "80%",
    height: 100,
    backgroundColor: "#ba9d32",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  darkButtonText: {
    color: "#e5e5e5",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
