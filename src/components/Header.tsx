import { useState } from 'react'
import { setUser, clearUser } from '../datadog/rum'

type Page = 'home' | 'errors' | 'user'

interface HeaderProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false)

  function handleLogin() {
    const user = { id: 'user-123', name: 'Jane Doe', email: 'jane@example.com' }
    setUser(user)
    setLoggedIn(true)
  }

  function handleLogout() {
    clearUser()
    setLoggedIn(false)
  }

  return (
    <header className="header">
      <div className="header-brand">
        <span className="dd-logo">🐶</span>
        <span className="header-title">Datadog RUM Demo</span>
      </div>
      <nav className="header-nav">
        <button
          className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Custom Actions
        </button>
        <button
          className={`nav-btn ${currentPage === 'errors' ? 'active' : ''}`}
          onClick={() => onNavigate('errors')}
        >
          Custom Errors
        </button>
        <button
          className={`nav-btn ${currentPage === 'user' ? 'active' : ''}`}
          onClick={() => onNavigate('user')}
        >
          User ID
        </button>
      </nav>
      <div className="header-auth">
        {loggedIn ? (
          <div className="auth-info">
            <span className="auth-badge">Jane Doe</span>
            <button className="auth-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="auth-btn login" onClick={handleLogin}>
            Login demo
          </button>
        )}
      </div>
    </header>
  )
}
