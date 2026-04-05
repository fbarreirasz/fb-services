'use client';

import { useTheme } from '@/app/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      title={isDark ? 'Mudar para Light' : 'Mudar para Dark'}
      style={{
        position: 'relative',
        width: 52,
        height: 28,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        background: isDark
          ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
          : 'linear-gradient(135deg, #fde68a, #fbbf24)',
        boxShadow: isDark
          ? '0 0 10px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 0 10px rgba(251,191,36,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: isDark ? 'calc(100% - 25px)' : 3,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}>
        {isDark ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#312e81" stroke="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2"  x2="12" y2="4"  />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="2"  y1="12" x2="4"  y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
            <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
          </svg>
        )}
      </span>
    </button>
  );
}
