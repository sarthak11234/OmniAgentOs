# OmniAgentOS

**Modular, multi-modal AI operating system powered by Hugging Face.**

## Features
- 🧠 Text backbone agent (Llama-3.1/Mixtral)
- 🗣 Audio transcription (Whisper)
- 📄 Summarization (BART/Pegasus)
- 🖼 Vision, translation, code (stretch goals)
- Modular agent/plugin system
- Modern Next.js dashboard

## Architecture
- FastAPI backend (modular routers, agent system)
- Next.js 14 + Tailwind frontend
- PostgreSQL database
- Dockerized for easy deployment

## Getting Started
1. Clone repo
2. Copy `.env.example` to `.env` and set Hugging Face API keys
3. `docker-compose up --build`
4. Visit `localhost:3000`

## Folder Structure
- `/backend` — FastAPI app, agents, routers
- `/frontend` — Next.js dashboard
- `/db` — Migrations

## Roadmap
- [x] MVP: Text, audio, summarization
- [ ] Vision, translation, code agents
- [ ] Multi-user, dashboards

## Contributing
PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
MIT
