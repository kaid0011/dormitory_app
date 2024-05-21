// Header.tsx
import React from "react";
import { View, Text, StyleSheet, Switch, Image } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
      <View style={styles.headerContent}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
        <Text style={[styles.greeting, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
          Dormitory App
        </Text>
      </View>
      <View style={styles.themeToggleContainer}>
        <FontAwesome6
          name={isDarkMode ? "sun" : "moon"}
          size={24}
          color={isDarkMode ? "#fff" : "#000"}
          style={styles.themeIcon}
        />
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          style={styles.toggle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 10,
  },
  themeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeIcon: {
    marginRight: 10,
  },
  toggle: {},
  logo: {
    width: 50,
    height: 50,
  },
});

export default Header;
