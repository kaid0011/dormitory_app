// styles/styles.ts
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const numColumns = 3;

export const styles = StyleSheet.create({
  // start of general styles
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 20,
    paddingBottom: 100,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  // text styles
  title: {
    fontWeight: "bold",
    fontSize: 25,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  caption: {
    fontWeight: "bold",
    fontSize: 13,
  },
  h1: {
    fontWeight: "bold",
    fontSize: 25,
  },
  h2: {
    fontWeight: "bold",
    fontSize: 21,
  },
  h3: {
    fontWeight: "bold",
    fontSize: 19,
  },
  h4: {
    fontWeight: "bold",
    fontSize: 17,
  },
  h5: {
    fontWeight: "bold",
    fontSize: 15,
  },
  h6: {
    fontWeight: "bold",
    fontSize: 13,
  },
  p: {
    fontWeight: "bold",
    fontSize: 12,
  },
  details: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  lightRedText: {
    fontWeight: "bold",
    color: "#dc3545",
  },
  darkRedText: {
    fontWeight: "bold",
    color: "#e2e2e2",
  },

  // button styles
  fullWidthButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  lightButton: {
    backgroundColor: "#edc01c",
  },
  darkButton: {
    backgroundColor: "#d6b53c",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  lightButtonText: {
    color: "#382d06",
  },
  darkButtonText: {
    color: "#ffffff",
  },

  // card styles
  card: {
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    width: screenWidth / numColumns - 20,
  },
  lightCard: {
    backgroundColor: "#fff",
  },
  darkCard: {
    backgroundColor: "#333",
  },

  // input styles
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  lightInput: {
    borderColor: "#ccc",
    color: "#000",
    backgroundColor: "#fff",
  },
  darkInput: {
    borderColor: "#666",
    color: "#fff",
    backgroundColor: "#333",
  },

  // light and dark styles
  lightBg: {
    backgroundColor: "#f5f5f5",
  },
  darkBg: {
    backgroundColor: "#001b1d",
  },
  lightText: {
    color: "#000",
  },
  darkText: {
    color: "#e5e5e5",
  },

  // ---------- end of general styles ----------

  // ---------- start of Header ----------

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
  themeToggleContainer: {
    position: "absolute",
    top: 50,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  themeIcon: {
    marginRight: 10,
  },
  toggle: {},
  headerLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },

  // ---------- end of Header ----------

  // ---------- start of (index) ----------

  // directory buttons
  directoryContainer: {
    alignItems: "center",
    width: "100%",
    paddingTop: 30,
  },
  directoryButton: {
    width: "80%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  // ---------- end of (index) ----------

  // ---------- start of (sendinglaundry)/index AND (checkbalance)/index ----------
  // or with x-horizontal lines
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
    justifyContent: "center",
  },
  orText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#666",
  },

  // ---------- end of (sendinglaundry)/index ----------

  // ---------- start of (sendinglaundry)/qrsending AND (checkbalance)/index ----------

  camera: {
    flex: 1,
  },
  qrOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  qrSquare: {
    width: 250,
    height: 250,
    borderColor: "white",
    borderWidth: 4,
  },
  scanText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
  },
  qrButtonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    justifyContent: "space-around",
  },
  torchButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
    borderRadius: 8,
  },
  // ---------- end of (sendinglaundry)/qrsending ----------

  // ---------- start of (sendinglaundry)/transaction ----------

  infoContainer: {
    padding: 20,
  },
  item: {
    fontWeight: "bold",
    fontSize: 16,

    marginBottom: 5,
  },
  counterButton: {
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 3,
  },
  expressionIcon: {
    padding: 5,
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
  itemListContiner: {
    paddingBottom: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemList: {
    flex: 1,
  },
  ccTitle: {
    fontWeight: "bold",
    fontSize: 15,

    marginBottom: 20,
    padding: 10,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  // ---------- end of (sendinglaundry)/transaction ----------

  // ---------- start of (sendinglaundry)/invoice ----------

  invoiceDetailsContainer: {
    marginBottom: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  invoiceDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  invoiceDetailLabel: {
    fontWeight: "bold",
    flex: 1,
    fontSize: 16,
  },
  invoiceDetail: {
    flex: 2,
    fontSize: 16,
  },
  invoiceTransactionContainer: {
    marginBottom: 10,
  },
  invoiceCardNo: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  invoiceCreditsContainer: {
    marginTop: 25,
    padding: 25,
    alignItems: "center",
    textAlign: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
  },
  invoiceTableCredits: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  invoiceRowCredits: {
    flex: 1,
    alignItems: "center",
  },
  invoiceCreditIcon: {
    fontSize: 30,
    color: "red",
  },
  invoiceCreditsLabel: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  invoiceTitle: {
    fontWeight: "bold",
    marginBottom: 20,
    padding: 10,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  // ---------- end of (sendinglaundry)/invoice ----------

  // ---------- start of (returninglaundry)/index ----------

  returningListContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  returningDetails: {
    marginLeft: 10,
  },
  returningList: {
    padding: 10,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 2,
  },
  lightFooter: {
    borderTopColor: "#e8e8e8",
    backgroundColor: "#f0f0f0",
  },
  darkFooter: {
    borderTopColor: "#2b2b2b",
    backgroundColor: "#333",
  },
  returnButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#edc01c",
  },

  // ---------- end of (returninglaundry)/index ----------

  // ---------- start of (checkbalance)/balance ----------

  balanceCreditsContainer: {
    width: Dimensions.get("window").width * 0.7,
    height: Dimensions.get("window").width * 0.7,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Dimensions.get("window").width * 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  balanceCreditsText: {
    fontWeight: "bold",
    fontSize: 20,

    color: "#d6b53c",
  },
  balanceCreditValue: {
    fontWeight: "bold",
    fontSize: 50,

    paddingTop: 10,
  },
  // ---------- end of (checkbalance)/balance ----------

  // ---------- start of (history)/index ----------
  historyContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  datePickerContainer: {
    flexDirection: "row",
    margin: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerButton: {
    flex: 4,
    height: 50,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  totalTransactionsContainer: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  totalTransactionsTextLight: {
    fontWeight: "bold",
    color: "#d6b53c",
    fontSize: 16,
  },
  totalTransactionsTextDark: {
    fontWeight: "bold",
    color: "#d6b53c",
    fontSize: 16,
  },

  // ---------- end of (history)/index ----------

  // ---------- start of table styles ----------

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  tableHeaderCell: {
    fontWeight: "bold",
  },

  // ---------- start of table styles ----------

  // ---------- start of error styles ----------

  noAccountContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noCreditsText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Padding to avoid edge-to-edge content
  },
  loadingText: {
    fontSize: 20, // Slightly larger font size for better readability
    marginTop: 20, // Space between the indicator and the text
  },
  timeoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff3cd", // Light yellow background to indicate caution
    padding: 20,
  },
  timeoutText: {
    fontSize: 18,
    color: "#856404", // Darker text color for better readability on light yellow background
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8d7da", // Light red background to indicate error
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#721c24", // Darker text color for better readability on light red background
    fontWeight: "bold",
    marginBottom: 10,
  },
  noAccountText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  // ---------- end of error styles ----------
});
