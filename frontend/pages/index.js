import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Upload, BookOpen, LogOut } from 'lucide-react'; // Import LogOut icon

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
  const router = useRouter(); // Initialize useRouter

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
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
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
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="hero-container fade-in-up">
            <div className="hero-title">Drawing to Animation Studio</div>
            <div className="hero-subtitle">Transform your static drawings into captivating animations in just a few clicks.</div>
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
            <button
              onClick={() => router.push('/my-creations')}
              className="absolute top-4 right-28 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
            >
              <BookOpen size={18} />
              <span>My Creations</span>
            </button>
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
