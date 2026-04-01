import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import AlertItem from '../components/AlertItem';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produce, setProduce] = useState('');
  const [notifyBySms, setNotifyBySms] = useState(true);
  const [notifyByCall, setNotifyByCall] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAlerts = async () => {
    try {
      const { data } = await axiosInstance.get('/alerts');
      setAlerts(data.alerts);
    } catch {
      setError('Alerts load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!produce.trim()) { setError('Sabzi ka naam daale'); return; }
    setError(''); setSuccess('');
    setAdding(true);
    try {
      const { data } = await axiosInstance.post('/alerts', { produce: produce.trim(), notifyBySms, notifyByCall });
      setAlerts((prev) => [data.alert, ...prev]);
      setProduce('');
      setSuccess(`"${data.alert.produce}" ka alert lag gaya!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Alert nahi lag saka.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError('Delete nahi ho saka.');
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const { data } = await axiosInstance.patch(`/alerts/${id}`, { isActive });
      setAlerts((prev) => prev.map((a) => (a._id === id ? data.alert : a)));
    } catch {
      setError('Update nahi ho saka.');
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">🔔 Mere Alerts</h1>
      <p style={styles.desc}>Jab koi aapki pasand ki sabzi post kare, aapko SMS aur call aaegi!</p>

      {/* Add alert form */}
      <div className="card">
        <h2 style={styles.formTitle}>Naya Alert Lagaiye</h2>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">✓ {success}</div>}

        <form onSubmit={handleAdd}>
          <div className="input-group">
            <label className="input-label" htmlFor="produce">Sabzi / Fruit ka naam</label>
            <input
              id="produce"
              type="text"
              className="input-field"
              placeholder="jaise: tamatar, aloo, aam"
              value={produce}
              onChange={(e) => setProduce(e.target.value.toLowerCase())}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={notifyBySms}
                onChange={(e) => setNotifyBySms(e.target.checked)}
                style={styles.checkbox}
              />
              📱 SMS se bataiye
            </label>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={notifyByCall}
                onChange={(e) => setNotifyByCall(e.target.checked)}
                style={styles.checkbox}
              />
              📞 Phone call se bataiye
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? 'Lag raha hai...' : '+ Alert Lagaiye'}
          </button>
        </form>
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="spinner" />
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <p>Koi alert nahi hai abhi</p>
          <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Upar se apni pasand ki sabzi ka alert lagaiye</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <AlertItem
            key={alert._id}
            alert={alert}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))
      )}
    </div>
  );
};

const styles = {
  desc: {
    color: 'var(--text-secondary)',
    marginBottom: 16,
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 14,
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  checkbox: {
    width: 22,
    height: 22,
    accentColor: 'var(--green-main)',
    cursor: 'pointer',
  },
};

export default AlertsPage;
