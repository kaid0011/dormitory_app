import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useInvoiceDetails } from "@/api/invoices";
import { useCouponById } from "@/api/coupons";
import { shareAsync } from "expo-sharing";
import * as Print from "expo-print";
import { router } from "expo-router";
import { useTransactionByInvoiceId } from "@/api/transactions";
import { useItemList } from "@/api/item_list";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { styles } from "@/assets/styles/styles";
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

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
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, isDarkMode ? styles.darkText : styles.lightText]}>{transaction.serial_no}</Text>
      <Text style={[styles.tableCell, isDarkMode ? styles.darkText : styles.lightText]}>{item.item}</Text>
      <Text style={[styles.tableCell, isDarkMode ? styles.darkText : styles.lightText]}>{transaction.tag_no}</Text>
      <Text style={[styles.tableCell, isDarkMode ? styles.darkText : styles.lightText]}>{item.credits}</Text>
    </View>
  );
};

export default function Invoice() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context

  const route = useRoute();
  const { invoiceId } = route.params as { invoiceId: number };

  const { invoiceDetails, isLoading: invoiceLoading, isError: invoiceError } = useInvoiceDetails(invoiceId);
  const { coupon, isLoading: couponLoading, isError: couponError } = useCouponById(invoiceDetails?.coupon_id || 0);
  const { data: itemList, isLoading: itemListLoading, isError: itemListError } = useItemList();
  const { data: transactions, isLoading: transactionsLoading, isError: transactionsError } = useTransactionByInvoiceId(invoiceId.toString());

  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [pdfContent, setPdfContent] = useState<string | null>(null);

  useEffect(() => {
    const handleBackPress = () => {
      router.replace('/(sendinglaundry)'); // Use replace to prevent going back to two.tsx
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
    let timeoutId: NodeJS.Timeout | undefined;

    if (invoiceLoading || couponLoading || transactionsLoading || itemListLoading) {
      // Set a timeout for 10 seconds
      timeoutId = setTimeout(() => {
        setIsTimedOut(true);
      }, 10000); // 10 seconds
    }

    // Clear the timeout if data fetch completes
    if (!(invoiceLoading || couponLoading || transactionsLoading || itemListLoading) && !(invoiceError || couponError || transactionsError || itemListError)) {
      clearTimeout(timeoutId);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [invoiceLoading, couponLoading, transactionsLoading, itemListLoading, invoiceError, couponError, transactionsError, itemListError]);

  useEffect(() => {
    const generateAndDownloadPDF = async () => {
      if (invoiceDetails && coupon && transactions && itemList) {
        const transactionsContent = transactions.map((transaction, index) => {
          const item = itemList.find((item) => item.id === transaction.item_id);
          return item
            ? `<div class="row">
                 <span class="cell ${isDarkMode ? 'darkText' : 'lightText'}">${index + 1}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : 'lightText'}">${item.item}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : 'lightText'}">${transaction.tag_no}</span>
                 <span class="cell ${isDarkMode ? 'darkText' : 'lightText'}">${item.credits}</span>
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
              <h2 class="cardNo">${coupon.coupon_no}</h2>
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
                    <span class="creditsValue">${invoiceDetails.old_balance}</span>
                  </div>
                  <div class="rowCredits">
                    <span class="creditsValue">
                      <i class="icon"></i>
                    </span>
                  </div>
                  <div class="rowCredits">
                    <span class="creditsSub">TO</span>
                    <span class="creditsValue">${invoiceDetails.new_balance}</span>
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
  }, [invoiceDetails, coupon, transactions, itemList, isDarkMode]);

  const printToFile = async () => {
    if (!pdfContent) return;
    try {
      const { uri } = await Print.printToFileAsync({ html: pdfContent, height: 842, width: 595 });
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.error("Printing error:", error);
    }
  };

  if ((invoiceLoading || couponLoading || transactionsLoading || itemListLoading) && !isTimedOut) {
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

  if (invoiceError || couponError || transactionsError || itemListError || !invoiceDetails || !coupon || !transactions || !itemList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={[styles.h1, isDarkMode ? styles.darkText : styles.lightText]}>INVOICE</Text>
            <View style={styles.orLine} />
          </View>
          <Text style={[styles.invoiceTitle, isDarkMode ? styles.darkText : styles.lightText]}>COTTON CARE DRY CLEANERS</Text>
          <Text style={[styles.invoiceCardNo, isDarkMode ? styles.darkText : styles.lightText]}>{coupon.coupon_no}</Text>
          <View style={styles.invoiceDetailsContainer}>
            <View style={styles.invoiceDetailsRow}>
              <Text style={[styles.invoiceDetailLabel, isDarkMode ? styles.darkText : styles.lightText]}>Invoice No:</Text>
              <Text style={[styles.invoiceDetail, isDarkMode ? styles.darkText : styles.lightText]}>{invoiceDetails.invoice_no}</Text>
            </View>
            <View style={styles.invoiceDetailsRow}>
              <Text style={[styles.invoiceDetailLabel, isDarkMode ? styles.darkText : styles.lightText]}>Date:</Text>
              <Text style={[styles.invoiceDetail, isDarkMode ? styles.darkText : styles.lightText]}>{formatDate(new Date(invoiceDetails.date_time))}</Text>
            </View>
            <View style={styles.invoiceDetailsRow}>
              <Text style={[styles.invoiceDetailLabel, isDarkMode ? styles.darkText : styles.lightText]}>Time:</Text>
              <Text style={[styles.invoiceDetail, isDarkMode ? styles.darkText : styles.lightText]}>{formatTime(new Date(invoiceDetails.date_time))}</Text>
            </View>
            <View style={styles.invoiceDetailsRow}>
              <Text style={[styles.invoiceDetailLabel, isDarkMode ? styles.darkText : styles.lightText]}>Ready By:</Text>
              <Text style={[styles.invoiceDetail, isDarkMode ? styles.darkText : styles.lightText]}>{formatDate(new Date(invoiceDetails.ready_by))}</Text>
            </View>
          </View>
          <View style={styles.invoiceTransactionContainer}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>S/No.</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>Item(s)</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>Tag No.</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>Credit(s)</Text>
            </View>
            {transactions.map((transaction, index) => (
              <TransactionItem key={index} transaction={transaction} itemList={itemList} isDarkMode={isDarkMode} />
            ))}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}></Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}></Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>TOTAL:</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, isDarkMode ? styles.darkText : styles.lightText]}>{invoiceDetails.total_credits}</Text>
            </View>
          </View>
          <View style={styles.invoiceCreditsContainer}>
            <Text style={[styles.invoiceCreditsLabel, isDarkMode ? styles.darkText : styles.lightText]}>CREDITS STATUS</Text>
            <View style={styles.invoiceTableCredits}>
              <View style={styles.invoiceRowCredits}>
                <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>FROM</Text>
                <Text style={[styles.h3, isDarkMode ? styles.darkText : styles.lightText]}>{invoiceDetails.old_balance}</Text>
              </View>
              <View style={styles.invoiceRowCredits}>
                <Text style={[styles.h3, isDarkMode ? styles.darkText : styles.lightText]}>
                  <Ionicons name="trending-down" style={styles.invoiceCreditIcon} />
                </Text>
              </View>
              <View style={styles.invoiceRowCredits}>
                <Text style={[styles.h5, isDarkMode ? styles.darkText : styles.lightText]}>TO</Text>
                <Text style={[styles.h3, isDarkMode ? styles.darkText : styles.lightText]}>{invoiceDetails.new_balance}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.fullWidthButton, isDarkMode ? styles.darkButton : styles.lightButton]}
        onPress={printToFile}
      >
        <Text style={[styles.h4, isDarkMode ? styles.darkButtonText : styles.lightButtonText]}>
        Download
        </Text>
      </TouchableOpacity>
    </View>
  );
}
