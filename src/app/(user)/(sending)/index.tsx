import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { Camera, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

export default function QRscanner() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button
          onPress={() => {
            (async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === "granted");
            })();
          }}
          title="Grant Permission"
        />
      </View>
    );
  }

  const handleClose = () => {
    navigation.goBack();
  };

  const handleTorch = () => {
    setTorchEnabled((prev) => !prev);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedData(data);
    router.navigate(`/transaction?qr=${scannedData}`);

 // Navigate to Transaction screen with scannedData as param
  };

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={styles.camera}
        facing="back"
        enableTorch={torchEnabled ? true : false}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.square} />
          <Text style={styles.scanText}>Scan QR Code</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.torchButton} onPress={handleTorch}>
            <MaterialIcons
              name={torchEnabled ? "flash-off" : "flash-on"}
              size={40}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  square: {
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
  buttonContainer: {
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
});
