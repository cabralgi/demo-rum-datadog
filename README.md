# Datadog RUM Demo — React + TypeScript + Flask

Aplicação de demonstração das principais funcionalidades do [Datadog Real User Monitoring (RUM)](https://docs.datadoghq.com/real_user_monitoring/).

- **Frontend**: React 18 + TypeScript (Vite) — compilado para assets estáticos
- **Backend**: Python + Flask — serve os assets e expõe a API de demo instrumentada com `ddtrace`

---

## Funcionalidades demonstradas

| Página | Funcionalidade | API RUM |
|--------|---------------|---------|
| Custom Actions | Rastreamento de ações do usuário | `datadogRum.addAction(name, context)` |
| Custom Errors | Captura de erros manuais e não capturados | `datadogRum.addError(error, context)` |
| User Identification | Associação da sessão a um usuário | `datadogRum.setUser(user)` / `clearUser()` |
| Session Replay | Gravação de sessões (100% sample rate) | Configurado via `sessionReplaySampleRate` |
| RUM ↔ APM | Correlação com traces de backend | `allowedTracingUrls` + `propagatorTypes` |

---

## Pré-requisitos

- Node.js ≥ 18 + pnpm ≥ 9 *(apenas para o build do frontend)*
- Python ≥ 3.11
- Datadog Agent rodando localmente *(para envio de traces APM)*

---

## Configuração

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

```env
# Datadog RUM (Frontend) — obtenha em: UX Monitoring → RUM Applications
VITE_DD_APPLICATION_ID=your-application-id
VITE_DD_CLIENT_TOKEN=your-client-token
VITE_DD_SITE=datadoghq.com
VITE_DD_SERVICE=rum-demo
VITE_DD_ENV=development

# URL base da API (para correlação RUM ↔ APM)
VITE_API_URL=http://localhost:8080

# Backend Flask
CORS_ORIGIN=http://localhost:5173
PORT=8080
FLASK_DEBUG=true

# Datadog APM (Backend) — usados pelo ddtrace-run
DD_SERVICE=rum-demo-api
DD_ENV=development
DD_VERSION=1.0.0
```

### 2. Instale as dependências

**Frontend:**
```bash
pnpm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

---

## Executar

### Modo produção (Flask serve tudo — sem Node em runtime)

```bash
# 1. Compile o frontend
pnpm build

# 2. Suba o Flask com ddtrace
DD_SERVICE=rum-demo-api DD_ENV=development \
  ddtrace-run flask --app backend/app.py run --port 8080
```

Acesse `http://localhost:8080`.

### Modo desenvolvimento (Vite HMR + Flask API)

```bash
# Terminal 1 — frontend com hot reload
pnpm dev

# Terminal 2 — API backend
flask --app backend/app.py run --port 8080
```

Acesse `http://localhost:5173`.

---

## Estrutura do projeto

```
.
├── src/                     # Frontend React/TypeScript
│   ├── datadog/rum.ts        # Inicialização do RUM + helpers
│   ├── components/
│   │   ├── Header.tsx         # Navegação, login/logout (setUser / clearUser)
│   │   └── ErrorBoundary.tsx  # Captura erros via componentDidCatch → addError
│   └── pages/
│       ├── HomePage.tsx       # Custom Actions + demo RUM ↔ APM
│       ├── ErrorPage.tsx      # Custom Errors
│       └── UserPage.tsx       # User Identification
├── backend/
│   ├── app.py                # Flask: SPA fallback + endpoints /api/*
│   ├── requirements.txt
│   └── static/               # ← gerado pelo pnpm build (não commitado)
├── vite.config.ts            # outDir: backend/static
├── .env.example
└── README.md
```

---

## Correlação RUM ↔ APM

O SDK injeta automaticamente cabeçalhos de tracing em requisições para a API:

| Cabeçalho | Formato | Uso |
|-----------|---------|-----|
| `x-datadog-trace-id` | Datadog | ID do trace no APM |
| `x-datadog-parent-id` | Datadog | ID do span pai |
| `x-datadog-sampling-priority` | Datadog | Prioridade de amostragem |
| `traceparent` | W3C / OTel | Interoperabilidade com OpenTelemetry |

O Flask está configurado com `flask-cors` para aceitar esses cabeçalhos, e o `ddtrace` os lê automaticamente para vincular cada span APM à sessão RUM correspondente.

---

## Referências

- [Datadog RUM — Browser SDK](https://docs.datadoghq.com/real_user_monitoring/browser/)
- [Correlação RUM e APM](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/)
- [ddtrace — Python APM](https://ddtrace.readthedocs.io/en/stable/)
- [Session Replay](https://docs.datadoghq.com/real_user_monitoring/session_replay/)
