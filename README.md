# SVIZZGPT // Multimodal Intelligence System

```
 ███████╗██╗   ██╗██╗███████╗███████╗ ██████╗ ██████╗ ████████╗
 ██╔════╝██║   ██║██║╚══███╔╝╚══███╔╝██╔════╝ ██╔══██╗╚══██╔══╝
 ███████╗██║   ██║██║  ███╔╝   ███╔╝ ██║  ███╗██████╔╝   ██║   
 ╚════██║╚██╗ ██╔╝██║ ███╔╝   ███╔╝  ██║   ██║██╔═══╝    ██║   
 ███████║ ╚████╔╝ ██║███████╗███████╗╚██████╔╝██║        ██║   
 ╚══════╝  ╚═══╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝        ╚═╝   
```

**SvizzGPT** is a personal multimodal AI assistant featuring a high-contrast editorial brutalist interface, real-time ASCII visual wallpaper engines, multimodal vision/image understanding, document text extraction (PDF, CSV, code, JSON), DALL-E 3 image generation, live web citations, token cost telemetry, and a signature **Focus Isolation Mode**.

---

## Key Features

1. **Multimodal Reasoning**:
   - **Text Conversations**: Real-time token streaming via SSE with status transitions (`PROCESSING`, `REASONING`, `GENERATING`, `FINALIZING`).
   - **Multimodal Vision**: Upload PNG, JPG, WEBP diagrams, UI screenshots, or handwritten notes for visual breakdown.
   - **Document & File Analysis**: Upload PDF, CSV, JSON, Markdown, and source code files with auto-extraction and context integration.
   - **Image Generation**: Generate visuals directly via `/image <prompt>` using DALL-E 3.
   - **Live Web Search**: Live web citations and footnotes with URL verification.

2. **Signature Focus / Spotlight Mode**:
   - Select any assistant message to trigger **Focus Isolation Mode**.
   - The selected message remains 100% visible while all other UI elements become completely transparent.
   - Full formatting preserved (syntax-highlighted code, LaTeX math equations, tables).
   - Press `ESC` or click outside to instantly return.

3. **ASCII Art Visual System**:
   - 7 GPU/CPU-efficient ambient ASCII wallpaper modes:
     - `ASCII GRID` (Matrix coordinate grid)
     - `PARTICLE CLOUD` (Interactive drifting ASCII glyphs)
     - `DIGITAL STREAM` (Terminal cascading stream)
     - `TOPOGRAPHIC SINE` (Mathematical elevation contours)
     - `SIGNAL FREQUENCY` (Real-time frequency waveform)
     - `DITHER NOISE` (Controlled stochastic grain)
     - `DEEP VOID` (Minimalist pure black)
   - Controllable animation intensity, speed, and `prefers-reduced-motion` support.

4. **Appearance & Custom Themes**:
   - Preset Accent Color Themes: `MONO VOID`, `CRT AMBER`, `CYBER CYAN`, `MATRIX GREEN`, `BRUTAL RED`, `HYPER VIOLET`, `TOXIC ACID`.
   - Retro CRT Phosphor scanlines and pixel noise toggles.

5. **Telemetry & Cost Tracking**:
   - Server-side usage analytics tracking total requests, input/output tokens, and dollar cost estimates per model.

6. **Power User Controls**:
   - **Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid theme switching, model changes, wallpapers, and conversation shortcuts.
   - **Message Actions**: Copy, Regenerate, Edit user prompt, Like/Dislike, Delete, and Focus.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, KaTeX (LaTeX Math), React Markdown, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn, SQLite / SQLModel (Persistent Storage), Pydantic v2.
- **AI Integrations**: OpenAI API (`gpt-4o`, `gpt-4o-mini`, `dall-e-3`), DuckDuckGo / Tavily Web Search, PyPDF.

---

## Project Structure

```
svizzgpt/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration
│   │   ├── database.py            # SQLite / PostgreSQL connection
│   │   ├── models.py              # SQLModel tables & API schemas
│   │   ├── main.py                # FastAPI app assembly & CORS
│   │   ├── providers/
│   │   │   ├── base.py            # Abstract AI Provider
│   │   │   └── openai_provider.py # OpenAI SSE streaming, vision & DALL-E 3
│   │   ├── routers/
│   │   │   ├── chat.py            # Streaming & standard chat endpoints
│   │   │   ├── images.py          # DALL-E 3 image generation
│   │   │   ├── files.py           # Secure file upload & extraction
│   │   │   ├── conversations.py   # CRUD for chats and messages
│   │   │   ├── settings.py        # User appearance & preferences
│   │   │   └── usage.py           # Token telemetry & cost tracking
│   │   └── services/
│   │       ├── file_extractor.py  # PDF, CSV, code parser
│   │       ├── web_search.py      # Live web citations
│   │       └── token_counter.py   # Token calculation & cost estimates
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ascii/             # AsciiWallpaper, AsciiLogo, AsciiStatus
│   │   │   ├── chat/              # Composer, Messages, FocusMessageModal, Hero
│   │   │   ├── layout/            # Sidebar, Header, CommandPalette, SettingsModal
│   │   │   └── ui/                # CodeBlock, CitationsList, UsagePanel
│   │   ├── lib/                   # API client, types, constants
│   │   ├── styles/globals.css     # Theme tokens & CRT scanline raster
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
├── start.sh
└── README.md
```

---

## Getting Started

### 1. Configure Environment Variables

Create `.env` from the example template:
```bash
cp .env.example .env
```

Add your OpenAI API key in `.env`:
```env
OPENAI_API_KEY=sk-proj-...
```

### 2. Launch the Application

Run the automated launcher:
```bash
./start.sh
```

Or run frontend and backend independently:

**Backend (Port 8000):**
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python backend/run.py
```

**Frontend (Port 5173):**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Security & Architecture Principles

- **Zero Client-Side Secret Leakage**: The OpenAI API key resides exclusively on the backend server. It is never transmitted or exposed in frontend JS bundles.
- **Safe Document Execution**: Uploaded files are parsed in memory using PyPDF and sanitized text extractors; files are never executed.
- **Network Resilience**: SvizzGPT is structured as an independent self-hosted web application with a direct backend API architecture.
