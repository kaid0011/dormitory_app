import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const Loading = ({ isDarkMode }) => {
  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <Image
        style={styles.loadingGif}
        source={require('@/assets/images/splash.gif')} // Adjust the path to your GIF file
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 500,
    height: 1000,
  },
  lightMode: {
    backgroundColor: '#f5f5f5',
  },
  darkMode: {
    backgroundColor: '#001b1d',
  },
});

export default Loading;
