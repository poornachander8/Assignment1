import React from 'react';

const AlertItem = ({ alert, onDelete, onToggle }) => {
  const { _id, produce, isActive, notifyBySms, notifyByCall } = alert;

  return (
    <div className="card" style={{ ...styles.card, opacity: isActive ? 1 : 0.6 }}>
      <div style={styles.row}>
        <div style={styles.left}>
          <span style={styles.produce}>🌿 {produce}</span>
          <div style={styles.channels}>
            {notifyBySms && <span style={styles.chip}>📱 SMS</span>}
            {notifyByCall && <span style={styles.chip}>📞 Call</span>}
          </div>
        </div>
        <div style={styles.actions}>
          <button
            onClick={() => onToggle(_id, !isActive)}
            style={{ ...styles.toggleBtn, color: isActive ? 'var(--green-main)' : 'var(--text-muted)' }}
          >
            {isActive ? '✓ Active' : '⏸ Paused'}
          </button>
          <button onClick={() => onDelete(_id)} style={styles.deleteBtn}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { marginBottom: 8 },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  left: { flex: 1 },
  produce: {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  channels: {
    display: 'flex',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    fontSize: '0.72rem',
    background: 'var(--green-pale)',
    color: 'var(--green-dark)',
    borderRadius: 10,
    padding: '2px 8px',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  toggleBtn: {
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '1.5px solid currentColor',
    borderRadius: 8,
    padding: '6px 10px',
    background: 'none',
    cursor: 'pointer',
    minHeight: 36,
  },
  deleteBtn: {
    fontSize: '1.1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    minHeight: 36,
  },
};

export default AlertItem;
