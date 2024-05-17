import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Switch, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQrCardList } from '@/api/qr_card'; // Import the useQrCardList hook
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function Balance() {
  const route = useRoute();
  const { qr } = route.params as { qr: string };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const { data: qrCardList, isLoading: qrCardLoading, isError: qrCardError } = useQrCardList(); // Use the useQrCardList hook

  useEffect(() => {
    if (qrCardList) {
      const qrCard = qrCardList.find((item) => item.card_no === qr);
      if (qrCard) {
        setCredits(qrCard.credits);
      } else {
        setCredits(null);
      }
    }
  }, [qrCardList, qr]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (qrCardLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (qrCardError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
        <View style={styles.headerContent}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          <Text style={[styles.headerText, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
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
      <View style={styles.content}>
        <Text style={[styles.qrText, isDarkMode ? styles.darkText : styles.lightText]}>Account: <Text style={styles.qrCode}>{qr}</Text></Text>
        {credits !== null ? (
          <View style={[styles.creditsContainer, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            <Text style={[styles.creditsText]}>Remaining Credits:</Text>
            <Text style={[styles.creditValue, isDarkMode ? styles.darkCreditValue : styles.lightCreditValue]}>{credits}</Text>
          </View>
        ) : (
          <Text style={[styles.noCreditsText, isDarkMode ? styles.darkNoCreditsText : styles.lightNoCreditsText]}>No credits found for this QR code</Text>
        )}
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#e5e5e5',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 10,
  },
  toggle: {},
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrCode: {
    textDecorationLine: 'underline',
  },
  creditsContainer: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Dimensions.get('window').width * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  creditsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d6b53c',
  },
  creditValue: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  lightCreditValue: {
    color: '#333',
  },
  darkCreditValue: {
    color: '#e5e5e5',
  },
  noCreditsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightNoCreditsText: {
    color: '#dc3545',
  },
  darkNoCreditsText: {
    color: '#e2e2e2',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
