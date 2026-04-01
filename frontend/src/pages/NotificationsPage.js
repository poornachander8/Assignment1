import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import ProduceTags from '../components/ProduceTags';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Abhi abhi';
  if (mins < 60) return `${mins} min pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ghante pehle`;
  return `${Math.floor(hrs / 24)} din pehle`;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resetUnreadCount, latestNotification } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications?limit=50');
      setNotifications(data.notifications);
      // Mark all as read
      await axiosInstance.patch('/notifications/mark-read', {});
      resetUnreadCount();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []); // eslint-disable-line

  // Prepend new real-time notification
  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => [
        {
          _id: latestNotification.notificationId,
          message: latestNotification.message,
          matchedProduce: latestNotification.matchedProduce,
          post: latestNotification.post,
          isRead: true,
          createdAt: latestNotification.createdAt,
        },
        ...prev,
      ]);
    }
  }, [latestNotification]);

  return (
    <div className="page">
      <h1 className="page-title">📩 Meri Suchnaein</h1>

      {loading ? (
        <div className="spinner" />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>Koi notification nahi hai</p>
          <p style={{ fontSize: '0.9rem', marginTop: 8 }}>
            Jab koi aapke alert ki sabzi post karega, yahan dikhega
          </p>
          <button onClick={() => navigate('/alerts')} className="btn-primary" style={{ marginTop: 16 }}>
            Alert Lagaiye →
          </button>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className="card"
            style={{
              ...styles.card,
              borderLeft: n.isRead ? '4px solid var(--border)' : '4px solid var(--green-main)',
            }}
          >
            <p style={styles.message}>{n.message}</p>
            <ProduceTags tags={n.matchedProduce || []} size="small" />
            <p style={styles.time}>{timeAgo(n.createdAt)}</p>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  card: {
    marginBottom: 8,
    borderRadius: 'var(--radius)',
  },
  message: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  time: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 6,
  },
};

export default NotificationsPage;
