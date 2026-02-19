# Czech Building Law AI Chat

AI-powered chat interface for querying Czech building law (stavební právo). Built on top of a structured knowledge base of legislation, court rulings, regulations, and technical standards.

## What it does

Ask questions about Czech building law in natural language. The AI agent searches through a curated collection of legal documents and returns grounded answers with references.

The knowledge base includes:
- **Laws** — full texts of relevant Czech legislation
- **Court rulings** (judikáty) — 2,000+ decisions from Czech courts
- **Regulations** — decrees and government ordinances
- **Related laws** — 1,400+ connected pieces of legislation
- **EU regulations** — relevant European directives
- **Czech technical standards** (ČSN)
- **Prague-specific rules** — local building regulations
- **Natura 2000** — nature protection directives

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js 16 frontend (React 19)             │
│  Chat UI with backend & model selectors     │
├─────────────────────────────────────────────┤
│  /api/chat  (streaming API route)           │
├─────────────────────────────────────────────┤
│  @laws/shared                               │
│  ┌────────────┐  ┌────────────────────────┐ │
│  │ Claude SDK  │  │ Cline CLI (subprocess) │ │
│  │ backend     │  │ backend                │ │
│  └────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────┤
│  workspace/  — legal knowledge base         │
└─────────────────────────────────────────────┘
```

**Monorepo** with npm workspaces:

| Package | Description |
|---------|-------------|
| `shared/` | Agent logic, backend abstraction, streaming utilities |
| `web/` | Next.js chat application |
| `tests/` | Query regression tests |
| `workspace/` | Legal documents (not tracked in git) |

## Tech stack

- **Next.js 16** + **React 19** — frontend
- **Vercel AI SDK v6** — chat streaming protocol
- **Claude Agent SDK** — primary AI backend (Anthropic)
- **Cline CLI** — alternative AI backend (supports free models)
- **TypeScript 5.7** — strict mode throughout

## Getting started

### Prerequisites

- Node.js 22+
- Anthropic API key (for Claude backend)
- [Cline CLI](https://github.com/cline/cline) (optional, for Cline backend)

### Install

```bash
git clone <repo-url> && cd laws
npm install
```

### Configure

```bash
# Required for Claude backend
export ANTHROPIC_API_KEY=sk-ant-...

# Optional: switch default backend
export AGENT_BACKEND=claude    # "claude" (default) or "cline"
```

### Build & run

```bash
# Build shared library first
npm run build -w shared

# Start dev server
npm run dev -w web
```

Open [http://localhost:3000](http://localhost:3000).

## Switchable backends

The app supports two AI backends, switchable from the UI or via environment variables.

### Claude SDK (default)

Uses the [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents/claude-agent-sdk) directly. The agent has access to the `workspace/` directory and can search, read, and cross-reference legal documents.

Available models:
- `claude-haiku-4-5` (default, fast)
- `claude-sonnet-4-5`
- `claude-opus-4`

### Cline CLI

Spawns [Cline](https://github.com/cline/cline) as a subprocess with `--json` output. Useful for accessing free models without API keys.

Available free models:
- `minimax/minimax-m2.5` — MiniMax M2.5
- `z-ai/glm-5` — Z-AI GLM5
- `kwaipilot/kat-coder-pro` — KAT Coder Pro
- `arcee-ai/trinity` — Arcee Trinity

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_BACKEND` | `"claude"` or `"cline"` | `"claude"` |
| `CLINE_BIN` | Path to Cline binary | `"cline"` |
| `CLINE_MODEL` | Default model for Cline | — |
| `CLINE_TIMEOUT` | Cline timeout (seconds) | `300` |
| `CLINE_CONFIG` | Custom Cline config dir | — |

## Project structure

```
laws/
├── shared/src/
│   ├── config.ts            # Paths, model config, env vars
│   ├── agent.ts             # Claude Agent SDK wrapper
│   ├── backend.ts           # BackendProvider interface
│   ├── claude-backend.ts    # Claude SDK implementation
│   ├── cline-backend.ts     # Cline CLI implementation
│   ├── backend-factory.ts   # getBackend() factory
│   ├── stream-utils.ts      # Text streaming + UI writer
│   └── index.ts             # Public exports
├── web/app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Chat UI
│   └── api/chat/route.ts    # Streaming API endpoint
├── workspace/               # Legal knowledge base (gitignored)
│   ├── laws/                # Law texts
│   ├── judikaty/            # Court rulings
│   ├── regulations/         # Decrees & ordinances
│   ├── connected_laws/      # Related legislation
│   ├── relationships/       # Cross-references
│   ├── prague/              # Prague-specific rules
│   ├── natura2000/          # Nature protection
│   ├── csn/                 # Czech technical standards
│   └── eu/                  # EU regulations
├── tests/                   # Query regression tests
├── tsconfig.base.json
└── package.json             # Monorepo root
```

## License

Private project. All rights reserved.
