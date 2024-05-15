import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { router } from 'expo-router';
import { useItemList } from '@/api/item_list';
import { useQrCardList, } from '@/api/qr_card';
import { updateQrCardCredits } from '@/api/qr_card'; // Import updateQrCardCredits function
import { useInsertInvoice, useLastInsertedInvoiceId } from '@/api/invoice';
import { useInsertTransaction } from '@/api/transaction';
import { TransactionData } from '@/api/transaction';

export default function Transaction() {
  const route = useRoute();
  const navigation = useNavigation(); // Use the useNavigation hook
  const { qr } = route.params as { qr: string };

  const [itemCount, setItemCount] = useState<{ [key: string]: number }>({});
  const [credits, setCredits] = useState<number | null>(null);

  const { data: itemListData, isLoading: itemListLoading, isError: itemListError } = useItemList();
  const { data: qrCardList, isLoading: qrCardLoading, isError: qrCardError } = useQrCardList();

  const { insertTransaction, isInserting: isInsertingTransaction, isError: insertTransactionError } = useInsertTransaction();
  const { insertInvoice, isInserting: isInsertingInvoice, isError: insertInvoiceError } = useInsertInvoice();
  const { lastInsertedInvoiceId, isLoading: invoiceIdLoading, isError: invoiceIdError } = useLastInsertedInvoiceId();

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

  useEffect(() => {
    if (itemListData) {
      const counts: { [key: string]: number } = {};
      itemListData.forEach((item) => {
        counts[item.id.toString()] = 0;
      });
      setItemCount(counts);
    }
  }, [itemListData]);

  const incrementItem = (id: string) => {
    setItemCount((prevCounts) => ({ ...prevCounts, [id]: prevCounts[id] + 1 }));
  };

  const decrementItem = (id: string) => {
    setItemCount((prevCounts) => ({ ...prevCounts, [id]: Math.max(0, prevCounts[id] - 1) }));
  };

  const handleDone = async () => {
  try {
    if (qrCardList) {
      const qrCard = qrCardList.find((item) => item.card_no === qr);
      if (qrCard) {
        const lastId = lastInsertedInvoiceId === null ? 0 : lastInsertedInvoiceId;
        const newInvoiceId = lastId + 1;
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
        const invoiceNumber = `CC${year}${month}${day}${newInvoiceId.toString().padStart(4, '0')}`;
        const status = "ongoing";

        const invoiceData = {
          card_id: qrCard.id,
          invoice_no: invoiceNumber,
          status: status.toString()
        };

        const { data: insertedInvoiceData, error: invoiceError } = await insertInvoice(invoiceData);
        if (invoiceError) {
          throw new Error('Error inserting data into invoice table');
        }

        const transactionData: TransactionData[] = [];
        let serialNo = 0;

        Object.entries(itemCount).forEach(([itemId, quantity]) => {
          const item = itemListData.find((item) => item.id.toString() === itemId);
          if (item) {
            for (let i = 0; i < quantity; i++) {
              serialNo++;
              transactionData.push({
                item_id: item.id,
                invoice_id: newInvoiceId,
                serial_no: serialNo,
                tag_no: serialNo,
              });
            }
          }
        });

        await insertTransaction(transactionData);

        const invoiceId = newInvoiceId;
        const oldCredit = qrCard.credits;
        const totalItems = transactionData.length;
        const totalCredits = transactionData.reduce((acc, curr) => acc + (itemListData?.find(item => item.id === curr.item_id)?.credits || 0), 0);

        // Update QR card credits
        await updateQrCardCredits(qr, totalCredits);

        // Navigate to the invoice screen with the invoiceId parameter
        router.navigate(`/invoice?invoiceId=${invoiceId}&credit=${oldCredit}&totalItems=${totalItems}&totalCredits=${totalCredits}`);

      } else {
        console.error('No matching card found for the QR code');
      }
    }
  } catch (error) {
    console.error('Error handling transaction:', error);
  }
};

  if (itemListLoading || qrCardLoading || invoiceIdLoading) {
    return <Text>Loading...</Text>;
  }

  if (itemListError || qrCardError || invoiceIdError) {
    return <Text>Error fetching data</Text>;
  }

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Text>Scanned Data: {qr}</Text>
      {credits !== null ? (
        <Text>Credits: {credits}</Text>
      ) : (
        <Text>No credits found for this QR code</Text>
      )}
      <FlatList
        data={itemListData}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: screenWidth / numColumns }]}>
            <Text style={styles.item}>{item.item}</Text>
            <Text style={styles.credits}>{item.credits}</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => decrementItem(item.id.toString())}>
                <Text style={styles.counterButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counter}>{itemCount[item.id.toString()]}</Text>
              <TouchableOpacity onPress={() => incrementItem(item.id.toString())}>
                <Text style={styles.counterButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
      />
      <TouchableOpacity onPress={handleDone} style={styles.doneButton} disabled={isInsertingTransaction || isInsertingInvoice}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
      {(insertTransactionError || insertInvoiceError) && <Text>Error inserting data</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  item: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  credits: {
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  counterButton: {
    fontSize: 20,
    marginHorizontal: 5,
    color: 'blue',
  },
  counter: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  doneButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
