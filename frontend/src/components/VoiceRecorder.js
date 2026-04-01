import React, { useState } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';

const VoiceRecorder = ({ onTranscriptReady }) => {
  const [lang, setLang] = useState('hi-IN');
  const { isRecording, transcript, error, supported, startRecording, stopRecording } = useVoiceRecorder(lang);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
      if (transcript) onTranscriptReady(transcript);
    } else {
      startRecording();
    }
  };

  const handleUseTranscript = () => {
    if (transcript) onTranscriptReady(transcript);
  };

  if (!supported) {
    return (
      <div style={styles.unsupported}>
        <p>🚫 Aapke browser mein voice feature nahi hai.</p>
        <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Android Chrome mein try karein ya neeche text likhe.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.langToggle}>
        <button
          style={{ ...styles.langBtn, ...(lang === 'hi-IN' ? styles.langBtnActive : {}) }}
          onClick={() => setLang('hi-IN')}
          type="button"
        >
          हिंदी
        </button>
        <button
          style={{ ...styles.langBtn, ...(lang === 'en-IN' ? styles.langBtnActive : {}) }}
          onClick={() => setLang('en-IN')}
          type="button"
        >
          English
        </button>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        style={{
          ...styles.micBtn,
          background: isRecording ? 'var(--red)' : 'var(--green-main)',
          animation: isRecording ? 'pulse 1s infinite' : 'none',
        }}
        aria-label={isRecording ? 'Recording band karein' : 'Recording shuru karein'}
      >
        {isRecording ? '⏹ Rokein' : '🎙️ Bolo'}
      </button>

      {isRecording && (
        <div style={styles.recordingIndicator}>
          <span style={styles.dot} /> Recording chal rahi hai...
        </div>
      )}

      {transcript ? (
        <div style={styles.transcriptBox}>
          <p style={styles.transcriptLabel}>Aapne kaha:</p>
          <p style={styles.transcript}>{transcript}</p>
          <button type="button" onClick={handleUseTranscript} className="btn-secondary" style={{ marginTop: 8 }}>
            Ise Istemal Karein ✓
          </button>
        </div>
      ) : null}

      {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198,40,40,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(198,40,40,0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
    gap: 12,
  },
  langToggle: {
    display: 'flex',
    gap: 8,
  },
  langBtn: {
    padding: '6px 16px',
    border: '2px solid var(--border)',
    borderRadius: 20,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'var(--white)',
    cursor: 'pointer',
    minHeight: 40,
  },
  langBtnActive: {
    borderColor: 'var(--green-main)',
    color: 'var(--green-main)',
    background: 'var(--green-pale)',
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transition: 'background 0.2s',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--red)',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  dot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    background: 'var(--red)',
    borderRadius: '50%',
    animation: 'pulse 1s infinite',
  },
  transcriptBox: {
    width: '100%',
    background: 'var(--green-pale)',
    border: '1.5px solid var(--green-light)',
    borderRadius: 'var(--radius)',
    padding: 12,
  },
  transcriptLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: 4,
    fontWeight: 600,
  },
  transcript: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    lineHeight: 1.6,
  },
  unsupported: {
    background: 'var(--orange-light)',
    border: '1px solid var(--orange)',
    borderRadius: 'var(--radius)',
    padding: 12,
    color: 'var(--orange)',
    textAlign: 'center',
  },
};

export default VoiceRecorder;
