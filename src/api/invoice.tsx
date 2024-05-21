import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface InvoiceData {
  id: number;
  card_id: number;
  invoice_no: string;
  date_time: Date;
  ready_by: Date;
  status: string;
  old_credits: number;
  new_credits: number;
  total_credits: number;
}

export function useInsertInvoice() {
  const [isInserting, setIsInserting] = useState(false);
  const [isError, setIsError] = useState(false);

  const insertInvoice = async (invoiceData: InvoiceData) => {
    try {
      setIsInserting(true);

      const currentDate = new Date();

      const { data, error } = await supabase.from('invoice').insert([
        { 
          card_id: invoiceData.card_id,
          invoice_no: invoiceData.invoice_no,
          date_time: new Date(),
          ready_by: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          status: invoiceData.status,
          old_credits: invoiceData.old_credits,
          new_credits: invoiceData.new_credits
        },
      ]);

      if (error) {
        throw new Error('Error inserting data into invoice table');
      }

      setIsInserting(false);
      return { data, error };
    } catch (error) {
      setIsError(true);
      setIsInserting(false);
      return { data: null, error };
    }
  };

  return { insertInvoice, isInserting, isError };
}

export function useLastInsertedInvoiceId() {
  const [lastInsertedInvoiceId, setLastInsertedInvoiceId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchLastInsertedInvoiceId = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoice')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error('Error fetching last inserted invoice ID');
      }

      const lastId = data?.[0]?.id || 0;
      setLastInsertedInvoiceId(lastId);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLastInsertedInvoiceId();
  }, []);

  return { lastInsertedInvoiceId, isLoading, isError };
}

export function useAllInvoices() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchAllInvoices = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.from('invoice').select('*');

      if (error) {
        throw new Error('Error fetching invoices');
      }

      const formattedData = data.map((item: InvoiceData) => ({
        ...item,
        date_time: new Date(item.date_time),
        ready_by: new Date(item.ready_by),
      }));

      setInvoices(formattedData || []);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  return { invoices, isLoading, isError, fetchAllInvoices };
}

export function useUpdateInvoiceStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isError, setIsError] = useState(false);

  const updateInvoiceStatus = async (invoiceId: number) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('invoice')
        .update({ status: 'Returned' })
        .eq('id', invoiceId);

      if (error) {
        throw new Error('Error updating invoice status');
      }

      setIsUpdating(false);
    } catch (error) {
      setIsError(true);
      setIsUpdating(false);
    }
  };

  return { updateInvoiceStatus, isUpdating, isError };
}

export function useInvoiceDetails(invoiceId: number) {
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from('invoice')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (error) {
          throw new Error('Error fetching invoice details');
        }

        if (data) {
          setInvoiceDetails({
            id: data.id,
            card_id: data.card_id,
            invoice_no: data.invoice_no,
            date_time: new Date(data.date_time),
            ready_by: new Date(data.ready_by),
            status: data.status,
            old_credits: data.old_credits,
            new_credits: data.new_credits,
            total_credits: data.total_credits,
          });
        } else {
          throw new Error('Invoice not found');
        }

        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  return { invoiceDetails, isLoading, isError };
}
