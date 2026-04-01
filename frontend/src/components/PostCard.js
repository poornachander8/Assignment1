import React from 'react';
import ProduceTags from './ProduceTags';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Abhi abhi';
  if (mins < 60) return `${mins} minute pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ghante pehle`;
  return `${Math.floor(hrs / 24)} din pehle`;
};

const PostCard = ({ post, currentUserId, onDelete }) => {
  const { author, rawMessage, produceTags, isVoicePost, source, createdAt, _id } = post;
  const isOwn = author?._id === currentUserId;

  return (
    <div className="card" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          {(author?.name || '?')[0].toUpperCase()}
        </div>
        <div style={styles.meta}>
          <div style={styles.authorName}>{author?.name || 'Kisan'}</div>
          {author?.village && <div style={styles.village}>📍 {author.village}</div>}
        </div>
        <div style={styles.right}>
          <div style={styles.time}>{timeAgo(createdAt)}</div>
          {source === 'ivr' && <div style={styles.ivrBadge}>📞 Call se</div>}
          {isVoicePost && source !== 'ivr' && <div style={styles.voiceBadge}>🎙️ Voice</div>}
        </div>
      </div>

      <p style={styles.message}>{rawMessage}</p>

      <ProduceTags tags={produceTags} />

      {isOwn && onDelete && (
        <button
          onClick={() => onDelete(_id)}
          style={styles.deleteBtn}
          aria-label="Delete post"
        >
          🗑️ Delete
        </button>
      )}
    </div>
  );
};

const styles = {
  card: {
    marginBottom: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'var(--green-pale)',
    color: 'var(--green-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.1rem',
    flexShrink: 0,
    border: '2px solid var(--green-light)',
  },
  meta: { flex: 1 },
  authorName: { fontWeight: 700, fontSize: '1rem' },
  village: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 },
  right: { textAlign: 'right', flexShrink: 0 },
  time: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  ivrBadge: {
    fontSize: '0.65rem',
    background: 'var(--orange-light)',
    color: 'var(--orange)',
    borderRadius: 6,
    padding: '2px 5px',
    marginTop: 3,
    fontWeight: 600,
  },
  voiceBadge: {
    fontSize: '0.65rem',
    background: 'var(--green-pale)',
    color: 'var(--green-main)',
    borderRadius: 6,
    padding: '2px 5px',
    marginTop: 3,
    fontWeight: 600,
  },
  message: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  deleteBtn: {
    marginTop: 10,
    fontSize: '0.8rem',
    color: 'var(--red)',
    background: 'none',
    border: '1px solid var(--red)',
    borderRadius: 8,
    padding: '4px 10px',
    cursor: 'pointer',
    minHeight: 'auto',
  },
};

export default PostCard;
