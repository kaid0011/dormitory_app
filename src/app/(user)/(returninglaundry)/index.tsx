import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, BackHandler, ActivityIndicator } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { router } from 'expo-router';
import { useAllInvoices, InvoiceData, useUpdateInvoiceStatus } from "@/api/invoice";
import Header from "@/components/Header";
import { styles } from '@/assets/styles/styles';
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function ReturningLaundry() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { invoices, isLoading, isError, fetchAllInvoices } = useAllInvoices();
  const { updateInvoiceStatus, isUpdating } = useUpdateInvoiceStatus();
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  
  useEffect(() => {
    fetchAllInvoices();
  }, []);


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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (isLoading) {
      // Set a timeout for 10 seconds
      timeoutId = setTimeout(() => {
        setIsTimedOut(true);
      }, 10000); // 10 seconds
    }

    // Clear the timeout if data fetch completes
    if (!isLoading && !isError) {
      clearTimeout(timeoutId);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, isError]);

  const ongoingInvoices = invoices.filter((invoice) => invoice.status === 'Ongoing');

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : ongoingInvoices.map(item => item.id));
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter(itemId => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const handleReturn = async () => {
    for (const id of selectedItems) {
      await updateInvoiceStatus(id);
    }
    await fetchAllInvoices();
    setSelectedItems([]);
    setSelectAll(false);
  };

  const renderItem = ({ item }: { item: InvoiceData }) => (
    <View style={[styles.returningListContainer, isDarkMode ? styles.darkCard : styles.lightCard]}>
      <BouncyCheckbox
        isChecked={selectedItems.includes(item.id)}
        onPress={() => toggleItemSelection(item.id)}
        size={25}
        fillColor="green"
        iconStyle={{ borderColor: 'green', marginLeft: 10 }}
      />
      <View style={styles.returningDetails}>
        <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>
          <Text style={[styles.details, isDarkMode ? styles.darkText : styles.lightText]}>Invoice No.:</Text> {item.invoice_no}
        </Text>
        <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>
          <Text style={[styles.details, isDarkMode ? styles.darkText : styles.lightText]}>Coupon No.:</Text> {item.card_no}
        </Text>
        <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>
          <Text style={[styles.details, isDarkMode ? styles.darkText : styles.lightText]}>Date:</Text> {new Date(item.date_time).toLocaleDateString()}
        </Text>
        <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>
          <Text style={[styles.details, isDarkMode ? styles.darkText : styles.lightText]}>Time:</Text> {new Date(item.date_time).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  
  if (isLoading && !isTimedOut) {
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

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <FlatList
        data={ongoingInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.returningList}
      />
      <View style={[styles.footer, isDarkMode ? styles.darkFooter : styles.lightFooter]}>
        <BouncyCheckbox
          isChecked={selectAll}
          onPress={toggleSelectAll}
          size={25}
          fillColor="green"
          iconStyle={{ borderColor: 'green' }}
          text="Select All"
          textStyle={isDarkMode ? styles.darkText : styles.lightText}
        />
        <TouchableOpacity
          style={[styles.returnButton, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={handleReturn}
          disabled={isUpdating}
        >
          <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>Return</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}