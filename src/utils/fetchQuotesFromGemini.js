import { GoogleGenerativeAI } from "@google/generative-ai";

export const fetchWithExponentialBackoff = async (
  url,
  options = {},
  maxRetries = 5,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const backoffDelay = delay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
};

export const fetchQuotesFromGemini = async (category, maxRetries = 3) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Generate 30 inspirational quotes about "${category}". 
  Only include quotes that have known authors (no anonymous or unknown authors). 
  Format as JSON array of objects with 'author' and 'quote' properties.
  Each quote must have a real, named author attribution.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean up the response to ensure valid JSON
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      // Validate the response structure
        if (!Array.isArray(JSON.parse(cleanedResponse))) {
          throw new Error('Response is not an array');
        }
        
        const isValidQuote = (quote) => 
          quote && 
          typeof quote.author === 'string' && 
          typeof quote.quote === 'string' && 
          quote.author.trim() !== '' && 
          quote.quote.trim() !== '';
        
        if (!JSON.parse(cleanedResponse).every(isValidQuote)) {
          throw new Error('Invalid quote format in response');
        }

        return JSON.parse(cleanedResponse);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch quotes after ${maxRetries} attempts: ${lastError.message}`);
      }
      // Exponential backoff before retrying
      const backoffDelay = 1000 * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

// Helper function to simulate a delay (useful for testing)
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Example usage:
// try {
//   const quotes = await fetchQuotesFromGemini('success');
//   console.log('Fetched quotes:', quotes);
// } catch (error) {
//   console.error('Error fetching quotes:', error);
// }