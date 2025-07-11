import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CombinedOutputDisplay({
  creation,
  resetApp,
}) {
  const { originalImageUrl, enhancedImageUrl, bedtimeStoryText } = creation || {};
  const contentRef = useRef(null);

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // Enable cross-origin images
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('your_masterpiece.pdf');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto text-gray-800">
      <div ref={contentRef} className="p-4">
        <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Your Masterpiece!</h2>

        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Original Drawing</h3>
            {originalImageUrl && (
              <img
                src={originalImageUrl}
                alt="Original Drawing"
                className="max-w-full h-auto rounded-lg mx-auto shadow-lg border border-gray-200"
              />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Enhanced Drawing</h3>
            {enhancedImageUrl ? (
              <img
                src={enhancedImageUrl}
                alt="Enhanced Drawing"
                className="max-w-full h-auto rounded-lg mx-auto shadow-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                No Enhanced Image Available
              </div>
            )}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Bedtime Story:</h3>
          {bedtimeStoryText && (
            <div className="bg-gray-100 p-6 rounded-lg shadow-inner max-h-96 overflow-y-auto border border-gray-200">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{bedtimeStoryText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={resetApp}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Over
        </button>
        <button
          onClick={handleDownloadPdf}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Download My Masterpiece (PDF)
        </button>
        <button
          onClick={() => console.log('Psychological Assessment button clicked')}
          className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Unlock Deeper Insights: Get a Comprehensive Psychological Assessment
        </button>
      </div>
    </div>
  );
}