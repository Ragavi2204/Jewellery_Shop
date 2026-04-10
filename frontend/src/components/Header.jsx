import React from 'react'

const Header = ({ username, onLogout, toggleTheme, theme, toggleSidebar }) => (
  <header className="app-header">
    <div className="flex" style={{ gap: 0 }}>
      <button className="mobile-menu-btn" onClick={toggleSidebar}>☰</button>
      <span className="header-title">TAS Jewellers</span>
      <span className="header-subtitle">நகை வணிக முறைமை</span>
    </div>

    <div className="header-actions">
      <button className="btn btn-theme" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="user-chip">
        <div className="user-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
        <span>{username}</span>
      </div>

      <button className="btn btn-danger-ghost" onClick={onLogout}>
        வெளியேறு
      </button>
    </div>
  </header>
)

export default Header
