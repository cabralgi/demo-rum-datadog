import { datadogRum } from '@datadog/browser-rum'

const applicationId = import.meta.env.VITE_DD_APPLICATION_ID ?? 'your-application-id'
const clientToken = import.meta.env.VITE_DD_CLIENT_TOKEN ?? 'your-client-token'

// URLs cujas requisições receberão os cabeçalhos de tracing distribuído.
// O backend instrumentado com dd-trace lerá esses cabeçalhos e vinculará
// o span APM à sessão RUM correspondente.
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

datadogRum.init({
  applicationId,
  clientToken,
  site: import.meta.env.VITE_DD_SITE ?? 'datadoghq.com',
  service: import.meta.env.VITE_DD_SERVICE ?? 'rum-demo',
  env: import.meta.env.VITE_DD_ENV ?? 'development',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'allow',

  // ── RUM ↔ APM correlation ────────────────────────────────────────────────
  // Define quais origens receberão os cabeçalhos de tracing.
  // Aceita string, RegExp ou função (match: url) => boolean.
  allowedTracingUrls: [
    { match: apiUrl, propagatorTypes: ['datadog', 'tracecontext'] },
  ],
  // Porcentagem de requisições rastreadas (0-100). 100 = todas em dev.
  traceSampleRate: 100,
  // ────────────────────────────────────────────────────────────────────────
})

export interface RumUser {
  id: string
  name: string
  email: string
  [key: string]: unknown
}

export function setUser(user: RumUser): void {
  datadogRum.setUser(user)
}

export function clearUser(): void {
  datadogRum.clearUser()
}

export function addAction(name: string, context?: Record<string, unknown>): void {
  datadogRum.addAction(name, context)
}

export function addError(error: Error | string, context?: Record<string, unknown>): void {
  datadogRum.addError(error, context)
}
