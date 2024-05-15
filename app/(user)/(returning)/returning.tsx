import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useAllInvoices, InvoiceData } from "@/api/invoice";
import { useUpdateInvoiceStatus } from "@/api/invoice"; // Import the useUpdateInvoiceStatus hook

export default function ReturningLaundry() {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { invoices, isLoading, isError, fetchAllInvoices } = useAllInvoices(); // Use the useAllInvoices hook to fetch invoice data
  const { updateInvoiceStatus, isUpdating, isError: updateError } = useUpdateInvoiceStatus(); // Use the useUpdateInvoiceStatus hook

  const ongoingInvoices = invoices.filter((invoice) => invoice.status === 'ongoing');

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
    // Update status to "returned" for each selected item
    for (const id of selectedItems) {
      await updateInvoiceStatus(id);
    }
    // After updating all selected items, fetch all invoices
    await fetchAllInvoices();
    // Reset selected items after return
    setSelectedItems([]);
    setSelectAll(false);
  };

  const renderItem = ({ item }: { item: InvoiceData }) => (
    <View style={styles.itemContainer}>
      <BouncyCheckbox
        isChecked={selectedItems.includes(item.id)}
        onPress={() => toggleItemSelection(item.id)}
        size={25}
        fillColor="green"
        iconStyle={{ borderColor: 'green', marginLeft: 10 }}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}><Text style={styles.bold}>Invoice No.:</Text> {item.invoice_no}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Card No.:</Text> {item.card_id}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Date:</Text> {item.date_time.toLocaleDateString()}</Text>
        <Text style={styles.itemText}><Text style={styles.bold}>Time:</Text> {item.date_time.toLocaleTimeString()}</Text>
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
    <View style={styles.container}>
      <FlatList
        data={ongoingInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.flatList}
      />
      <View style={styles.footer}>
        <BouncyCheckbox
          isChecked={selectAll}
          onPress={toggleSelectAll}
          size={25}
          fillColor="green"
          iconStyle={{ borderColor: 'green' }}
          text="Select All"
        />
        <TouchableOpacity style={styles.button} onPress={handleReturn} disabled={isUpdating}>
          <Text style={styles.buttonText}>Return</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
