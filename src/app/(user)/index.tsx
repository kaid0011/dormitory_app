import React, { useEffect } from "react";
import { Text, View, Pressable, BackHandler } from "react-native";
import { Link, router } from "expo-router";
import { styles } from '@/assets/styles/styles';
import Header from "@/components/Header";
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function HomeScreen() {
  const { isDarkMode } = useTheme();  // Use the theme context

  useEffect(() => {
    const handleBackPress = () => {
      router.replace('/');
      return true; // This prevents the default back button behavior
    };

    // Adding the hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup the listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [router]);

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <View style={styles.directoryContainer}>
        {["Sending Laundry", "Returning Laundry", "Check Balance", "History"].map((label, index) => (
          <Link
            key={index}
            style={[styles.directoryButton, isDarkMode ? styles.darkButton : styles.lightButton]}
            href={`./(${label.toLowerCase().replace(' ', '')})`}
            asChild
          >
            <Pressable>
              <Text style={[styles.h2, isDarkMode ? styles.darkButtonText : styles.lightButtonText]}>
                {label}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
