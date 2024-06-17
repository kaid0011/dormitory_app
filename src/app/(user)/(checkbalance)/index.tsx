import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, BackHandler } from 'react-native';
import { router } from 'expo-router';
import Header from "@/components/Header";
import { styles } from '@/assets/styles/styles';
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function InsertCoupon() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handleBackPress = () => {
      router.replace('/'); // Use replace to prevent going back to two.tsx
      return true; // This prevents the default back button behavior
    };

    // Adding the hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup the listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [router]);

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleSubmit = () => {
    router.navigate(`/balance?qr=${inputValue}`);
  };

  const handleQrCodeScan = () => {
    router.navigate('/qrbalance');
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Enter Coupon Number"
          placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
          value={inputValue}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleSubmit}>
          <Text style={[styles.buttonText, isDarkMode ? styles.darkButtonText : styles.lightButtonText]}>Submit</Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={[styles.orText, { color: isDarkMode ? '#ccc' : '#666' }]}>or</Text>
          <View style={styles.orLine} />
        </View>
        <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleQrCodeScan}>
          <Text style={[styles.buttonText, isDarkMode ? styles.darkButtonText : styles.lightButtonText]}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}