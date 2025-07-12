
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegisterMode ? 'register' : 'login';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          setError(null);
          setIsRegisterMode(false);
          alert('Registration successful! Please log in.');
        } else {
          localStorage.setItem('authToken', data.token);
          window.location.href = '/';
        }
      } else {
        setError(data.error || `${isRegisterMode ? 'Registration' : 'Login'} failed.`);
      }
    } catch (err) {
      console.error(`${isRegisterMode ? 'Registration' : 'Login'} error:`, err);
      setError(`An unexpected error occurred during ${isRegisterMode ? 'registration' : 'login'}.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Head>
        <title>{isRegisterMode ? 'Register' : 'Login'} - Drawing to Animation</title>
      </Head>

      <h1>{isRegisterMode ? 'Register' : 'Login'}</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ display: 'block', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ display: 'block', width: '100%' }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isRegisterMode ? 'Register' : 'Login'}
        </button>
      </form>

      <button onClick={toggleMode} disabled={loading} style={{ marginTop: '1rem' }}>
        {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
}
