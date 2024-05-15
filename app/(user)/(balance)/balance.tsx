import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQrCardList } from '@/api/qr_card'; // Import the useQrCardList hook

export default function Transaction() {
  const route = useRoute();
  const { qr } = route.params as { qr: string };

  const [credits, setCredits] = useState<number | null>(null);

  const { data: qrCardList, isLoading: qrCardLoading, isError: qrCardError } = useQrCardList(); // Use the useQrCardList hook

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

  if (qrCardLoading) {
    return <Text>Loading...</Text>;
  }

  if (qrCardError) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>Scanned Data: {qr}</Text>
      {credits !== null ? (
        <Text>Credits: {credits}</Text>
      ) : (
        <Text>No credits found for this QR code</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
