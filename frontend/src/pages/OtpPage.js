import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const OtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile;

  useEffect(() => {
    if (!mobile) navigate('/login');
    else inputRefs.current[0]?.focus();
  }, [mobile, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('6-digit OTP daale');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/verify-otp', { mobile, otp: otpString });
      login(data.token, data.user);
      // If name not set yet, go to profile setup
      if (!data.user.name) navigate('/profile-setup');
      else navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Galat OTP. Phir try karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axiosInstance.post('/auth/send-otp', { mobile });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Dobara bhejne mein dikkat hui.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🔐</div>
        <h1 style={styles.title}>OTP Verify Karein</h1>
        <p style={styles.subtitle}>
          <strong>+91 {mobile}</strong> pe 6-digit OTP bheja gaya hai
        </p>
        <p style={styles.devNote}>
          💻 Development mein OTP server console mein dekhe
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.otpRow} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={styles.otpInput}
              inputMode="numeric"
            />
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={loading || otp.join('').length !== 6}>
          {loading ? 'Verify ho raha hai...' : 'Verify Karein ✓'}
        </button>
      </form>

      <button onClick={handleResend} disabled={resending} style={styles.resendBtn}>
        {resending ? 'Bhej rahe hain...' : 'OTP Dobara Bheje'}
      </button>

      <button onClick={() => navigate('/login')} style={styles.backBtn}>
        ← Mobile Number Badlein
      </button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, var(--green-pale) 0%, var(--bg) 100%)',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: { fontSize: '3rem', marginBottom: 8 },
  title: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-dark)' },
  subtitle: { color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 },
  devNote: {
    marginTop: 8,
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    background: 'var(--orange-light)',
    padding: '6px 12px',
    borderRadius: 8,
    display: 'inline-block',
  },
  otpRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 360,
  },
  otpInput: {
    width: 48,
    height: 56,
    fontSize: '1.4rem',
    fontWeight: 700,
    textAlign: 'center',
    border: '2px solid var(--border)',
    borderRadius: 10,
    outline: 'none',
    color: 'var(--green-dark)',
  },
  resendBtn: {
    marginTop: 16,
    color: 'var(--green-main)',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    minHeight: 48,
  },
  backBtn: {
    marginTop: 8,
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    minHeight: 48,
  },
};

export default OtpPage;
