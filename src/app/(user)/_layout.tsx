import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, ReactNode } from "react";
import { View } from "react-native";
import { styles } from "@/assets/styles/styles";

import { ThemeProvider, useTheme } from "@/components/ThemeContext"; // Import the ThemeProvider

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="(sendinglaundry)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(returninglaundry)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(checkbalance)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(history)" options={{ headerShown: false }} />
        </Stack>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

const ThemeWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  return (
    <View
      style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}
    >
      {children}
    </View>
  );
};
