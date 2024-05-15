import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAllInvoices, useInvoiceDetails } from '@/api/invoice'; // Import the hooks to fetch all invoices and invoice details
import { useQrCardById } from '@/api/qr_card'; // Import the hook to fetch QR card details
import { printAsync } from 'expo-print'; // Import printAsync function from Expo SDK
import * as FileSystem from 'expo-file-system'; // Import FileSystem module from Expo SDK

import TransactionTable from '@/components/TransactionTable'; // Import the TransactionTable component

export default function Invoice() {
  const route = useRoute();
  const { invoiceId } = route.params as { invoiceId: number }; // Get the invoiceId parameter from the route
  const { credit } = route.params as { credit: number }; 
  const { totalCredits } = route.params as { totalCredits: number }; 

  const { invoiceDetails, isLoading: invoiceLoading, isError: invoiceError } = useInvoiceDetails(invoiceId); // Fetch invoice details
  const { qrCard, isLoading: qrCardLoading, isError: qrCardError } = useQrCardById(invoiceDetails?.card_id || 0); // Fetch QR card details based on invoice card_id

  const [pdfUri, setPdfUri] = useState<string | null>(null); // State to store the PDF URI after downloading

  useEffect(() => {
    const generateAndDownloadPDF = async () => {
      if (invoiceDetails && qrCard) {
        const pdfContent = `
          Invoice ID: ${invoiceDetails.id}
          Invoice No: ${invoiceDetails.invoice_no}
          Date / Time: ${invoiceDetails.date_time.toString()}
          Ready By: ${invoiceDetails.ready_by.toString()}
          Status: ${invoiceDetails.status}
          QR Card ID: ${qrCard.id}
          QR Card No: ${qrCard.card_no}
          Credits: ${qrCard.credits}
          Credits: ${credit}
          Credits: ${totalCredits}
          Transactions:
          ${JSON.stringify(TransactionTable)} // This might need adjustment depending on how TransactionTable is structured
        `;
        
        const pdfUri = `${FileSystem.cacheDirectory}invoice.pdf`;
        await FileSystem.writeAsStringAsync(pdfUri, pdfContent, { encoding: FileSystem.EncodingType.UTF8 });
        setPdfUri(pdfUri);
      }
    };

    generateAndDownloadPDF();
  }, [invoiceDetails, qrCard]);

  const handlePrint = async () => {
    if (pdfUri) {
      try {
        await printAsync({ uri: pdfUri });
      } catch (error) {
        console.error('Printing error:', error);
      }
    }
  };

  if (invoiceLoading || qrCardLoading) {
    return <Text>Loading...</Text>;
  }

  if (invoiceError || qrCardError || !invoiceDetails || !qrCard) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice Details</Text>
      <Text>Invoice ID: {invoiceDetails.id}</Text>
      <Text>Invoice No: {invoiceDetails.invoice_no}</Text>
      <Text>Date / Time: {invoiceDetails.date_time.toString()}</Text>
      <Text>Ready By: {invoiceDetails.ready_by.toString()}</Text>
      <Text>Status: {invoiceDetails.status}</Text>
      <Text>QR Card ID: {qrCard.id}</Text>
      <Text>QR Card No: {qrCard.card_no}</Text>
      <Text>Credits: {qrCard.credits}</Text>
      
      <TransactionTable invoiceId={invoiceId} />

      <Text>Credits: {credit}</Text>
      <Text>Credits: {totalCredits}</Text>
      <Text>Credits: {qrCard.credits}</Text>

      <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
        <Text style={styles.printButtonText}>Print</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  printButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
