import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQrCardList } from '@/api/qr_card';
import Header from '@/components/Header';

const Balance = () => {
  const route = useRoute();
  const { qr } = route.params as { qr: string };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);

  const { data: qrCardList, isLoading: qrCardLoading, isError: qrCardError } = useQrCardList();

  useEffect(() => {
    if (qrCardList) {
      const qrCard = qrCardList.find((item) => item.card_no === qr);
      if (qrCard) {
        setCredits(qrCard.credits);
        setAccountExists(true);
      } else {
        setCredits(null);
        setAccountExists(false);
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
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <View style={styles.content}>
        {accountExists ? (
          <>
            <Text style={[styles.qrText, isDarkMode ? styles.darkText : styles.lightText]}>
              Account: <Text style={styles.qrCode}>{qr}</Text>
            </Text>
            <View style={[styles.creditsContainer, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
              <Text style={styles.creditsText}>Remaining Credits:</Text>
              <Text style={[styles.creditValue, isDarkMode ? styles.darkCreditValue : styles.lightCreditValue]}>{credits}</Text>
            </View>
          </>
        ) : (
          <Text style={[styles.noAccountText, isDarkMode ? styles.darkNoAccountText : styles.lightNoAccountText]}>
            No existing account under {qr}
          </Text>
        )}
      </View>
    </View>
  );
};

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
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#e5e5e5',
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
  noAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightNoAccountText: {
    color: '#dc3545',
  },
  darkNoAccountText: {
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
});

export default Balance;
