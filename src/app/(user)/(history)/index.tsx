import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, BackHandler } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAllInvoices, InvoiceData } from "@/api/invoice";
import { router } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Header from '@/components/Header';

const History = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceData[]>([]);
  const { invoices, isLoading, isError, fetchAllInvoices } = useAllInvoices();

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  useEffect(() => {
    setFilteredInvoices(invoices);
  }, [invoices]);

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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleStartDatePicker = () => setShowStartDatePicker(!showStartDatePicker);
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
      const filtered = invoices.filter(invoice => {
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

  const renderItem = useCallback(({ item }: { item: InvoiceData }) => (
    <View style={[styles.itemContainer, isDarkMode ? styles.darkList : styles.lightList]}>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Invoice No.:</Text> {item.invoice_no}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Card No.:</Text> {item.card_id}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Date:</Text> {new Date(item.date_time).toLocaleDateString()}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Time:</Text> {new Date(item.date_time).toLocaleTimeString()}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Status:</Text> {item.status}</Text>
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleViewButton(item)}>
        <FontAwesome6 name={"up-right-from-square"} size={24} color={"#d6b53c"} />
      </TouchableOpacity>
    </View>
  ), [isDarkMode]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (isError) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={[styles.datePickerButton, isDarkMode ? styles.darkList : styles.lightList]} onPress={toggleStartDatePicker}>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>{startDate ? startDate.toDateString() : 'Select Start Date'}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        <TouchableOpacity style={[styles.datePickerButton, isDarkMode ? styles.darkList : styles.lightList]} onPress={toggleEndDatePicker}>
          <Text style={isDarkMode ? styles.darkText : styles.lightText}>{endDate ? endDate.toDateString() : 'Select End Date'}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
        <TouchableOpacity style={[styles.searchButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={filterInvoicesByDate}>
          <FontAwesome6
            name={"magnifying-glass"}
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
            style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.totalTransactionsContainer}>
        <Text style={isDarkMode ? styles.totalTransactionsTextDark : styles.totalTransactionsTextLight}>Total Transactions: {filteredInvoices.length}</Text>
      </View>
      <FlatList
        data={filteredInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightMode: {
    backgroundColor: "#fdfdfd",
  },
  darkMode: {
    backgroundColor: "#001b1d",
  },
  flatList: {
    paddingTop: 10,
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: "#ccc",
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  lightList: {
    backgroundColor: '#f0f0f0',
  },
  darkList: {
    backgroundColor: '#333',
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#e5e5e5',
  },
  bold: {
    fontWeight: 'bold',
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
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  themeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeIcon: {
    marginRight: 10,
  },
  toggle: {},
  logo: {
    width: 50,
    height: 50,
  },
  lightButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#edc01c",
  },
  lightButtonText: {
    color: "#382d06",
    fontSize: 18,
    fontWeight: "bold",
  },
  darkButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#d6b53c",
  },
  darkButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  datePickerContainer: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButton: {
    flex: 4,
    height: 50,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  totalTransactionsContainer: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalTransactionsTextLight: {
    color: '#d6b53c',
    fontSize: 16,
  },
  totalTransactionsTextDark: {
    color: '#d6b53c',
    fontSize: 16,
  },
  iconButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default History;
