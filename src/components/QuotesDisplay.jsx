import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useQuotes from '../hooks/useQuotes';
import Controls from './Controls';

const QuotesDisplay = () => {
  const [category, setCategory] = useState('manifestation');
  const [inputCategory, setInputCategory] = useState('');
  const { loading, error, refetch, getCurrentBatch, getNextBatch, hasMoreQuotes, quotes } = useQuotes(category);
  const [displayedQuotes, setDisplayedQuotes] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (category) {
      refetch();
    }
  }, [category, refetch]);

  useEffect(() => {
    const current = getCurrentBatch();
    setDisplayedQuotes(current);
     if(current.length > 0) {
        setCurrentQuoteIndex(0);
      }
  }, [getCurrentBatch, quotes, category]);

    const handleShare = () => {
        if (navigator.share && displayedQuotes && displayedQuotes[currentQuoteIndex]) {
            navigator.share({
                title: 'Check out this quote!',
                text: `${displayedQuotes[currentQuoteIndex].quote} — ${displayedQuotes[currentQuoteIndex].author}`,
                url: window.location.href,
            }).catch(err => {
                console.log('Error sharing:', err);
            });
        } else {
            console.log('Web Share API not supported');
        }
    };

    const handleNextQuote = async () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        if (hasMoreQuotes) {
            const nextBatch = await getNextBatch();
           setDisplayedQuotes(nextBatch);
            if(nextBatch.length > 0) {
              setCurrentQuoteIndex(0);
             }
        } else {
             setCurrentQuoteIndex(prevIndex => (prevIndex + 1) % displayedQuotes.length);
        }
        setIsTransitioning(false);
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedCategory = inputCategory.trim().toLowerCase();
    if (formattedCategory) {
      setCategory(formattedCategory);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const quoteVariants = {
    hidden: { opacity: 0, x: 50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={inputCategory}
          onChange={(e) => setInputCategory(e.target.value)}
          placeholder="Enter quote topic (e.g., courage, love, success)"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Get Quotes
        </button>
      </form>

     {loading && (
        <div className="flex items-center justify-center p-8">
           <div className="text-lg text-gray-200 font-medium">
             Finding inspiration...
           </div>
        </div>
     )}

     {error && (
       <div className="text-red-500 text-center p-4">
         {error.message}
         <button
           onClick={refetch}
           className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
         >
           Retry
         </button>
       </div>
     )}

      <AnimatePresence mode="wait">
        {!loading && displayedQuotes.length > 0 && (
          <motion.div
            key={displayedQuotes[0]?.quote || 'quotes-container'}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4 flex flex-wrap justify-center"
          >
            {displayedQuotes.map((quote, index) => (
              <motion.div
                key={`${quote.quote}-${index}`}
                variants={quoteVariants}
                className="quote-card m-4"
                 style={{ flex: '1 1 300px' }}
              >
                <blockquote className="text-xl md:text-2xl font-serif leading-relaxed text-gray-800 mb-4">
                  {`"${quote.quote}"`}
                </blockquote>
                <cite className="block text-right text-lg md:text-xl text-gray-600 font-medium">
                  — {quote.author}
                </cite>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && displayedQuotes.length > 0 && (
        <Controls
          onNextQuote={handleNextQuote}
          onShare={handleShare}
          disabled={isTransitioning || (!hasMoreQuotes && displayedQuotes.length === 0)}
        />
      )}
    </div>
  );
};

export default QuotesDisplay;