import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View, BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { Camera, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "@/assets/styles/styles";
import { useTheme } from '@/components/ThemeContext';  // Import the useTheme hook

export default function QRscanner() {
  const { isDarkMode, toggleTheme } = useTheme();  // Use the theme context
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

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
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
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
    setScanned(true);
    setTorchEnabled(false); // Turn off the torch
    router.navigate(`/transaction?qr=${data}`);
  };

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={styles.camera}
        facing="back"
        enableTorch={torchEnabled}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View style={styles.qrOverlay}>
          <View style={styles.qrSquare} />
          <Text style={styles.scanText}>Scan QR Code</Text>
        </View>
        <View style={styles.qrButtonContainer}>
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