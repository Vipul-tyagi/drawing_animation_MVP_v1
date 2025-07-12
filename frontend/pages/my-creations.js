// pages/my-creations.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, Eye, Calendar, FileText } from 'lucide-react';
import WalletTopUp from '../components/WalletTopUp';

const CreationCard = ({ creation, onView, onDownload }) => {
  const handleView = () => {
    onView(creation.creationId);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(
      creation.enhancedImageUrl || creation.originalImageUrl,
      `creation_${creation.creationId.substring(0, 8)}.png`
    );
  };

  return (
    <div style={{ border: '1px solid gray', padding: '1rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={handleView}>
      <div>
        {creation.enhancedImageUrl || creation.originalImageUrl ? (
          <img
            src={creation.enhancedImageUrl || creation.originalImageUrl}
            alt="Creation"
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '200px', background: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            No Image
          </div>
        )}
      </div>

      <h3>Creation #{creation.creationId.substring(0, 8)}</h3>
      <p>{creation.userPromptText || 'No prompt provided.'}</p>
      <p>Date: {new Date(creation.timestamp).toLocaleDateString()}</p>

      {creation.bedtimeStoryText && (
        <div>
          <p>📖 Story Preview:</p>
          <p>{creation.bedtimeStoryText.substring(0, 120)}...</p>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleView}>👀 View</button>
        {creation.enhancedImageUrl || creation.originalImageUrl ? (
          <button onClick={handleDownload} style={{ marginLeft: '1rem' }}>💾 Save</button>
        ) : null}
      </div>
    </div>
  );
};

export default function MyCreationsPage() {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
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
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
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
          setCreations(data.creations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } else {
          setError(data.error || 'Failed to fetch creations.');
        }

        await fetchUserBalance();

        const { payment } = router.query;
        if (payment === 'success') {
          alert('Wallet topped up successfully!');
          router.replace('/my-creations', undefined, { shallow: true });
        } else if (payment === 'cancelled') {
          alert('Wallet top-up was cancelled.');
          router.replace('/my-creations', undefined, { shallow: true });
        }

      } catch (err) {
        setError('An unexpected error occurred: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewCreation = (id) => {
    console.log('View creation:', id);
  };

  const handleDownloadCreation = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCreations = creations.filter((c) => {
    if (filter === 'enhanced') return c.enhancedImageUrl;
    if (filter === 'stories') return c.bedtimeStoryText;
    return true;
  });

  const stats = {
    total: creations.length,
    enhanced: creations.filter(c => c.enhancedImageUrl).length,
    stories: creations.filter(c => c.bedtimeStoryText).length,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Head>
        <title>My Creations</title>
      </Head>

      <button onClick={() => router.push('/')}>← Back</button>
      <h1>My Creations</h1>
      <p>Total: {stats.total} | Enhanced: {stats.enhanced} | Stories: {stats.stories}</p>

      <WalletTopUp currentBalance={userBalance} onTopUpSuccess={fetchUserBalance} />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('enhanced')} style={{ marginLeft: '1rem' }}>Enhanced</button>
        <button onClick={() => setFilter('stories')} style={{ marginLeft: '1rem' }}>Stories</button>
      </div>

      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

      {filteredCreations.length === 0 ? (
        <div style={{ marginTop: '2rem' }}>No creations found.</div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {filteredCreations.map(creation => (
            <CreationCard
              key={creation.creationId}
              creation={creation}
              onView={handleViewCreation}
              onDownload={handleDownloadCreation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
