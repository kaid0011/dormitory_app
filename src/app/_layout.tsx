// _layout.tsx
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, ReactNode } from "react";
import "react-native-reanimated";
import "expo-dev-client";
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
          <Stack.Screen name="(user)" options={{ headerShown: false }} />
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
