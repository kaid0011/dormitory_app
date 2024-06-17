import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import Supabase client

interface Coupon {
  id: number;
  coupon_no: string;
  balance: number;
  client_id: number;
  coupon_series: number;
}

export function useCouponList() {
  const [data, setData] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchCouponList() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from<Coupon>('coupons').select('*');
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

    fetchCouponList();
  }, []);

  return { data, isLoading, isError };
}

export function useCouponById(couponId: number) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchCouponById() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from<Coupon>('coupons')
          .select('*')
          .eq('id', couponId)
          .single();

        if (error) {
          throw new Error('Error fetching data');
        }

        setCoupon(data || null);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (couponId) { // Add a check to ensure couponId is truthy before fetching data
      fetchCouponById();
    } else {
      setIsLoading(false); // If couponId is falsy, set loading to false
    }
  }, [couponId]);

  return { coupon, isLoading, isError };
}

export const updateCouponBalance = async (qr: string, totalCredits: number) => {
  try {
    // Fetch the coupon from the database using the provided coupon series
    const { data: couponToUpdate, error } = await supabase
      .from<Coupon>('coupons')
      .select('*')
      .eq('coupon_no', qr)
      .single();

    if (error) {
      throw new Error('Error fetching coupon data');
    }

    if (couponToUpdate) {
      // Calculate the updated balance by subtracting totalCredits
      const updatedBalance = couponToUpdate.balance - totalCredits;
      // Update the coupon with the new balance
      await supabase
        .from('coupons')
        .update({ balance: updatedBalance })
        .eq('coupon_no', qr);
    } else {
      console.error('No matching coupon found for the series');
    }
  } catch (error) {
    console.error('Error updating coupon balance:', error);
  }
};
