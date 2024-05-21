import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, Switch } from "react-native";
import { Link } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function HomeScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle theme
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const themeStyles = isDarkMode ? styles.darkMode : styles.lightMode;
  const headerStyles = isDarkMode ? styles.darkHeader : styles.lightHeader;
  const headerTextStyles = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const buttonStyles = isDarkMode ? styles.darkButton : styles.lightButton;
  const buttonTextStyles = isDarkMode ? styles.darkButtonText : styles.lightButtonText;

  return (
    <View style={[styles.container, themeStyles]}>
      <View style={[styles.header, headerStyles]}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
        <Text style={[styles.greeting, headerTextStyles]}>Dormitory App</Text>
        <View style={styles.themeToggleContainer}>
          <FontAwesome6
            name={isDarkMode ? "sun" : "moon"}
            size={24}
            color="#e2e2e2"
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
        {["Sending Laundry", "Returning Laundry", "Check Balance", "History"].map((label, index) => (
          <Link
            key={index}
            style={buttonStyles}
            href={`./(${label.toLowerCase().replace(' ', '')})`}
            asChild
          >
            <Pressable style={styles.buttonContent}>
              <Text style={buttonTextStyles}>{label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
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
  },
});
