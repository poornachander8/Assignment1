import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import VoiceRecorder from '../components/VoiceRecorder';
import ProduceTags from '../components/ProduceTags';

const CreatePostPage = () => {
  const [mode, setMode] = useState('text'); // 'text' or 'voice'
  const [message, setMessage] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [preview, setPreview] = useState(null); // { post } after submit for tag preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleVoiceReady = (transcript) => {
    setVoiceTranscript(transcript);
    setMessage(transcript);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Kuch to likhe ya bole!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/posts', {
        rawMessage: message.trim(),
        voiceTranscript: mode === 'voice' ? voiceTranscript : '',
        isVoicePost: mode === 'voice',
      });
      setPreview(data.post);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Post nahi ho saki. Phir try karein.');
    } finally {
      setLoading(false);
    }
  };

  if (success && preview) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h2 style={{ color: 'var(--green-dark)', marginTop: 8 }}>Post Ho Gayi!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>"{preview.rawMessage}"</p>

          {preview.produceTags?.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mili hui sabziyan:</p>
              <ProduceTags tags={preview.produceTags} />
              <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Jo log in sabziyon ka alert lagaaye hain, unhe notification bhej diya gaya hai!
              </p>
            </div>
          ) : (
            <p style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Koi match nahi mila. Sabzi ka naam sahi se likhe (jaise: tamatar, aloo, pyaz)
            </p>
          )}

          <button
            onClick={() => navigate('/feed')}
            className="btn-primary"
            style={{ marginTop: 20 }}
          >
            Feed Dekhe →
          </button>
          <button
            onClick={() => { setSuccess(false); setPreview(null); setMessage(''); setVoiceTranscript(''); }}
            className="btn-secondary"
            style={{ marginTop: 10 }}
          >
            Ek Aur Post Karein
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">📝 Nayi Post</h1>

      {/* Mode toggle */}
      <div style={styles.modeToggle}>
        <button
          type="button"
          style={{ ...styles.modeBtn, ...(mode === 'text' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('text')}
        >
          ✏️ Text Likhe
        </button>
        <button
          type="button"
          style={{ ...styles.modeBtn, ...(mode === 'voice' ? styles.modeBtnActive : {}) }}
          onClick={() => setMode('voice')}
        >
          🎙️ Bolke Post Karein
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {mode === 'voice' ? (
            <>
              <VoiceRecorder onTranscriptReady={handleVoiceReady} />
              {message ? (
                <div style={{ marginTop: 12 }}>
                  <label className="input-label">Transcript Edit Karein (optional):</label>
                  <textarea
                    className="input-field"
                    style={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Aapka message yahan aayega..."
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className="input-group">
              <label className="input-label" htmlFor="message">Apni Sabzi Batayein</label>
              <textarea
                id="message"
                className="input-field"
                style={styles.textarea}
                placeholder="jaise: Mere paas aaj 10 kilo tamatar aur 5 kilo pyaz hai, sasta price mein"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                autoFocus
              />
              <div style={styles.charCount}>{message.length}/500</div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !message.trim()}
            style={{ marginTop: 16 }}
          >
            {loading ? 'Post ho rahi hai...' : 'Post Karein 🚀'}
          </button>
        </form>
      </div>

      <div className="card" style={{ background: 'var(--orange-light)', border: '1px solid #ffe0b2' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--orange)', fontWeight: 600 }}>💡 Tips</p>
        <ul style={styles.tips}>
          <li>Sabzi ka naam clearly bolein ya likhe: tamatar, aloo, pyaz...</li>
          <li>Quantity bhi bataiye: 5 kilo, 2 dozen, 1 quintal</li>
          <li>Gaon ka naam bhi dene se buyers aasani se milte hain</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  modeToggle: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    padding: '12px 8px',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'var(--white)',
    cursor: 'pointer',
    minHeight: 52,
    textAlign: 'center',
  },
  modeBtnActive: {
    borderColor: 'var(--green-main)',
    color: 'var(--green-main)',
    background: 'var(--green-pale)',
  },
  textarea: {
    minHeight: 100,
    resize: 'vertical',
    borderRadius: 'var(--radius)',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 4,
  },
  tips: {
    marginTop: 8,
    paddingLeft: 20,
    fontSize: '0.85rem',
    color: 'var(--orange)',
    lineHeight: 1.8,
  },
};

export default CreatePostPage;
