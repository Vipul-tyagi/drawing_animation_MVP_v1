import { useState } from 'react';
import Head from 'next/head';
import { Upload, BookOpen } from 'lucide-react';

import UploadForm from '../components/UploadForm';
import CombinedOutputDisplay from '../components/CombinedOutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const Step = ({ icon, title, number, isActive, isCompleted }) => (
  <div className="flex items-center">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
        isActive ? 'bg-indigo-600' : isCompleted ? 'bg-green-500' : 'bg-gray-700'
      }`}
    >
      {icon}
    </div>
    <div className="ml-4">
      <div className="text-sm font-medium text-gray-400">Step {number}</div>
      <div className="text-lg font-semibold text-white">{title}</div>
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

  const handleUploadAndDescribeComplete = async (imageData) => {
    console.log('Index: handleUploadAndDescribeComplete called with:', imageData);
    setUploadedImage(imageData);
    setUploadedFileData(imageData);
    console.log('Index: uploadedFileData after setting:', imageData);
    setLoading(true);
    setError(null);

    try {
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
        // Trigger automatic enhancement after story generation
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
    }
  };

  const resetApp = () => {
    setCurrentPhase('input');
    setUploadedImage(null);
    setUploadedFileData(null);
    setStoryResult(null);
    setEnhancedImage(null);
    setError(null);
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
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="hero-container fade-in-up">
            <div className="hero-title">Drawing to Animation Studio</div>
            <div className="hero-subtitle">Transform your static drawings into captivating animations in just a few clicks.</div>
          </div>

          <main className="max-w-4xl mx-auto">
            <div className="wizard-progress fade-in-up">
              <div className="progress-steps">
                <Step icon={<Upload size={24} />} title="Upload & Describe" number={1} isActive={currentPhase === 'input'} isCompleted={currentPhase === 'output'} />
                <Step icon={<BookOpen size={24} />} title="Your Creation" number={2} isActive={currentPhase === 'output'} isCompleted={false} />
              </div>
              <div className="progress-labels">
                <div className={`progress-label ${currentPhase === 'input' ? 'active' : ''}`}>Upload & Describe</div>
                <div className={`progress-label ${currentPhase === 'output' ? 'active' : ''}`}>Your Creation</div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <strong className="font-bold">Oops! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {loading ? (
                <LoadingSpinner message={currentPhase === 'input' ? "Crafting your story and enhancing your drawing..." : "Generating PDF..."} />
              ) : (
                renderPhaseContent()
              )}
            </div>
          </main>

          <footer className="text-center mt-12 text-gray-500">
            <p>&copy; {new Date().getFullYear()} Drawing to Animation. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
