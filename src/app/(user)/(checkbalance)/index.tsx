import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import Header from "@/components/Header";

export default function InsertAccount() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleSubmit = () => {
    router.navigate(`/balance?qr=${inputValue}`);
  };

  const handleQrCodeScan = () => {
    router.navigate('/qrbalance');
  };

  const themeStyles = isDarkMode ? styles.darkMode : styles.lightMode;
  const inputStyles = isDarkMode ? styles.darkInput : styles.lightInput;
  const buttonStyles = isDarkMode ? styles.darkButton : styles.lightButton;
  const buttonTextStyles = isDarkMode ? styles.darkButtonText : styles.lightButtonText;

  return (
    <View style={[styles.container, themeStyles]}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <View style={styles.content}>
        <TextInput
          style={[styles.input, inputStyles]}
          placeholder="Enter Account Number"
          placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
          value={inputValue}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity style={[styles.button, buttonStyles]} onPress={handleSubmit}>
          <Text style={[styles.buttonText, buttonTextStyles]}>Submit</Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={[styles.orText, { color: isDarkMode ? '#ccc' : '#666' }]}>or</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={[styles.button, buttonStyles]} onPress={handleQrCodeScan}>
          <Text style={[styles.buttonText, buttonTextStyles]}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightMode: {
    backgroundColor: '#f5f5f5',
  },
  darkMode: {
    backgroundColor: '#001b1d',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  lightInput: {
    borderColor: '#ccc',
    color: '#000',
    backgroundColor: '#fff',
  },
  darkInput: {
    borderColor: '#666',
    color: '#fff',
    backgroundColor: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  lightButton: {
    backgroundColor: "#edc01c",
  },
  darkButton: {
    backgroundColor: "#d6b53c",
  },
  lightButtonText: {
    color: "#382d06",
  },
  darkButtonText: {
    color: "#ffffff",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
  },
  orText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#666',
  },
});
