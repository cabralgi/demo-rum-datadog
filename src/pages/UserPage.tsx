import { useState } from 'react'
import { setUser, clearUser, type RumUser } from '../datadog/rum'

export default function UserPage() {
  const [form, setForm] = useState<RumUser>({ id: '', name: '', email: '' })
  const [activeUser, setActiveUser] = useState<RumUser | null>(null)

  function handleSet(e: React.FormEvent) {
    e.preventDefault()
    setUser(form)
    setActiveUser(form)
  }

  function handleClear() {
    clearUser()
    setActiveUser(null)
    setForm({ id: '', name: '', email: '' })
  }

  const presets: RumUser[] = [
    { id: 'usr-001', name: 'Alice Silva', email: 'alice@acme.com' },
    { id: 'usr-002', name: 'Bob Santos', email: 'bob@acme.com' },
    { id: 'usr-003', name: 'Carol Pereira', email: 'carol@acme.com' },
  ]

  return (
    <div className="page">
      <h1>User Identification</h1>
      <p className="page-desc">
        Associates the current RUM session with a user via <code>datadogRum.setUser()</code>.
        Call <code>clearUser()</code> to dissociate.
      </p>

      <div className="card-grid">
        <div className="demo-card">
          <h2>Quick Presets</h2>
          <div className="btn-group">
            {presets.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setUser(u)
                  setActiveUser(u)
                  setForm(u)
                }}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-card">
          <h2>Custom User</h2>
          <form className="user-form" onSubmit={handleSet}>
            <label>
              ID
              <input
                required
                value={form.id}
                placeholder="usr-000"
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              />
            </label>
            <label>
              Name
              <input
                required
                value={form.name}
                placeholder="Jane Doe"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                placeholder="jane@example.com"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <button type="submit">Set User</button>
          </form>
        </div>
      </div>

      {activeUser && (
        <div className="active-user">
          <div className="active-user-info">
            <span className="active-label">Active RUM user:</span>
            <strong>{activeUser.name}</strong>
            <span>{activeUser.email}</span>
            <code>{activeUser.id}</code>
          </div>
          <button className="btn-clear" onClick={handleClear}>
            Clear User
          </button>
        </div>
      )}
    </div>
  )
}
