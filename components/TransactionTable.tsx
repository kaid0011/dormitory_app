import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { useTransactionByInvoiceId } from '@/api/transaction'; // Import the hook to fetch transactions by invoice id
import { useItemList } from '@/api/item_list'; // Import the hook to fetch item list
import { TransactionData } from '@/api/transaction'; // Import the TransactionData interface

interface TransactionTableProps {
  invoiceId: number; // Define invoiceId as a number
}

const TransactionTable: React.FC<TransactionTableProps> = ({ invoiceId }) => {
  const { data: transactions, isLoading, isError } = useTransactionByInvoiceId(invoiceId.toString()); // Convert invoiceId to string
  const { data: itemList, isLoading: itemListLoading, isError: itemListError } = useItemList();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  useEffect(() => {
    if (transactions && itemList) {
      let items = 0;
      let credits = 0;
      transactions.forEach(transaction => {
        const item = itemList.find(item => item.id === transaction.item_id);
        if (item) {
          items++;
          credits += item.credits;
        }
      });
      setTotalItems(items);
      setTotalCredits(credits);
    }
  }, [transactions, itemList]);

  if (isLoading || itemListLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError || itemListError || !transactions || !itemList) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Table</Text>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} itemList={itemList} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Text>Total Items: {totalItems}</Text>
      <Text>Total Credits: {totalCredits}</Text>
    </View>
  );
};

const TransactionItem: React.FC<{ transaction: TransactionData; itemList: any[] }> = ({ transaction, itemList }) => {
  const item = itemList.find(item => item.id === transaction.item_id);

  if (!item) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text>Item: {item.item}</Text>
      <Text>Credits: {item.credits}</Text>
      <Text>Serial No: {transaction.serial_no}</Text>
      <Text>Tag No: {transaction.tag_no}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default TransactionTable;
