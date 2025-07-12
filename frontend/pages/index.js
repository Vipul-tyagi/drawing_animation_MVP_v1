
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import UploadForm from '../components/UploadForm';
import CombinedOutputDisplay from '../components/CombinedOutputDisplay';
import WalletTopUp from '../components/WalletTopUp';

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState('input');
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({ totalCreations: 0, userName: '' });
  const [userBalance, setUserBalance] = useState(null);
  const router = useRouter();

  const fetchUserBalance = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/balance`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserBalance(data.balance);
      } else {
        console.error('Failed to fetch user balance:', data.error);
      }
    } catch (err) {
      console.error('Error fetching user balance:', err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            router.push('/login');
            return;
        };

        const creationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/my-creations`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const creationsData = await creationsResponse.json();
        if (creationsData.success) {
          setUserStats({
            totalCreations: creationsData.creations.length,
            userName: 'Artist'
          });
        }

        await fetchUserBalance();

      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
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
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const creationData = await creationResponse.json();

        if (creationData.success) {
          const fetchedCreation = creationData.creation;
          setUploadedFileData(fetchedCreation);

          const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/story`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              imageId: fetchedCreation.creationId,
              drawingDescription: fetchedCreation.userPromptText,
              s3Key: fetchedCreation.s3Key,
            }),
          });

          const storyData = await storyResponse.json();

          if (storyData.success) {
            const enhancementPayload = {
              imageId: fetchedCreation.creationId,
              enhancementType: 'stylize',
              prompt: storyData.story,
            };
            const enhancementResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enhance`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify(enhancementPayload),
            });
            const enhancementData = await enhancementResponse.json();

            if (enhancementData.success) {
              const finalCreationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${fetchedCreation.creationId}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
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
    setUploadedFileData(null);
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
            creation={uploadedFileData}
            resetApp={resetApp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Head>
        <title>Drawing to Animation Studio</title>
      </Head>

      <header style={{ marginBottom: '1rem' }}>
        <h1>Drawing to Animation Studio</h1>
        <p>Welcome back, {userStats.userName}! You've created {userStats.totalCreations} magical {userStats.totalCreations === 1 ? 'story' : 'stories'}!</p>
        {userBalance !== null && <p>Balance: ${userBalance.toFixed(2)}</p>}
        <button onClick={() => router.push('/my-creations')} style={{ marginRight: '1rem' }}>My Creations</button>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {userBalance !== null && userBalance < 5 && (
        <div style={{ border: '1px solid yellow', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Low Balance Alert!</h3>
          <p>Your current balance is ${userBalance.toFixed(2)}. Top up your wallet to continue creating!</p>
          <WalletTopUp currentBalance={userBalance} onTopUpSuccess={fetchUserBalance} />
        </div>
      )}

      <main>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : (
          renderPhaseContent()
        )}
      </main>

      <footer style={{ marginTop: '1rem' }}>
        <p>&copy; {new Date().getFullYear()} Drawing Studio. Made with ❤️ for families!</p>
      </footer>
    </div>
  );
}
