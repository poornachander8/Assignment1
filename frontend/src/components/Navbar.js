import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const navItems = [
    { to: '/feed', label: 'फ़ीड', icon: '🏪' },
    { to: '/alerts', label: 'अलर्ट', icon: '🔔' },
    { to: '/notifications', label: 'सूचना', icon: '📩', badge: unreadCount },
  ];

  return (
    <>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              color: isActive ? 'var(--green-main)' : 'var(--text-muted)',
            })}
          >
            <span style={styles.iconWrap}>
              <span style={styles.icon}>{item.icon}</span>
              {item.badge > 0 && <span style={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>}
            </span>
            <span style={styles.label}>{item.label}</span>
          </NavLink>
        ))}

        {/* Center post button */}
        <button style={styles.postBtn} onClick={() => navigate('/post/new')} aria-label="Nayi post">
          <span style={{ fontSize: '1.6rem' }}>+</span>
          <span style={styles.label}>पोस्ट</span>
        </button>
      </nav>
    </>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    height: 'var(--navbar-height)',
    background: 'var(--white)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '4px 0',
    fontSize: '0.7rem',
    fontWeight: 600,
    textDecoration: 'none',
  },
  iconWrap: {
    position: 'relative',
    display: 'inline-block',
  },
  icon: {
    fontSize: '1.4rem',
    display: 'block',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    background: 'var(--red)',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 700,
    borderRadius: 10,
    padding: '1px 4px',
    minWidth: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: '0.7rem',
    marginTop: 2,
  },
  postBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    background: 'var(--green-main)',
    color: 'var(--white)',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(46,125,50,0.4)',
    fontWeight: 700,
    marginBottom: 8,
    fontSize: '0.7rem',
  },
};

export default Navbar;
