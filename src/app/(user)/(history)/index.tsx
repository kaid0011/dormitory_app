import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAllInvoices, InvoiceData } from "@/api/invoice";
import { router } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Header from "@/components/Header";
import { styles } from "@/assets/styles/styles";
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function History() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceData[]>([]);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const { invoices, isLoading, isError, fetchAllInvoices } = useAllInvoices();

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  useEffect(() => {
    setFilteredInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    const handleBackPress = () => {
      router.replace("/"); // Use replace to prevent going back to two.tsx
      return true; // This prevents the default back button behavior
    };

    // Adding the hardware back button listener
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    // Cleanup the listener on component unmount
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
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

  const toggleStartDatePicker = () =>
    setShowStartDatePicker(!showStartDatePicker);
  const toggleEndDatePicker = () => setShowEndDatePicker(!showEndDatePicker);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate || startDate);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    setEndDate(selectedDate || endDate);
  };

  const filterInvoicesByDate = () => {
    if (startDate && endDate) {
      const filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.date_time);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  };

  const handleViewButton = (item: InvoiceData) => {
    const invoiceId = item.id;
    router.navigate(`/invoice_history?invoiceId=${invoiceId}`);
  };

  const renderItem = useCallback(
    ({ item }: { item: InvoiceData }) => (
      <View
        style={[
          styles.historyContainer,
          isDarkMode ? styles.darkCard : styles.lightCard,
        ]}
      >
        <View style={styles.returningDetails}>
          <Text
            style={[
              styles.h5,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            <Text style={styles.details}>Invoice No.:</Text> {item.invoice_no}
          </Text>
          <Text
            style={[
              styles.h5,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            <Text style={styles.details}>Card No.:</Text> {item.card_id}
          </Text>
          <Text
            style={[
              styles.h5,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            <Text style={styles.details}>Date:</Text>{" "}
            {new Date(item.date_time).toLocaleDateString()}
          </Text>
          <Text
            style={[
              styles.h5,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            <Text style={styles.details}>Time:</Text>{" "}
            {new Date(item.date_time).toLocaleTimeString()}
          </Text>
          <Text
            style={[
              styles.h5,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            <Text style={styles.details}>Status:</Text> {item.status}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleViewButton(item)}
        >
          <FontAwesome6
            name={"up-right-from-square"}
            size={24}
            color={"#d6b53c"}
          />
        </TouchableOpacity>
      </View>
    ),
    [isDarkMode]
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
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkBg : styles.lightBg,
      ]}
    >
      <Header />
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            isDarkMode ? styles.darkCard : styles.lightCard,
          ]}
          onPress={toggleStartDatePicker}
        >
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>
            {startDate ? startDate.toDateString() : "Select Start Date"}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            isDarkMode ? styles.darkCard : styles.lightCard,
          ]}
          onPress={toggleEndDatePicker}
        >
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>
            {endDate ? endDate.toDateString() : "Select End Date"}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isDarkMode ? styles.darkButton : styles.lightButton,
          ]}
          onPress={filterInvoicesByDate}
        >
          <FontAwesome6
            name={"magnifying-glass"}
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
            style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.totalTransactionsContainer}>
        <Text
          style={
            isDarkMode
              ? styles.totalTransactionsTextDark
              : styles.totalTransactionsTextLight
          }
        >
          Total Transactions: {filteredInvoices.length}
        </Text>
      </View>
      <FlatList
        data={filteredInvoices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.returningList}
      />
    </View>
  );
}
