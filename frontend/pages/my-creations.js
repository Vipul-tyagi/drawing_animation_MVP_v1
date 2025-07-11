import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Image, BookOpen, Download, Eye, Trash2 } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';

export default function MyCreationsPage() {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCreations = async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/my-creations`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setCreations(data.creations);
        } else {
          setError(data.error || 'Failed to fetch creations.');
        }
      } catch (err) {
        console.error('Error fetching creations:', err);
        setError('An unexpected error occurred: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreations();
  }, []);

  const handleViewCreation = (creationId) => {
    // For now, we'll just log the ID. Later, we can navigate to a detailed view.
    console.log('View creation:', creationId);
    // You might navigate to a dynamic route like /creations/[creationId]
    // router.push(`/creations/${creationId}`);
  };

  const handleDownloadCreation = (url, filename) => {
    // This will download the enhanced image. You might want to offer PDF download too.
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'enhanced_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your creations..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <Head>
        <title>My Creations - Drawing to Animation</title>
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">My Creations</h1>

        {creations.length === 0 ? (
          <div className="text-center text-gray-400 text-xl mt-10">
            <p>You haven't created any masterpieces yet!</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Create Your First Drawing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map((creation) => (
              <div key={creation.creationId} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                  {creation.enhancedImageUrl ? (
                    <img src={creation.enhancedImageUrl} alt="Enhanced Creation" className="w-full h-full object-cover" />
                  ) : creation.originalImageUrl ? (
                    <img src={creation.originalImageUrl} alt="Original Creation" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-semibold text-white mb-2">Creation ID: {creation.creationId.substring(0, 8)}...</h2>
                  <p className="text-gray-400 text-sm mb-1">Prompt: {creation.userPromptText.substring(0, 50)}...</p>
                  <p className="text-gray-400 text-sm mb-3">Created: {new Date(creation.timestamp).toLocaleDateString()}</p>
                  {creation.bedtimeStoryText && (
                    <div className="text-gray-300 text-sm mb-4 max-h-20 overflow-hidden">
                      <p className="font-semibold">Story Snippet:</p>
                      <p>{creation.bedtimeStoryText.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-around">
                  <button
                    onClick={() => handleViewCreation(creation.creationId)}
                    className="flex items-center text-blue-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Eye size={18} className="mr-1" /> View
                  </button>
                  {creation.enhancedImageUrl && (
                    <button
                      onClick={() => handleDownloadCreation(creation.enhancedImageUrl, `enhanced_${creation.creationId.substring(0, 8)}.png`)}
                      className="flex items-center text-green-400 hover:text-green-600 transition-colors duration-200"
                    >
                      <Download size={18} className="mr-1" /> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
