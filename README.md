# AI Agent Wrapper

Universal wrapper for AI agents using Vercel AI SDK. Provides a unified interface for Claude SDK and Cline CLI backends with streaming support.

## Features

- Universal agent wrapper with pluggable backends
- Works with `workspace/` directory for document access
- Web interface runs without `.env` (requires Claude/Cline installed)
- Testing layer for query validation
- Streaming responses via Vercel AI SDK

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js frontend with chat UI              │
├─────────────────────────────────────────────┤
│  /api/chat (streaming endpoint)             │
├─────────────────────────────────────────────┤
│  @laws/shared                               │
│  ┌────────────┐  ┌────────────────────────┐ │
│  │ Claude SDK  │  │ Cline CLI (subprocess) │ │
│  └────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────┤
│  workspace/ (your documents)                │
└─────────────────────────────────────────────┘
```

## Quick Start

```bash
npm install
npm run build -w shared
npm run dev -w web
```

Open [http://localhost:3000](http://localhost:3000)

## Backends

### Claude SDK
Uses Anthropic's Claude Agent SDK. Requires `ANTHROPIC_API_KEY` environment variable.

### Cline CLI
Spawns Cline as subprocess. No API key needed for free models.

Switch backends via UI or `AGENT_BACKEND` environment variable.

## Project Structure

```
├── shared/          # Agent wrapper, backends, streaming
├── web/             # Next.js chat interface
├── tests/           # Query testing layer
└── workspace/       # Document directory (gitignored)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_BACKEND` | `"claude"` or `"cline"` | `"claude"` |
| `ANTHROPIC_API_KEY` | Claude API key | — |
| `CLINE_BIN` | Path to Cline binary | `"cline"` |

## License

Private project.
