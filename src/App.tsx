import { useState } from 'react'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import ErrorPage from './pages/ErrorPage'
import UserPage from './pages/UserPage'
import './App.css'

type Page = 'home' | 'errors' | 'user'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <ErrorBoundary>
      <div className="app">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main-content">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'errors' && <ErrorPage />}
          {currentPage === 'user' && <UserPage />}
        </main>
      </div>
    </ErrorBoundary>
  )
}
