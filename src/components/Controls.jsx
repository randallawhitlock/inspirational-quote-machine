import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ArrowRight, Share2 } from 'lucide-react';

const Controls = ({ onNextQuote, onShare, disabled = false }) => {
  return (
    <motion.div 
      className="controls flex justify-center gap-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="share-btn p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg
                   hover:shadow-xl transition-shadow duration-200"
        onClick={onShare}
      >
        <Share2 className="w-6 h-6 text-gray-700" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`next-quote-btn px-6 py-3 rounded-full shadow-lg hover:shadow-xl
                   transition-all duration-200 flex items-center gap-2 text-lg font-medium
                   ${disabled 
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                     : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                   }`}
        onClick={onNextQuote}
        disabled={disabled}
      >
        <span>Next Quote</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

Controls.propTypes = {
    onNextQuote: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default Controls;