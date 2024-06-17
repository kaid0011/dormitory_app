import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface InvoiceData {
  id: number;
  coupon_id: number;
  invoice_no: string;
  date_time: Date;
  ready_by: Date;
  status: string;
  old_balance: number;
  new_balance: number;
  total_credits: number;
  coupon_no?: string; // Add coupon_no to the InvoiceData interface
}

export function useInsertInvoice() {
  const [isInserting, setIsInserting] = useState(false);
  const [isError, setIsError] = useState(false);

  const insertInvoice = useCallback(async (invoiceData: InvoiceData) => {
    try {
      setIsInserting(true);

      const currentDate = new Date();
      const readyBy = new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase.from('invoices').insert([{
        coupon_id: invoiceData.coupon_id,
        invoice_no: invoiceData.invoice_no,
        date_time: currentDate,
        ready_by: readyBy,
        status: invoiceData.status,
        old_balance: invoiceData.old_balance,
        new_balance: invoiceData.new_balance,
        total_credits: invoiceData.total_credits,
      }]);

      if (error) {
        throw error;
      }

      setIsInserting(false);
      return { data, error: null };
    } catch (error) {
      setIsError(true);
      setIsInserting(false);
      return { data: null, error };
    }
  }, []);

  return { insertInvoice, isInserting, isError };
}

export function useLastInsertedInvoiceId() {
  const [lastInsertedInvoiceId, setLastInsertedInvoiceId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchLastInsertedInvoiceId = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('invoices')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      setLastInsertedInvoiceId(data?.[0]?.id || 0);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLastInsertedInvoiceId();
  }, [fetchLastInsertedInvoiceId]);

  return { lastInsertedInvoiceId, isLoading, isError };
}

export function useAllInvoices() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchAllInvoices = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, invoice_no, date_time, status, coupon_id');

      if (invoiceError) {
        throw invoiceError;
      }

      // Fetch coupon numbers
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('id, coupon_no');

      if (couponError) {
        throw couponError;
      }

      // Merge data based on coupon_id
      const formattedData = invoiceData.map((invoice: any) => ({
        ...invoice,
        date_time: new Date(invoice.date_time),
        coupon_no: couponData.find((coupon: any) => coupon.id === invoice.coupon_id)?.coupon_no,
      }));

      setInvoices(formattedData || []);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllInvoices();
  }, [fetchAllInvoices]);

  return { invoices, isLoading, isError, fetchAllInvoices };
}

export function useUpdateInvoiceStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isError, setIsError] = useState(false);

  const updateInvoiceStatus = useCallback(async (invoiceId: number) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Returned' })
        .eq('id', invoiceId);

      if (error) {
        throw error;
      }

      setIsUpdating(false);
    } catch (error) {
      setIsError(true);
      setIsUpdating(false);
    }
  }, []);

  return { updateInvoiceStatus, isUpdating, isError };
}

export function useInvoiceDetails(invoiceId: number) {
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) {
        throw error;
      }

      setInvoiceDetails({
        id: data.id,
        coupon_id: data.coupon_id,
        invoice_no: data.invoice_no,
        date_time: new Date(data.date_time),
        ready_by: new Date(data.ready_by),
        status: data.status,
        old_balance: data.old_balance,
        new_balance: data.new_balance,
        total_credits: data.total_credits,
      });

      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  return { invoiceDetails, isLoading, isError };
}
