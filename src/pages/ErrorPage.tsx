import { useState } from 'react'
import { addError } from '../datadog/rum'

interface ErrorLog {
  type: string
  message: string
  timestamp: string
}

export default function ErrorPage() {
  const [log, setLog] = useState<ErrorLog[]>([])

  function logEntry(type: string, message: string) {
    setLog((prev) => [{ type, message, timestamp: new Date().toLocaleTimeString() }, ...prev])
  }

  function handleManualError() {
    const err = new Error('Payment gateway timeout after 30s')
    addError(err, { service: 'payment', attempt: 3, order_id: 'ORD-9001' })
    logEntry('manual', err.message)
  }

  function handleStringError() {
    addError('User session expired unexpectedly', { user_id: 'user-123', page: '/checkout' })
    logEntry('string', 'User session expired unexpectedly')
  }

  function handleNetworkError() {
    const err = new Error('Failed to fetch: POST /api/orders 503')
    addError(err, { endpoint: '/api/orders', status: 503, retried: true })
    logEntry('network', err.message)
  }

  function throwUnhandled() {
    // This will be caught by the ErrorBoundary and also reported to RUM
    throw new Error('Unhandled render error — caught by ErrorBoundary')
  }

  return (
    <div className="page">
      <h1>Custom Errors</h1>
      <p className="page-desc">
        The first three buttons call <code>datadogRum.addError()</code> directly. The last one
        throws an unhandled error that is caught and reported by the <code>ErrorBoundary</code>.
      </p>

      <div className="card-grid">
        <div className="demo-card">
          <h2>Handled Errors</h2>
          <div className="btn-group">
            <button className="btn-error" onClick={handleManualError}>
              Payment Timeout
            </button>
            <button className="btn-error" onClick={handleStringError}>
              Session Expired
            </button>
            <button className="btn-error" onClick={handleNetworkError}>
              Network Error 503
            </button>
          </div>
        </div>

        <div className="demo-card">
          <h2>Unhandled Error</h2>
          <p className="card-desc">
            Throws inside a React component — the <code>ErrorBoundary</code> catches it via{' '}
            <code>componentDidCatch</code> and reports to RUM.
          </p>
          <div className="btn-group">
            <button className="btn-error btn-danger" onClick={throwUnhandled}>
              Throw Unhandled Error
            </button>
          </div>
        </div>
      </div>

      {log.length > 0 && (
        <div className="event-log">
          <h3>Reported errors</h3>
          <ul>
            {log.map((entry, i) => (
              <li key={i} className="log-entry log-entry--error">
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-badge">{entry.type}</span>
                <span className="log-name">{entry.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
