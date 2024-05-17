import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Switch, Image } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useAllInvoices, InvoiceData } from "@/api/invoice";
import { useUpdateInvoiceStatus } from "@/api/invoice";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function ReturningLaundry() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { invoices, isLoading, isError, fetchAllInvoices } = useAllInvoices();
  const { updateInvoiceStatus, isUpdating, isError: updateError } = useUpdateInvoiceStatus();

  const ongoingInvoices = invoices.filter((invoice) => invoice.status === 'Ongoing');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : ongoingInvoices.map(item => item.id));
  };

  const toggleItemSelection = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
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
    <View style={[styles.itemContainer, isDarkMode ? styles.darkList : styles.lightList]}>
      <BouncyCheckbox
        isChecked={selectedItems.includes(item.id)}
        onPress={() => toggleItemSelection(item.id)}
        size={25}
        fillColor="green"
        iconStyle={{ borderColor: 'green', marginLeft: 10 }}
      />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Invoice No.:</Text> {item.invoice_no}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Card No.:</Text> {item.card_id}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Date:</Text> {item.date_time.toLocaleDateString()}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}><Text style={styles.bold}>Time:</Text> {item.date_time.toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
        <View style={styles.headerContent}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          <Text style={[styles.greeting, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
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
      <FlatList
        data={ongoingInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.flatList}
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
        <TouchableOpacity style={isDarkMode ? styles.darkButton : styles.lightButton} onPress={handleReturn} disabled={isUpdating}>
          <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>Return</Text>
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
    backgroundColor: "#fdfdfd",
  },
  darkMode: {
    backgroundColor: "#001b1d",
  },
  flatList: {
    padding: 10,
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  lightList: {
    backgroundColor: '#f0f0f0',
  },
  darkList: {
    backgroundColor: '#333',
  },
  itemDetails: {
    marginLeft: 10,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  lightFooter: {
    backgroundColor: '#f0f0f0',
  },
  darkFooter: {
    backgroundColor: '#333',
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
});
