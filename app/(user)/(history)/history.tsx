import React from 'react';
import { useState, useEffect } from "react";
// import { supabase } from "../../../lib/supabase";
// import { Session } from "@supabase/supabase-js";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Item {
  id: string;
  invoiceNo: string;
  cardNo: string;
  date: string;
  time: string;
}

export default function History() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [data, setData] = useState<Item[]>([]);

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
  };

  const handleStartDateChange = (event: Event, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate || startDate);
  };

  const handleEndDateChange = (event: Event, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    setEndDate(selectedDate || endDate);
  };

  const fetchData = () => {
    // Fetch data based on startDate and endDate
    // Example data
    const fetchedData: Item[] = [
      { id: '1', invoiceNo: '12345', cardNo: '67890', date: '2024-05-07', time: '10:00 AM' },
      { id: '2', invoiceNo: '54321', cardNo: '09876', date: '2024-05-08', time: '11:00 AM' },
      // Add more data as needed
    ];
    setData(fetchedData);
    setTotalTransactions(fetchedData.length);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}><Text style={styles.bold}>Invoice No.:</Text> {item.invoiceNo}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Card No.:</Text> {item.cardNo}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Date:</Text> {item.date}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Time:</Text> {item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.datePickerButton} onPress={toggleStartDatePicker}>
          <Text>{startDate ? startDate.toDateString() : 'Select Start Date'}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            // onChange={handleStartDateChange}
          />
        )}
        <TouchableOpacity style={styles.datePickerButton} onPress={toggleEndDatePicker}>
          <Text>{endDate ? endDate.toDateString() : 'Select End Date'}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            // onChange={handleEndDateChange}
          />
        )}
      </View>
      <TouchableOpacity style={styles.fetchButton} onPress={fetchData}>
        <Text style={styles.fetchButtonText}>Fetch Data</Text>
      </TouchableOpacity>
      <View style={styles.totalTransactionsContainer}>
        <Text style={styles.totalTransactionsText}>Total Transactions: {totalTransactions}</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  datePickerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  datePickerButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  fetchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fetchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalTransactionsContainer: {
    marginBottom: 10,
  },
  totalTransactionsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemDetails: {
    marginLeft: 10,
  },
  itemText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
});
