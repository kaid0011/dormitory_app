import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useInvoiceDetails } from "@/api/invoice";
import { useQrCardById } from "@/api/qr_card";
import { shareAsync } from "expo-sharing";
import * as Print from "expo-print";
import {  } from 'react-native';
import { router } from "expo-router";
import { useTransactionByInvoiceId } from "@/api/transaction";
import { useItemList } from "@/api/item_list";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

interface TransactionItemProps {
  transaction: any;
  itemList: any[];
  isDarkMode: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, itemList, isDarkMode }) => {
  const item = itemList.find((item) => item.id === transaction.item_id);

  if (!item) return null;

  return (
    <View style={styles.row}>
      <Text style={[styles.cell, isDarkMode && styles.darkText]}>{transaction.serial_no}</Text>
      <Text style={[styles.cell, isDarkMode && styles.darkText]}>{item.item}</Text>
      <Text style={[styles.cell, isDarkMode && styles.darkText]}>{transaction.tag_no}</Text>
      <Text style={[styles.cell, isDarkMode && styles.darkText]}>{item.credits}</Text>
    </View>
  );
};

export default function Invoice() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const route = useRoute();
  const { invoiceId } = route.params as { invoiceId: number };

  const { invoiceDetails, isLoading: invoiceLoading, isError: invoiceError } = useInvoiceDetails(invoiceId);
  const { qrCard, isLoading: qrCardLoading, isError: qrCardError } = useQrCardById(invoiceDetails?.card_id || 0);
  const { data: itemList, isLoading: itemListLoading, isError: itemListError } = useItemList();
  const { data: transactions, isLoading: transactionsLoading, isError: transactionsError } = useTransactionByInvoiceId(invoiceId.toString());

  const [pdfContent, setPdfContent] = useState<string | null>(null);

  useEffect(() => {
    const handleBackPress = () => {
      router.replace('/(history)'); // Use replace to prevent going back to two.tsx
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
    const generateAndDownloadPDF = async () => {
      if (invoiceDetails && qrCard && transactions && itemList) {
        const transactionsContent = transactions.map((transaction, index) => {
          const item = itemList.find((item) => item.id === transaction.item_id);
          return item
            ? `<div class="row">
                 <span class="cell ${isDarkMode ? 'darkText' : ''}">${index + 1}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : ''}">${item.item}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : ''}">${transaction.tag_no}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : ''}">${item.credits}</span>
               </div>`
            : "";
        }).join("");

        const content = `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
            .container {
              flex: 1;
              background-color: #fff;
            }
            .invoiceContainer {
              flex: 1;
              padding: 20px;
              background-color: #fff;
            }
            .title {
              font-size: 15px;
              font-weight: bold;
              margin-bottom: 20px;
              padding-bottom: 10px;
              text-align: center;
              border-bottom: 1px solid #ccc;
            }
            .cardNo {
              font-size: 30px;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            .detailsContainer {
              margin-bottom: 20px;
              padding: 20px;
              border-bottom: 1px solid #ccc;
              border-top: 1px solid #ccc;
            }
            .detailsRow {
              display: flex;
              align-items: center;
            }
            .detailLabel {
              flex: 1;
              font-size: 16px;
              font-weight: bold;
            }
            .detail {
              flex: 2;
              font-size: 16px;
            }
            .transactionContainer {
              margin-bottom: 10px;
            }
            .row {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #ccc;
              align-items: center;
            }
            .cell {
              flex: 1;
              text-align: center;
              font-size: 16px;
            }
            .headerCell {
              font-weight: bold;
            }
            .credits {
              margin-top: 25px;
              padding: 25px;
              align-items: center;
              text-align: center;
              border: 1px solid gray;
              border-radius: 5px;
            }
            .creditsLabel {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
            }
            .icon {
              font-weight: bold;
              font-size: 30px;
              color: red;
            }
            .tableCredits {
              display: flex;
              justify-content: space-between;
            }
            .rowCredits {
              flex: 1;
              align-items: center;
              justify-content: center;
            }
            .creditsValue {
              font-size: 25px;
              font-weight: bold;
            }
            .creditsSub {
              font-size: 12px;
            }
          </style>
        </head>
        
        <body class="">
          <div class="container">
            <div class="invoiceContainer">
              <h1 class="title">COTTON CARE DRY CLEANERS</h1>
              <h2 class="cardNo">${qrCard.card_no}</h2>
              <div class="detailsContainer">
                <div class="detailsRow">
                  <span class="detailLabel">Invoice No:</span>
                  <span class="detail">${invoiceDetails.invoice_no}</span>
                </div>
                <div class="detailsRow">
                  <span class="detailLabel">Date:</span>
                  <span class="detail">${formatDate(invoiceDetails.date_time)}</span>
                </div>
                <div class="detailsRow">
                  <span class="detailLabel">Time:</span>
                  <span class="detail">${formatTime(invoiceDetails.date_time)}</span>
                </div>
                <div class="detailsRow">
                  <span class="detailLabel">Ready By:</span>
                  <span class="detail">${formatDate(invoiceDetails.ready_by)}</span>
                </div>
              </div>
        
              <div class="transactionContainer">
              <div class="row">
                <span class="cell headerCell">S/No.</span>
                <span class="cell headerCell">Item(s)</span>
                <span class="cell headerCell">Tag No.</span>
                <span class="cell headerCell">Credit(s)</span>
              </div>
              ${transactionsContent}
              <div class="row">
                <span class="cell headerCell"></span>
                <span class="cell headerCell"></span>
                <span class="cell headerCell">TOTAL:</span>
                <span class="cell headerCell">${invoiceDetails.total_credits}</span>
              </div>
            </div>
        
              <div class="credits">
                <h2 class="creditsLabel">CREDITS STATUS</h2>
                <div class="tableCredits">
                  <div class="rowCredits">
                    <span class="creditsSub">FROM</span>
                    <span class="creditsValue">${invoiceDetails.old_credits}</span>
                  </div>
                  <div class="rowCredits">
                    <span class="creditsValue">
                      <i class="icon"></i>
                    </span>
                  </div>
                  <div class="rowCredits">
                    <span class="creditsSub">TO</span>
                    <span class="creditsValue">${invoiceDetails.new_credits}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
        `;
        setPdfContent(content);
      }
    };
    generateAndDownloadPDF();
  }, [invoiceDetails, qrCard, transactions, itemList, isDarkMode]);

  const printToFile = async () => {
    if (!pdfContent) return;
    try {
      const { uri } = await Print.printToFileAsync({ html: pdfContent });
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.error("Printing error:", error);
    }
  };

  if (invoiceLoading || qrCardLoading || transactionsLoading || itemListLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (invoiceError || qrCardError || transactionsError || itemListError || !invoiceDetails || !qrCard || !transactions || !itemList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.invoiceContainer}>
          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={[styles.invoiceTitle, isDarkMode && styles.darkText]}>INVOICE</Text>
            <View style={styles.line} />
          </View>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>COTTON CARE DRY CLEANERS</Text>
          <Text style={[styles.cardNo, isDarkMode && styles.darkText]}>{qrCard.card_no}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Invoice No:</Text>
              <Text style={[styles.detail, isDarkMode && styles.darkText]}>{invoiceDetails.invoice_no}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Date:</Text>
              <Text style={[styles.detail, isDarkMode && styles.darkText]}>{formatDate(new Date(invoiceDetails.date_time))}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Time:</Text>
              <Text style={[styles.detail, isDarkMode && styles.darkText]}>{formatTime(new Date(invoiceDetails.date_time))}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Ready By:</Text>
              <Text style={[styles.detail, isDarkMode && styles.darkText]}>{formatDate(new Date(invoiceDetails.ready_by))}</Text>
            </View>
          </View>
          <View style={styles.transactionContainer}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>S/No.</Text>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>Item(s)</Text>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>Tag No.</Text>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>Credit(s)</Text>
            </View>
            {transactions.map((transaction, index) => (
              <TransactionItem key={index} transaction={transaction} itemList={itemList} isDarkMode={isDarkMode} />
            ))}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell]}></Text>
              <Text style={[styles.cell, styles.headerCell]}></Text>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>TOTAL:</Text>
              <Text style={[styles.cell, styles.headerCell, isDarkMode && styles.darkText]}>{invoiceDetails.total_credits}</Text>
            </View>
          </View>
          <View style={styles.credits}>
            <Text style={[styles.creditsLabel, isDarkMode && styles.darkText]}>CREDITS STATUS</Text>
            <View style={styles.tableCredits}>
              <View style={styles.rowCredits}>
                <Text style={[styles.creditsSub, isDarkMode && styles.darkText]}>FROM</Text>
                <Text style={[styles.creditsValue, isDarkMode && styles.darkText]}>{invoiceDetails.old_credits}</Text>
              </View>
              <View style={styles.rowCredits}>
                <Text style={[styles.creditsValue, isDarkMode && styles.darkText]}>
                  <Ionicons name="trending-down" style={styles.icon} />
                </Text>
              </View>
              <View style={styles.rowCredits}>
                <Text style={[styles.creditsSub, isDarkMode && styles.darkText]}>TO</Text>
                <Text style={[styles.creditsValue, isDarkMode && styles.darkText]}>{invoiceDetails.new_credits}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.printBg}>
        <TouchableOpacity onPress={printToFile} style={isDarkMode ? styles.darkDownloadButton : styles.lightDownloadButton}>
          <Text style={isDarkMode ? styles.darkDownloadButtonText : styles.lightDownloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  lightMode: {
    backgroundColor: "#fdfdfd",
  },
  darkMode: {
    backgroundColor: "#001b1d",
  },
  invoiceContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  lineContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#666',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 10,
    textAlign: "center",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    padding: 10,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardNo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  detailsContainer: {
    marginBottom: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  detail: {
    flex: 2,
    fontSize: 16,
  },
  transactionContainer: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  headerCell: {
    fontWeight: "bold",
  },
  darkText: {
    color: "#ffffff",
  },
  credits: {
    marginTop: 25,
    padding: 25,
    alignItems: "center",
    textAlign: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
  },
  creditsLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  icon: {
    fontSize: 30,
    color: "red",
  },
  tableCredits: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowCredits: {
    flex: 1,
    alignItems: "center",
  },
  creditsValue: {
    fontSize: 25,
    fontWeight: "bold",
  },
  creditsSub: {
    fontSize: 12,
  },
  printBg: {
    backgroundColor: "green",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  lightDownloadButton: {
    justifyContent: "center",
    height: 50,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#edc01c",
  },
  lightDownloadButtonText: {
    color: "#382d06",
    fontSize: 18,
    fontWeight: "bold",
  },
  darkDownloadButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#d6b53c",
  },
  darkDownloadButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
  },
});
