import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ProfileSetupPage = () => {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Apna naam daale');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.put('/auth/profile', { name: name.trim(), village: village.trim() });
      updateUser(data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch gadbad hui.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>👤</div>
        <h1 style={styles.title}>Apni Jaankari Bhare</h1>
        <p style={styles.subtitle}>Yeh ek baar hi karna hoga</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Aapka Naam *</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="jaise: Ramu Yadav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="village">Gaon / Shehar (Optional)</label>
            <input
              id="village"
              type="text"
              className="input-field"
              placeholder="jaise: Rampur, UP"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Save ho raha hai...' : 'Shuru Karein →'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, var(--green-pale) 0%, var(--bg) 100%)',
    padding: '40px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { fontSize: '3rem', marginBottom: 8 },
  title: { fontSize: '1.4rem', fontWeight: 700, color: 'var(--green-dark)' },
  subtitle: { color: 'var(--text-secondary)', marginTop: 4 },
};

export default ProfileSetupPage;
