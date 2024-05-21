import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import Supabase client

interface QrCard {
  id: number;
  card_no: string;
  credits: number;
  account_id: number;
  coupon_no: number;
}

export function useQrCardList() {
  const [data, setData] = useState<QrCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchQrCardList() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from<QrCard>('qr_card').select('*');
        if (error) {
          throw new Error('Error fetching data');
        }
        setData(data || []);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQrCardList();
  }, []);

  return { data, isLoading, isError };
}

export function useQrCardById(cardId: number) {
  const [qrCard, setQrCard] = useState<QrCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchQrCardById() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from<QrCard>('qr_card')
          .select('*')
          .eq('id', cardId)
          .single();

        if (error) {
          throw new Error('Error fetching data');
        }

        setQrCard(data || null);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (cardId) { // Add a check to ensure cardId is truthy before fetching data
      fetchQrCardById();
    } else {
      setIsLoading(false); // If cardId is falsy, set loading to false
    }
  }, [cardId]);

  return { qrCard, isLoading, isError };
}

export const updateQrCardCredits = async (qr: string, totalCredits: number) => {
  try {
    // Fetch the QR card from the database using the provided QR code
    const { data: qrCardToUpdate, error } = await supabase
      .from<QrCard>('qr_card')
      .select('*')
      .eq('card_no', qr)
      .single();

    if (error) {
      throw new Error('Error fetching QR card data');
    }

    if (qrCardToUpdate) {
      // Calculate the updated credits by subtracting totalCredits
      const updatedCredits = qrCardToUpdate.credits - totalCredits;
      // Update the QR card with the new credits
      await supabase
        .from('qr_card')
        .update({ credits: updatedCredits })
        .eq('card_no', qr);
    } else {
      console.error('No matching card found for the QR code');
    }
  } catch (error) {
    console.error('Error updating QR card credits:', error);
  }
};
