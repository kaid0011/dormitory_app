import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useInvoiceDetails } from "@/api/invoice";
import { useQrCardById } from "@/api/qr_card";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as Print from "expo-print";
import { useTransactionByInvoiceId } from "@/api/transaction"; // Import the hook to fetch transactions by invoice id
import { useItemList } from "@/api/item_list"; // Import the hook to fetch item list
import { TransactionData } from "@/api/transaction"; // Import the TransactionData interface
import { Ionicons } from "@expo/vector-icons";

const [isDarkMode, setIsDarkMode] = useState(false);


// Function to format date without timezone
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Function to format time without timezone
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

interface TransactionItemProps {
  transaction: TransactionData;
  itemList: any[];
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  itemList,
}) => {
  const item = itemList.find((item) => item.id === transaction.item_id);

  if (!item) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.cell}>{transaction.serial_no}</Text>
      <Text style={styles.cell}>{item.item}</Text>
      <Text style={styles.cell}>{item.credits}</Text>
      <Text style={styles.cell}>{transaction.tag_no}</Text>
    </View>
  );
};

export default function Invoice() {
  const route = useRoute();
  const { invoiceId, credit, totalCredits, totalItems } = route.params as {
    invoiceId: number;
    credit: number;
    totalCredits: number;
    totalItems: number;
  };

  const {
    invoiceDetails,
    isLoading: invoiceLoading,
    isError: invoiceError,
  } = useInvoiceDetails(invoiceId);
  const {
    qrCard,
    isLoading: qrCardLoading,
    isError: qrCardError,
  } = useQrCardById(invoiceDetails?.card_id || 0);

  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);

  const {
    data: itemList,
    isLoading: itemListLoading,
    isError: itemListError,
  } = useItemList();

  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useTransactionByInvoiceId(invoiceId.toString());

  useEffect(() => {
    const generateAndDownloadPDF = async () => {
      try {
        if (invoiceDetails && qrCard && transactions && itemList) {
          const transactionsContent = transactions
            .map((transaction, index) => {
              const item = itemList.find(
                (item) => item.id === transaction.item_id
              );
              if (item) {
                return `
                  <div class="row">
                    <span class="cell">${index + 1}</span>
                    <span class="cell">${item.item}</span>
                    <span class="cell">${transaction.tag_no}</span>
                    <span class="cell">${item.credits}</span>
                  </div>
                `;
              }
              return "";
            })
            .join("");


          const pdfContent = `
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
          
              .printBg {
                background-color: green;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
              }
          
              .printButton {
                background-color: blue;
                padding: 15px;
                border-radius: 10px;
                color: #fff;
                font-size: 16px;
                font-weight: bold;
              }
            </style>
          </head>
          
          <body>
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
                    <span class="detail">${formatDate(
                      invoiceDetails.date_time
                    )}</span>
                  </div>
                  <div class="detailsRow">
                    <span class="detailLabel">Time:</span>
                    <span class="detail">${formatTime(
                      invoiceDetails.date_time
                    )}</span>
                  </div>
                  <div class="detailsRow">
                    <span class="detailLabel">Ready By:</span>
                    <span class="detail">${formatDate(
                      invoiceDetails.ready_by
                    )}</span>
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
                  <span class="cell headerCell">${totalCredits}</span>
                </div>
              </div>
          
                <div class="credits">
                  <h2 class="creditsLabel">CREDITS STATUS</h2>
                  <div class="tableCredits">
                    <div class="rowCredits">
                      <span class="creditsSub">FROM</span>
                      <span class="creditsValue">${
                        invoiceDetails.old_credits
                      }</span>
                    </div>
                    <div class="rowCredits">
                      <span class="creditsValue">
                        <i class="icon"></i>
                      </span>
                    </div>
                    <div class="rowCredits">
                      <span class="creditsSub">TO</span>
                      <span class="creditsValue">${
                        invoiceDetails.new_credits
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
          `;

          setPdfContent(pdfContent); // Set pdfContent state variable
          const pdfUri = `${FileSystem.cacheDirectory}invoice.pdf`;
          await FileSystem.writeAsStringAsync(pdfUri, pdfContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          setPdfUri(pdfUri);
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    };
    generateAndDownloadPDF();
  }, [invoiceDetails, qrCard, credit, totalCredits, transactions, itemList]);

  const printToFile = async () => {
    try {
      if (!pdfContent) {
        console.error("PDF content is null");
        return;
      }
      const { uri } = await Print.printToFileAsync({ html: pdfContent || "" }); // Provide a default value if pdfContent is null
      console.log("File has been saved to:", uri);
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.error("Printing error:", error);
    }
  };

  if (
    invoiceLoading ||
    qrCardLoading ||
    transactionsLoading ||
    itemListLoading
  ) {
    return <Text>Loading...</Text>;
  }

  if (
    invoiceError ||
    qrCardError ||
    transactionsError ||
    itemListError ||
    !invoiceDetails ||
    !qrCard ||
    !transactions ||
    !itemList
  ) {
    return <Text>Error fetching data</Text>;
  }

  

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.invoiceContainer}>
        <Text style={styles.title}>COTTON CARE DRY CLEANERS</Text>
        <Text style={styles.cardNo}>{qrCard.card_no}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Invoice No:</Text>
            <Text style={styles.detail}>{invoiceDetails.invoice_no}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detail}>
              {formatDate(invoiceDetails.date_time)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detail}>
              {formatTime(invoiceDetails.date_time)}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Ready By:</Text>
            <Text style={styles.detail}>
              {formatDate(invoiceDetails.ready_by)}
            </Text>
          </View>
        </View>

        <View>
          <View style={styles.transactionContainer}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell]}>S/No.</Text>
              <Text style={[styles.cell, styles.headerCell]}>Item(s)</Text>
              <Text style={[styles.cell, styles.headerCell]}>Tag No.</Text>
              <Text style={[styles.cell, styles.headerCell]}>Credit(s)</Text>
            </View>
            {transactions.map((transaction, index) => (
            <TransactionItem
              key={index}
              transaction={transaction}
              itemList={itemList}
            />
          ))}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell]}></Text>
              <Text style={[styles.cell, styles.headerCell]}></Text>
              <Text style={[styles.cell, styles.headerCell]}>TOTAL:</Text>
              <Text style={[styles.cell, styles.headerCell]}>
                {totalCredits}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.credits}>
          <Text style={styles.creditsLabel}>CREDITS STATUS</Text>
          <View style={styles.tableCredits}>
            <View style={styles.rowCredits}>
              <Text style={styles.creditsSub}>FROM</Text>
              <Text style={styles.creditsValue}>
                {invoiceDetails.old_credits}
              </Text>
            </View>
            <View style={styles.rowCredits}>
              <Text style={styles.creditsValue}>
                <Ionicons name="trending-down" style={styles.icon} />
              </Text>
            </View>
            <View style={styles.rowCredits}>
              <Text style={styles.creditsSub}>TO</Text>
              <Text style={styles.creditsValue}>
                {invoiceDetails.new_credits}
              </Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      <View style={styles.printBg}>
        <TouchableOpacity onPress={printToFile} style={isDarkMode ? styles.darkDownloadButton : styles.lightDownloadButton}>
          <Text style={
            isDarkMode ? styles.darkDownloadButtonText : styles.lightDownloadButtonText
          }>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensure the content can grow and be scrollable
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  invoiceContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 100
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    paddingBottom: 10,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
  totalContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 18,
  },
  total: {
    fontSize: 18,
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
    fontWeight: "bold",
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
    justifyContent: "center",
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
    position: "absolute", // Position the button absolutely
    bottom: 0, // Set bottom to 20px from the bottom of the screen
    left: 0, // Optional: Set left to 20px from the left of the screen
    right: 0, // Optional: Set right to 20px from the right of the screen
  },
  printButton: {
    backgroundColor: "blue",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  lightDownloadButton: {
    justifyContent: "center",
    height: 50,
    alignItems: "center",
    // paddingVertical: 10,
    // paddingHorizontal: 20,
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
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#d6b53c",
  },
  darkDownloadButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
