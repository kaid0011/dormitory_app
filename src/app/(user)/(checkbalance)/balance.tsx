import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, Dimensions, BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCouponList } from '@/api/coupons';
import Header from '@/components/Header';
import { styles } from '@/assets/styles/styles';
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function Balance() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const route = useRoute();
  const { qr } = route.params as { qr: string };
  const [credits, setCredits] = useState<number | null>(null);
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  const { data: couponList, isLoading: couponLoading, isError: couponError } = useCouponList();

  useEffect(() => {
    const handleBackPress = () => {
      router.replace('/(checkbalance)'); // Use replace to prevent going back to two.tsx
      return true; // This prevents the default back button behavior
    };

    // Adding the hardware back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup the listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [router]);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (couponLoading) {
      // Set a timeout for 10 seconds
      timeoutId = setTimeout(() => {
        setIsTimedOut(true);
      }, 10000); // 10 seconds
    }

    // Clear the timeout if data fetch completes
    if (!couponLoading && !couponError) {
      clearTimeout(timeoutId);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [couponLoading, couponError]);

  useEffect(() => {
    if (couponList) {
      const coupon = couponList.find((item) => item.coupon_no === qr);
      if (coupon) {
        setCredits(coupon.balance);
        setAccountExists(true);
      } else {
        setCredits(null);
        setAccountExists(false);
      }
    }
  }, [couponList, qr]);

  if (couponLoading && !isTimedOut) {
    return (
      <View style={[styles.loadingContainer, isDarkMode ? styles.darkBg : styles.lightBg]}>
        <ActivityIndicator size="large" color="#edc01c" />
        <Text style={[styles.loadingText, isDarkMode ? styles.darkText : styles.lightText]}>Loading...</Text>
      </View>
    );
  }
  if (isTimedOut) {
    return (
      <View style={styles.timeoutContainer}>
        <Text style={styles.timeoutText}>The request is taking longer than expected. Please try again later.</Text>
      </View>
    );
  }

  if (couponError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <View style={styles.content}>
        {accountExists ? (
          <>
            <Text style={[styles.h4, isDarkMode ? styles.darkText : styles.lightText]}>
              Account: <Text style={[styles.details, isDarkMode ? styles.darkText : styles.lightText]}>{qr}</Text>
            </Text>
            <View style={[styles.balanceCreditsContainer, isDarkMode ? styles.darkCard : styles.lightCard]}>
              <Text style={styles.balanceCreditsText}>Remaining Credits:</Text>
              <Text style={[styles.balanceCreditValue, isDarkMode ? styles.darkText : styles.lightText]}>{credits}</Text>
            </View>
          </>
        ) : (
          <Text style={[styles.noAccountText, isDarkMode ? styles.darkRedText : styles.lightRedText]}>
            No existing account under {qr}
          </Text>
        )}
      </View>
    </View>
  );
};
