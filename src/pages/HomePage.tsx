import { useState } from 'react'
import { addAction } from '../datadog/rum'

interface ActionLog {
  name: string
  context: Record<string, unknown>
  timestamp: string
}

interface TraceLog {
  url: string
  status: number | string
  traceId: string | null
  timestamp: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export default function HomePage() {
  const [log, setLog] = useState<ActionLog[]>([])
  const [traceLog, setTraceLog] = useState<TraceLog[]>([])

  async function fetchWithTrace(path: string) {
    const url = `${API_URL}${path}`
    // O RUM SDK intercepta este fetch e injeta automaticamente:
    //   x-datadog-trace-id, x-datadog-parent-id, x-datadog-sampling-priority
    //   traceparent (W3C) — conforme propagatorTypes configurados
    try {
      const res = await fetch(url)
      // O trace-id injetado pelo RUM está disponível via context interno;
      // exibimos o header de resposta se o backend o devolver.
      const traceId = res.headers.get('x-datadog-trace-id') ?? '(injetado na req — veja Network tab)'
      setTraceLog((prev) => [
        { url, status: res.status, traceId, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ])
    } catch {
      setTraceLog((prev) => [
        { url, status: 'network error', traceId: null, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ])
    }
  }

  function track(name: string, context: Record<string, unknown>) {
    addAction(name, context)
    setLog((prev) => [
      { name, context, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ])
  }

  return (
    <div className="page">
      <h1>Custom Actions</h1>
      <p className="page-desc">
        Each button below calls <code>datadogRum.addAction()</code> with a custom name and context.
      </p>

      <div className="apm-banner">
        <strong>RUM ↔ APM:</strong> requisições para <code>{API_URL}</code> recebem os cabeçalhos{' '}
        <code>x-datadog-trace-id</code>, <code>x-datadog-parent-id</code> e{' '}
        <code>traceparent</code> automaticamente. O backend instrumentado com{' '}
        <code>dd-trace</code> usa esses cabeçalhos para vincular o span APM à sessão RUM.
      </div>

      <div className="card-grid">
        <div className="demo-card">
          <h2>E-commerce</h2>
          <div className="btn-group">
            <button
              onClick={() => track('add_to_cart', { product_id: 'SKU-42', product_name: 'Datadog Plushie', price: 29.99 })}
            >
              Add to Cart
            </button>
            <button
              onClick={() => track('checkout_started', { cart_value: 89.97, items: 3 })}
            >
              Start Checkout
            </button>
            <button
              onClick={() => track('purchase_completed', { order_id: 'ORD-9001', total: 89.97 })}
            >
              Complete Purchase
            </button>
          </div>
        </div>

        <div className="demo-card">
          <h2>Search</h2>
          <div className="btn-group">
            <button
              onClick={() => track('search_performed', { query: 'rum monitoring', results: 42 })}
            >
              Perform Search
            </button>
            <button
              onClick={() => track('filter_applied', { filter: 'category', value: 'observability' })}
            >
              Apply Filter
            </button>
            <button
              onClick={() => track('result_clicked', { position: 1, result_id: 'doc-123' })}
            >
              Click Result
            </button>
          </div>
        </div>

        <div className="demo-card demo-card--apm">
          <h2>RUM ↔ APM</h2>
          <p className="card-desc">
            Cada fetch abaixo é interceptado pelo SDK. Abra o <em>Network tab</em> e
            inspecione os cabeçalhos da requisição.
          </p>
          <div className="btn-group">
            <button onClick={() => fetchWithTrace('/api/products')}>
              GET /api/products
            </button>
            <button onClick={() => fetchWithTrace('/api/orders')}>
              GET /api/orders
            </button>
            <button onClick={() => fetchWithTrace('/api/users/me')}>
              GET /api/users/me
            </button>
          </div>
        </div>

        <div className="demo-card">
          <h2>Engagement</h2>
          <div className="btn-group">
            <button
              onClick={() => track('video_played', { video_id: 'intro-rum', duration_s: 120 })}
            >
              Play Video
            </button>
            <button
              onClick={() => track('share_clicked', { content: 'article', channel: 'twitter' })}
            >
              Share Content
            </button>
            <button
              onClick={() => track('feedback_submitted', { rating: 5, comment: 'Great product!' })}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>

      {traceLog.length > 0 && (
        <div className="event-log">
          <h3>Traced requests (RUM ↔ APM)</h3>
          <ul>
            {traceLog.map((entry, i) => (
              <li key={i} className="log-entry">
                <span className="log-time">{entry.timestamp}</span>
                <span className={`log-badge ${entry.status === 200 ? 'log-badge--ok' : ''}`}>
                  {entry.status}
                </span>
                <span className="log-name">{entry.url}</span>
                <code className="log-ctx">{entry.traceId}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {log.length > 0 && (
        <div className="event-log">
          <h3>Dispatched actions</h3>
          <ul>
            {log.map((entry, i) => (
              <li key={i} className="log-entry">
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-name">{entry.name}</span>
                <code className="log-ctx">{JSON.stringify(entry.context)}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
