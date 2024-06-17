import React, { useEffect } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useFonts, Yantramanav_400Regular, Yantramanav_700Bold } from '@expo-google-fonts/yantramanav';
import * as SplashScreen from 'expo-splash-screen';

interface FontTextProps extends TextProps {
  style?: TextStyle | TextStyle[];
}

const FontText: React.FC<FontTextProps> = ({ style, children, ...props }) => {
  let [fontsLoaded] = useFonts({
    Yantramanav_400Regular,
    Yantramanav_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (!fontsLoaded) {
        await SplashScreen.preventAutoHideAsync();
      } else {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Return null until fonts are loaded
  }

  const combinedStyle = StyleSheet.flatten(style);
  const fontFamily = combinedStyle?.fontWeight === 'bold' ? 'Yantramanav_700Bold' : 'Yantramanav_400Regular';

  return (
    <Text style={[styles.defaultText, style, { fontFamily }]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 16, // Default font size
    color: '#000', // Default text color
  },
});

export default FontText;
