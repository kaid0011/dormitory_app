
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Import Supabase client

export interface TransactionData {
  item_id: number;
  invoice_id: number;
  serial_no: number;
}

export function useInsertTransaction() {
  const [isInserting, setIsInserting] = useState(false);
  const [isError, setIsError] = useState(false);

  const insertTransaction = async (transactionData: TransactionData[]) => {
    try {
      setIsInserting(true);
      const { error } = await supabase.from('transaction').insert(transactionData);

      if (error) {
        throw new Error('Error inserting data into transaction table');
      }

      setIsInserting(false);
      return { error }; // Return the error
    } catch (error) {
      setIsError(true);
      setIsInserting(false);
      return { error }; // Return the error
    }
  };

  return { insertTransaction, isInserting, isError };
}

export function useTransactionByInvoiceId(invoiceId: string) {
  const [data, setData] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchTransactionByInvoiceId() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from<TransactionData>('transaction').select('*').eq('invoice_id', invoiceId);
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

    fetchTransactionByInvoiceId();
  }, [invoiceId]);

  return { data, isLoading, isError };
}