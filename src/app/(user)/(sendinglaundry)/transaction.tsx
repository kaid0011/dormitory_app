import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useItemList } from "@/api/item_list";
import { useQrCardList, updateQrCardCredits } from "@/api/qr_card";
import { useInsertInvoice, useLastInsertedInvoiceId } from "@/api/invoice";
import { useInsertTransaction } from "@/api/transaction";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Header from "@/components/Header";
import { styles } from "@/assets/styles/styles";
import FontText from "@/components/FontText";
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

// Define the TransactionData type
type TransactionData = {
  item_id: number;
  invoice_id: number;
  serial_no: number;
};

export default function Transaction() {
  const route = useRoute();
  const { qr } = route.params as { qr: string };

  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const [itemCount, setItemCount] = useState<{ [key: string]: number }>({});
  const [credits, setCredits] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState<boolean>(true);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  const { data: itemListData, isLoading: itemListLoading, isError: itemListError } = useItemList();
  const { data: qrCardList, isLoading: qrCardLoading, isError: qrCardError } = useQrCardList();
  const { insertTransaction, isInserting: isInsertingTransaction, isError: insertTransactionError } = useInsertTransaction();
  const { insertInvoice, isInserting: isInsertingInvoice, isError: insertInvoiceError } = useInsertInvoice();
  const { lastInsertedInvoiceId, isLoading: invoiceIdLoading, isError: invoiceIdError } = useLastInsertedInvoiceId();

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

    if (qrCardLoading || itemListLoading || invoiceIdLoading) {
      // Set a timeout for 10 seconds
      timeoutId = setTimeout(() => {
        setIsTimedOut(true);
      }, 10000); // 10 seconds
    }

    // Clear the timeout if data fetch completes
    if (!qrCardLoading && !itemListLoading && !invoiceIdLoading && !qrCardError && !itemListError && !invoiceIdError) {
      clearTimeout(timeoutId);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [qrCardLoading, itemListLoading, invoiceIdLoading, qrCardError, itemListError, invoiceIdError]);

  useEffect(() => {
    if (qrCardList) {
      const qrCard = qrCardList.find((item) => item.card_no === qr);
      if (qrCard) {
        setCredits(qrCard.credits);
        setAccountExists(true);
      } else {
        setCredits(null);
        setAccountExists(false);
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
    setItemCount((prevCounts) => ({
      ...prevCounts,
      [id]: Math.max(0, prevCounts[id] - 1),
    }));
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
          const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
          const day = ("0" + currentDate.getDate()).slice(-2);
          const invoiceNumber = `CC${year}${month}${day}${newInvoiceId.toString().padStart(4, "0")}`;
          const status = "Ongoing";

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
                });
              }
            }
          });

          const oldCredits = qrCard.credits;
          const totalCredits = transactionData.reduce(
            (acc, curr) => acc + (itemListData.find((item) => item.id === curr.item_id)?.credits || 0),
            0
          );
          const newCredits = oldCredits - totalCredits;

          if (newCredits < 0 || oldCredits === 0) {
            setErrorMessage("Insufficient Credits");
            return;
          }

          if (totalCredits === 0) {
            setErrorMessage("Please add an item");
            return;
          }

          const invoiceData = {
            card_id: qrCard.id,
            invoice_no: invoiceNumber,
            status,
            old_credits: oldCredits,
            new_credits: newCredits,
          };

          const { error: invoiceError } = await insertInvoice(invoiceData);
          if (invoiceError) {
            throw new Error("Error inserting data into invoice table");
          }

          await insertTransaction(transactionData);

          // Update QR card credits
          await updateQrCardCredits(qr, totalCredits);

          // Navigate to the invoice screen with the invoiceId parameter
          router.navigate(
            `/invoice?invoiceId=${newInvoiceId}&credit=${oldCredits}&totalItems=${transactionData.length}`
          );
        } else {
          console.error("No matching card found for the QR code");
        }
      }
    } catch (error) {
      console.error("Error handling transaction:", error);
    }
  };

  if (itemListLoading || qrCardLoading || invoiceIdLoading) {
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

  if (itemListError || qrCardError || invoiceIdError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data</Text>
      </View>
    );
  }

  if (!accountExists) {
    return (
      <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
        <Header/>
        <View style={styles.centerContainer}>
          <Text style={[styles.h3, isDarkMode ? styles.darkRedText : styles.lightRedText]}>
            No existing account under {qr}
          </Text>
        </View>
      </View>
    );
  }

  const numColumns = 3;
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Header/>
      <View style={styles.infoContainer}>
        <Text style={[styles.h4, isDarkMode ? styles.darkText : styles.lightText]}>
          Account: <Text style={styles.details}>{qr}</Text>
        </Text>
        <Text style={[styles.h4, isDarkMode ? styles.darkText : styles.lightText]}>
          Credits: <Text style={styles.details}>{credits}</Text>
        </Text>
      </View>
      <View style={styles.itemListContiner}>
        <FlatList
          style={styles.itemList}
          data={itemListData}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                isDarkMode ? styles.darkCard : styles.lightCard,
                { width: screenWidth / numColumns - 20 }, // Adjusted width to fit the screen
              ]}
            >
              <Text style={[styles.item, isDarkMode ? styles.darkText : styles.lightText]}>{item.item}</Text>
              <Text style={[styles.credits, isDarkMode ? styles.darkText : styles.lightText]}>{item.credits} credit(s)</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                  onPress={() => decrementItem(item.id.toString())}
                >
                  <FontAwesome6 name={"minus"} size={10} color={isDarkMode ? "#fff" : "#000"} style={styles.expressionIcon} />
                </TouchableOpacity>
                <Text style={[styles.counter, isDarkMode ? styles.darkText : styles.lightText]}>
                  {itemCount[item.id.toString()]}
                </Text>
                <TouchableOpacity
                  style={[styles.counterButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                  onPress={() => incrementItem(item.id.toString())}
                >
                  <FontAwesome6 name={"plus"} size={10} color={isDarkMode ? "#fff" : "#000"} style={styles.expressionIcon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
        />
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity
        style={[styles.fullWidthButton, isDarkMode ? styles.darkButton : styles.lightButton]}
        onPress={handleDone}
        disabled={isInsertingTransaction || isInsertingInvoice}
      >
        <Text style={[styles.h4, isDarkMode ? styles.darkButtonText : styles.lightButtonText]}>
          Generate Invoice
        </Text>
      </TouchableOpacity>
      {(insertTransactionError || insertInvoiceError) && (
        <Text style={styles.errorText}>Error inserting data</Text>
      )}
    </View>
  );
}
