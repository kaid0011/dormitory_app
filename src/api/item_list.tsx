import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import Supabase client

interface Item {
  id: number;
  item: string;
  credits: number;
  // Add more properties as needed
}

export function useItemList() {
  const [data, setData] = useState<Item[]>([]); // Annotate state with Item[] type
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchItemList() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from<Item>('item_list').select('*'); // Use Item type for the from() method
        if (error) {
          throw new Error('Error fetching data');
        }
        setData(data || []); // Provide a default value in case data is null
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItemList();
  }, []);

  return { data, isLoading, isError };
}

export function useItemById(itemId: number) {
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchItemById() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from<Item>('item_list')
          .select('*')
          .eq('id', itemId)
          .single();

        if (error) {
          throw new Error('Error fetching item');
        }

        setItem(data || null);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItemById();
  }, [itemId]);

  return { item, isLoading, isError };
}
