# Datadog RUM Demo — React + TypeScript

Aplicação de demonstração das principais funcionalidades do [Datadog Real User Monitoring (RUM)](https://docs.datadoghq.com/real_user_monitoring/) construída com React 18 e TypeScript (Vite).

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

- Node.js ≥ 18
- npm ≥ 10

---

## Configuração

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Datadog:

```bash
cp .env.example .env
```

```env
# Obtenha em: Datadog → UX Monitoring → RUM Applications → New Application
VITE_DD_APPLICATION_ID=your-application-id
VITE_DD_CLIENT_TOKEN=your-client-token

VITE_DD_SITE=datadoghq.com   # ou datadoghq.eu, us3.datadoghq.com, etc.
VITE_DD_SERVICE=rum-demo
VITE_DD_ENV=development

# URL do backend instrumentado com dd-trace (para correlação RUM ↔ APM)
VITE_API_URL=http://localhost:8080
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Estrutura do projeto

```
src/
├── datadog/
│   └── rum.ts           # Inicialização do RUM + helpers exportados
├── components/
│   ├── Header.tsx        # Navegação e login/logout (setUser / clearUser)
│   └── ErrorBoundary.tsx # Captura erros React via componentDidCatch → addError
└── pages/
    ├── HomePage.tsx      # Custom Actions + demo de correlação RUM ↔ APM
    ├── ErrorPage.tsx     # Custom Errors (manuais e não capturados)
    └── UserPage.tsx      # User Identification
```

---

## Correlação RUM ↔ APM

O SDK injeta automaticamente cabeçalhos de tracing distribuído em todas as requisições HTTP para origens definidas em `allowedTracingUrls`:

| Cabeçalho | Formato | Uso |
|-----------|---------|-----|
| `x-datadog-trace-id` | Datadog | ID do trace no APM |
| `x-datadog-parent-id` | Datadog | ID do span pai |
| `x-datadog-sampling-priority` | Datadog | Prioridade de amostragem |
| `traceparent` | W3C / OTel | Interoperabilidade com OpenTelemetry |

Para que a correlação funcione, o backend precisa estar instrumentado com `dd-trace` e configurado para aceitar esses cabeçalhos via CORS.

### Exemplo de configuração no backend (Node.js)

```js
require('dd-trace').init({
  service: 'rum-demo-api',
  env: process.env.DD_ENV,
})

app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: [
    'x-datadog-trace-id',
    'x-datadog-parent-id',
    'x-datadog-sampling-priority',
    'x-datadog-origin',
    'traceparent',
    'tracestate',
  ],
}))
```

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |

---

## Referências

- [Datadog RUM — Browser SDK](https://docs.datadoghq.com/real_user_monitoring/browser/)
- [Configuração do RUM](https://docs.datadoghq.com/real_user_monitoring/browser/setup/)
- [Correlação RUM e APM](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/)
- [Session Replay](https://docs.datadoghq.com/real_user_monitoring/session_replay/)
- [User Sessions](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session)
