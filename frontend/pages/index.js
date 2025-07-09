import { useState } from 'react';
import Head from 'next/head';
import { Upload, BookOpen } from 'lucide-react';

import UploadForm from '../components/UploadForm';
import CombinedOutputDisplay from '../components/CombinedOutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const Step = ({ icon, title, number, isActive, isCompleted }) => (
  <div className="flex items-center transition-all duration-300">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-neutral-200 font-bold text-lg font-sans ${
        isActive ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-neutral-700'
      }`}
    >
      {isCompleted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : icon}
    </div>
    <div className="ml-3">
      <div className="text-xs font-medium text-neutral-400 font-sans">Step {number}</div>
      <div className="text-base font-semibold text-neutral-200 font-sans">{title}</div>
    </div>
  </div>
);

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState('input');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [storyResult, setStoryResult] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(''); // New state for dynamic loading messages

  const handleUploadAndDescribeComplete = async (imageData) => {
    console.log('Index: handleUploadAndDescribeComplete called with:', imageData);
    setUploadedImage(imageData);
    setUploadedFileData(imageData);
    console.log('Index: uploadedFileData after setting:', imageData);
    setLoading(true);
    setError(null);

    try {
      setProcessingMessage('Generating your bedtime story...'); // Specific message
      const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: imageData.id,
          drawingDescription: imageData.story,
        }),
      });

      const storyData = await storyResponse.json();

      if (storyData.success) {
        setStoryResult(storyData.story);
        
        setProcessingMessage('Enhancing your drawing...'); // Specific message
        const enhancementPayload = {
          imageId: imageData.id,
          enhancementType: 'stylize',
          prompt: storyData.story, // Use the generated story as the prompt
        };
        const enhancementResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enhance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enhancementPayload),
        });
        const enhancementData = await enhancementResponse.json();

        if (enhancementData.success) {
          setEnhancedImage(enhancementData);
          setCurrentPhase('output');
        } else {
          setError(enhancementData.error || 'Failed to enhance image.');
        }
      } else {
        setError(storyData.error || 'Failed to generate story.');
      }
    } catch (err) {
      console.error('Error during story or enhancement generation:', err);
      setError('An error occurred during processing: ' + err.message);
    } finally {
      setLoading(false);
      setProcessingMessage(''); // Clear message
    }
  };

  const resetApp = () => {
    setCurrentPhase('input');
    setUploadedImage(null);
    setUploadedFileData(null);
    setStoryResult(null);
    setEnhancedImage(null);
    setError(null);
    setProcessingMessage('');
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <UploadForm
            onUploadComplete={handleUploadAndDescribeComplete}
            setLoading={setLoading}
            setError={setError}
            uploadedFileData={uploadedFileData}
            setUploadedFileData={setUploadedFileData}
          />
        );
      case 'output':
        return (
          <CombinedOutputDisplay
            originalImage={uploadedImage}
            enhancedImage={enhancedImage}
            storyResult={storyResult}
            resetApp={resetApp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Drawing to Animation Studio</title>
        <meta name="description" content="Bring your drawings to life with AI-powered animation." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="hero-container fade-in-up bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 rounded-lg text-center mb-8 shadow-xl">
            <h1 className="hero-title text-3xl sm:text-4xl font-bold mb-2 text-white font-sans">Drawing to Animation Studio</h1>
            <p className="hero-subtitle text-base sm:text-lg font-light mb-4 text-white/90 font-sans">Transform your static drawings into captivating animations in just a few clicks.</p>
          </div>

          <main className="max-w-4xl mx-auto">
            <div className="wizard-progress fade-in-up bg-neutral-50 p-4 sm:p-6 rounded-lg shadow-md mb-8 border border-neutral-200">
              <div className="progress-steps flex justify-around sm:justify-between items-center mb-4 relative">
                <div className="absolute left-0 right-0 h-0.5 bg-neutral-300 top-1/2 -translate-y-1/2 z-0"></div>
                <Step icon={<Upload size={24} />} title="Upload & Describe" number={1} isActive={currentPhase === 'input'} isCompleted={currentPhase === 'output'} />
                <Step icon={<BookOpen size={24} />} title="Your Creation" number={2} isActive={currentPhase === 'output'} isCompleted={false} />
              </div>
              <div className="progress-labels flex justify-around sm:justify-between mt-2">
                <div className={`progress-label text-center text-sm font-medium font-sans ${currentPhase === 'input' ? 'text-primary font-semibold' : 'text-neutral-600'}`}>Upload & Describe</div>
                <div className={`progress-label text-center text-sm font-medium font-sans ${currentPhase === 'output' ? 'text-primary font-semibold' : 'text-neutral-600'}`}>Your Creation</div>
              </div>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg relative mb-6 font-sans" role="alert">
                  <strong className="font-bold">Oops! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {loading ? (
                <LoadingSpinner message={processingMessage} />
              ) : (
                renderPhaseContent()
              )}
            </div>
          </main>

          <footer className="text-center mt-8 sm:mt-12 text-neutral-500 font-sans">
            <p>&copy; {new Date().getFullYear()} Drawing to Animation. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
