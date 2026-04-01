import React from 'react';

const PRODUCE_COLORS = {
  tomato: '#e53935', tamatar: '#e53935',
  onion: '#8e24aa', pyaz: '#8e24aa',
  potato: '#f57f17', aloo: '#f57f17',
  mango: '#f9a825', aam: '#f9a825',
  spinach: '#2e7d32', palak: '#2e7d32',
  default: '#1565c0',
};

const ProduceTags = ({ tags = [], size = 'normal' }) => {
  if (!tags || tags.length === 0) return null;

  const isSmall = size === 'small';

  return (
    <div style={styles.wrap}>
      {tags.map((tag) => {
        const color = PRODUCE_COLORS[tag] || PRODUCE_COLORS.default;
        return (
          <span
            key={tag}
            style={{
              ...styles.tag,
              background: `${color}18`,
              color,
              border: `1.5px solid ${color}40`,
              fontSize: isSmall ? '0.72rem' : '0.85rem',
              padding: isSmall ? '2px 8px' : '4px 10px',
            }}
          >
            🌿 {tag}
          </span>
        );
      })}
    </div>
  );
};

const styles = {
  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    borderRadius: 20,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
};

export default ProduceTags;
