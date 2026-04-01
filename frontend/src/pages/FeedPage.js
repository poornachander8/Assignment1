import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const { data } = await axiosInstance.get(`/posts?page=${pageNum}&limit=20`);
      if (replace) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError('Posts load nahi ho saki. Phir try karein.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Yeh post delete karein?')) return;
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      setError('Delete nahi ho saka.');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchPosts(page + 1, false);
  };

  const handleRefresh = () => fetchPosts(1, true);

  return (
    <div className="page">
      <div style={styles.titleRow}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>🏪 Sabzi Mandi</h1>
        <button onClick={handleRefresh} style={styles.refreshBtn} disabled={loading} aria-label="Refresh">
          🔄
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>Koi post nahi hai abhi</p>
          <p style={{ fontSize: '0.9rem', marginTop: 8 }}>Neeche + button se apni sabzi post karein!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?._id}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="btn-secondary"
              disabled={loadingMore}
              style={{ marginTop: 8 }}
            >
              {loadingMore ? 'Load ho raha hai...' : 'Aur Posts Dekhe'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refreshBtn: {
    fontSize: '1.3rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    minHeight: 'auto',
  },
};

export default FeedPage;
