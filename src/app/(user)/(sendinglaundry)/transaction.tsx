import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useItemList } from "@/api/item_list";
import { useQrCardList, updateQrCardCredits } from "@/api/qr_card";
import { useInsertInvoice, useLastInsertedInvoiceId } from "@/api/invoice";
import { useInsertTransaction } from "@/api/transaction";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Header from "@/components/Header";

// Define the TransactionData type
type TransactionData = {
  item_id: number;
  invoice_id: number;
  serial_no: number;
};

export default function Transaction() {
  const route = useRoute();
  const { qr } = route.params as { qr: string };

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [itemCount, setItemCount] = useState<{ [key: string]: number }>({});
  const [credits, setCredits] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState<boolean>(true);

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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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

          if (newCredits < 0) {
            setErrorMessage("Insufficient Credits");
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
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
      <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <View style={styles.noAccountContainer}>
        <Text style={[styles.noAccountText, isDarkMode ? styles.darkNoAccountText : styles.lightNoAccountText]}>
            No existing account under {qr}
          </Text>
        </View>
      </View>
    );
  }

  const numColumns = 3;
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <View style={styles.innerContainer}>
        <View style={[styles.infoContainer, isDarkMode ? styles.infoContainerDark : styles.infoContainerLight]}>
          <Text style={[styles.accountText, isDarkMode ? styles.darkText : styles.lightText]}>
            Account: <Text style={styles.account}>{qr}</Text>
          </Text>
          <Text style={[styles.accountText, isDarkMode ? styles.darkText : styles.lightText]}>
            Credits: <Text style={styles.account}>{credits}</Text>
          </Text>
        </View>
        <FlatList
          style={styles.flatList}
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
                  style={isDarkMode ? styles.darkButton : styles.lightButton}
                  onPress={() => decrementItem(item.id.toString())}
                >
                  <FontAwesome6 name={"minus"} size={10} color={isDarkMode ? "#fff" : "#000"} style={styles.themeIcon} />
                </TouchableOpacity>
                <Text style={[styles.counter, isDarkMode ? styles.darkText : styles.lightText]}>
                  {itemCount[item.id.toString()]}
                </Text>
                <TouchableOpacity
                  style={isDarkMode ? styles.darkButton : styles.lightButton}
                  onPress={() => incrementItem(item.id.toString())}
                >
                  <FontAwesome6 name={"plus"} size={10} color={isDarkMode ? "#fff" : "#000"} style={styles.themeIcon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
        />
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
      <TouchableOpacity
        style={isDarkMode ? styles.darkDoneButton : styles.lightDoneButton}
        onPress={handleDone}
        disabled={isInsertingTransaction || isInsertingInvoice}
      >
        <Text style={isDarkMode ? styles.darkDoneButtonText : styles.lightDoneButtonText}>
          Generate Invoice
        </Text>
      </TouchableOpacity>
      {(insertTransactionError || insertInvoiceError) && (
        <Text style={styles.errorText}>Error inserting data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noAccountContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    paddingBottom: 10,
    flex: 2,
  },
  lightMode: {
    backgroundColor: "#f5f5f5",
  },
  darkMode: {
    backgroundColor: "#001b1d",
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
  lightText: {
    color: "#000",
  },
  darkText: {
    color: "#e5e5e5",
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 20,
  },
  infoContainerLight: {},
  infoContainerDark: {
    backgroundColor: "#333",
  },
  themeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeIcon: {
    padding: 5,
  },
  toggle: {},
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  accountText: {
    fontSize: 18,
    marginBottom: 10,
  },
  account: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  noCreditsText: {
    fontSize: 16,
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
  flatList: {
    padding: 10,
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: "#ccc",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  lightCard: {
    backgroundColor: "#fff",
  },
  darkCard: {
    backgroundColor: "#333",
  },
  item: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  credits: {
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  counter: {
    height: 30,
    fontSize: 16,
    marginHorizontal: 5,
    padding: 5,
    borderColor: "#e5e5e5",
    borderWidth: 0.8,
    borderRadius: 5,
    aspectRatio: 1,
  },
  lightDoneButton: {
    justifyContent: "center",
    height: 50,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#edc01c",
  },
  lightDoneButtonText: {
    color: "#382d06",
    fontSize: 18,
    fontWeight: "bold",
  },
  darkDoneButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#d6b53c",
  },
  darkDoneButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  lightButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#edc01c",
  },
  darkButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#d6b53c",
  },
  noAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightNoAccountText: {
    color: '#dc3545',
  },
  darkNoAccountText: {
    color: '#e2e2e2',
  },
});
