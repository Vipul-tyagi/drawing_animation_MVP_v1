import { useState, useEffect } from 'react';

const messages = [
  "Analyzing your masterpiece...",
  "Applying AI enhancements...",
  "Crafting a unique story...",
  "Bringing your drawing to life with words!",
  "Generating a magical bedtime tale..."
];

export default function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
      <p className="text-xl font-semibold text-gray-300 text-center transition-opacity duration-1000 ease-in-out">
        {messages[messageIndex]}
      </p>
    </div>
  );
}