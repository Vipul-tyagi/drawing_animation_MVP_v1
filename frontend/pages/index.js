import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Upload, BookOpen, LogOut } from 'lucide-react'; // Import LogOut icon

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
  const router = useRouter(); // Initialize useRouter
  const [processingMessage, setProcessingMessage] = useState(''); // New state for dynamic loading messages

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the token
    router.push('/login'); // Redirect to login page
  };

  const handleGenerateClick = async (file, story) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('story', story);

    try {
      const authToken = localStorage.getItem('authToken');
      setProcessingMessage('Uploading your drawing...'); // Specific message
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setProcessingMessage('Generating your bedtime story...'); // Specific message
        const creationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${uploadData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const creationData = await creationResponse.json();

        if (creationData.success) {
          const fetchedCreation = creationData.creation;
          setUploadedImage({ id: fetchedCreation.creationId, url: fetchedCreation.originalImageUrl });
          setUploadedFileData(fetchedCreation);

          const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/story`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
              imageId: fetchedCreation.creationId,
              drawingDescription: fetchedCreation.userPromptText,
              s3Key: fetchedCreation.s3Key,
            }),
          });

          const storyData = await storyResponse.json();

          if (storyData.success) {
            setStoryResult(storyData.story);

            setProcessingMessage('Enhancing your drawing...'); // Specific message
            const enhancementPayload = {
              imageId: fetchedCreation.creationId,
              enhancementType: 'stylize',
              prompt: storyData.story,
            };
            const enhancementResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enhance`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify(enhancementPayload),
            });
            const enhancementData = await enhancementResponse.json();

            if (enhancementData.success) {
              const finalCreationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${fetchedCreation.creationId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
              });
              const finalCreationData = await finalCreationResponse.json();

              if (finalCreationData.success) {
                setUploadedFileData(finalCreationData.creation);
                setCurrentPhase('output');
              } else {
                setError(finalCreationData.error || 'Failed to re-fetch final creation details.');
              }
            } else {
              setError(enhancementData.error || 'Failed to enhance image.');
            }
          } else {
            setError(storyData.error || 'Failed to generate story.');
          }
        } else {
          setError(creationData.error || 'Failed to fetch creation details.');
        }
      } else {
        setError(uploadData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error during processing:', err);
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
            onGenerateClick={handleGenerateClick}
            setError={setError}
          />
        );
      case 'output':
        return (
          <CombinedOutputDisplay
            creation={uploadedFileData} // Pass the full creation object
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
          <header className="flex justify-between items-center py-4 px-6 bg-neutral-800 rounded-lg shadow-md mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary font-sans">Drawing to Animation</h1>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/my-creations')}
                className="flex items-center text-neutral-200 hover:text-primary transition-colors duration-200 font-medium"
              >
                <BookOpen size={20} className="mr-1" />
                My Creations
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-neutral-200 hover:text-red-500 transition-colors duration-200 font-medium"
              >
                <LogOut size={20} className="mr-1" />
                Logout
              </button>
            </nav>
          </header>

          <div className="hero-container fade-in-up bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 rounded-lg text-center mb-8 shadow-xl">
            <h1 className="hero-title text-3xl sm:text-4xl font-bold mb-2 text-white font-sans">Bring Your Drawings to Life!</h1>
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
