import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const LoginPage = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Sahi 10-digit mobile number daale (6-9 se shuru hona chahiye)');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/send-otp', { mobile });
      navigate('/otp', { state: { mobile } });
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch gadbad hui. Phir try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🥬</div>
        <h1 style={styles.appName}>VeggieMandi</h1>
        <p style={styles.tagline}>Apni sabzi becho, sahi daam paao</p>
      </div>

      <div className="card" style={styles.card}>
        <h2 style={styles.title}>Login / Register</h2>
        <p style={styles.subtitle}>Apna mobile number daale</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="mobile">Mobile Number</label>
            <div style={styles.phoneInput}>
              <span style={styles.countryCode}>+91</span>
              <input
                id="mobile"
                type="tel"
                className="input-field"
                style={{ borderRadius: '0 var(--radius) var(--radius) 0', borderLeft: 'none' }}
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || mobile.length !== 10}>
            {loading ? 'Bhej rahe hain...' : 'OTP Mangaiye →'}
          </button>
        </form>

        <p style={styles.note}>
          📞 Phone nahi chal raha? Humare number pe call karein aur seedha post karein.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, var(--green-pale) 0%, var(--bg) 100%)',
    padding: '40px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: '4rem',
    marginBottom: 8,
  },
  appName: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--green-dark)',
  },
  tagline: {
    color: 'var(--text-secondary)',
    marginTop: 4,
    fontSize: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginBottom: 20,
    fontSize: '0.95rem',
  },
  phoneInput: {
    display: 'flex',
    alignItems: 'stretch',
  },
  countryCode: {
    padding: '0 12px',
    background: 'var(--green-pale)',
    border: '2px solid var(--border)',
    borderRight: 'none',
    borderRadius: 'var(--radius) 0 0 var(--radius)',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    color: 'var(--green-dark)',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
  },
  note: {
    marginTop: 20,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1.6,
  },
};

export default LoginPage;
