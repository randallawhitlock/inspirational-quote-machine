import { useState, useCallback } from 'react';
import { db } from '../utils/db';
import { fetchQuotesFromGemini } from '../utils/fetchQuotesFromGemini';

const useQuotes = (category) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const BATCH_SIZE = 5;
  const FETCH_THRESHOLD = 10; // When fewer than this many quotes remain, fetch more

    const getNextBatch = useCallback(async () => {
    const startIndex = (currentBatchIndex + 1) * BATCH_SIZE;

    // If we're running low on quotes, fetch more
    if (quotes.length - startIndex <= FETCH_THRESHOLD) {
      try {
        const newQuotes = await fetchQuotesFromGemini(category);
        // Filter out quotes without authors and clean up author names
        const validQuotes = newQuotes.filter(quote => 
          quote.author && 
          quote.author.trim() !== '' && 
          quote.author.toLowerCase() !== 'anonymous' &&
          quote.author.toLowerCase() !== 'unknown'
        ).map(quote => ({
          ...quote,
          author: quote.author.trim(),
          quote: quote.quote.trim()
        }));
        
        setQuotes(prevQuotes => [...prevQuotes, ...validQuotes]);
      } catch (error) {
        console.error('Error fetching additional quotes:', error);
      }
    }

    // If we've reached the end of current quotes, start over
    if (startIndex >= quotes.length) {
        setCurrentBatchIndex(0);
        return quotes.slice(0, BATCH_SIZE);
    }

        setCurrentBatchIndex(currentBatchIndex + 1);
        return quotes.slice(startIndex, startIndex + BATCH_SIZE);
  }, [quotes, currentBatchIndex, category]);

  const getCurrentBatch = useCallback(() => {
    const startIndex = currentBatchIndex * BATCH_SIZE;
      return quotes.slice(startIndex, startIndex + BATCH_SIZE);
  }, [quotes, currentBatchIndex]);

    const fetchQuotes = useCallback(async () => {
    if (!category || category.trim() === '') {
      setQuotes([]);
      setCurrentBatchIndex(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentBatchIndex(0);

      const data = await fetchQuotesFromGemini(category);
      
      // Filter out quotes without authors and clean up author names
      const validQuotes = data.filter(quote => 
        quote.author && 
        quote.author.trim() !== '' && 
        quote.author.toLowerCase() !== 'anonymous' &&
        quote.author.toLowerCase() !== 'unknown'
      ).map(quote => ({
        ...quote,
        author: quote.author.trim(),
        quote: quote.quote.trim()
      }));

      setQuotes(validQuotes);

      // Save to IndexedDB
      try {
        await db.quotes.clear();
        if (validQuotes.length > 0) {
          await db.quotes.bulkAdd(validQuotes.map(quote => ({
            ...quote,
            category
          })));
        }
      } catch (dbError) {
        console.error('Error saving to IndexedDB:', dbError);
      }

    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch quotes'));

      try {
        const localQuotes = await db.quotes
          .where('category')
          .equals(category)
          .toArray();

        if (localQuotes.length > 0) {
          setQuotes(localQuotes);
          setError(null);
        } else {
          setQuotes([]);
        }
      } catch (dbError) {
        console.error('Error fetching quotes from IndexedDB:', dbError);
        setQuotes([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category]);

  const hasMoreQuotes = () => {
        return (currentBatchIndex + 1) * BATCH_SIZE < quotes.length;
  };

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    getNextBatch,
    getCurrentBatch,
    hasMoreQuotes: hasMoreQuotes(),
  };
};

export default useQuotes;