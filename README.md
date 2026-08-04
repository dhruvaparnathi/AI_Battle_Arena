# ⚔️ AI Battle Arena

> **Real-Time Multi-LLM Benchmark & Evaluation Arena Powered by LangGraph**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ai--battlearena.netlify.app-00E5FF?style=for-the-badge&logo=netlify&logoColor=white)](https://ai-battlearena.netlify.app/)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-State_Machine-FF4154?logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

🌐 **Live Demo**: [https://ai-battlearena.netlify.app/](https://ai-battlearena.netlify.app/)  
⚡ **Backend API**: `https://ai-models-battle-arena.onrender.com`

**AI Battle Arena** is an interactive web platform that pits top LLMs head-to-head in real time. Give the arena a prompt—whether it's complex code, system architecture, or creative reasoning—and watch two AI contenders draft solutions simultaneously. An automated AI Referee evaluates both entries using structured JSON scoring, picks a winner, and explains its reasoning in detail.

---

## 🌟 Key Features

- 🥊 **Head-to-Head Model Showdowns**: Run parallel LLM inferences for side-by-side comparative analysis.
  - **Fighter 1**: **Mistral Medium** (`mistral-medium-latest`) via `@langchain/mistralai`
  - **Fighter 2**: **Command-A** (`command-a-03-2025`) via `@langchain/cohere`
- 👨‍⚖️ **Automated AI Referee**: Powered by **Google Gemini** (`gemini-flash-latest`), acting as an impartial judge that returns:
  - Numerical scores (0–10) for each solution.
  - Formatted winner declaration (`Solution-1` vs `Solution-2`).
  - Structured, granular justification for the final verdict.
- ⚡ **LangGraph Execution Engine**: Graph-based state machine (`@langchain/langgraph`) orchestrating state propagation, parallel contender generation, and Zod schema-enforced evaluation nodes.
- 🎨 **Cyberpunk Battle Arena UI**: High-energy futuristic design featuring:
  - Live victory celebrations with confetti animations.
  - Syntax-highlighted Markdown rendering (code blocks, formulas, tables).
  - Quick sample prompt shortcuts.
  - Cold-start handling modal with auto-retry mechanisms for server spin-up.
- 📜 **Battle History Drawer**: Client-side history drawer saved in `localStorage` to revisit and inspect previous battles anytime.

---

## 🏗️ Architecture & Workflow

```
                        ┌────────────────────────┐
                        │   User Prompt Entry    │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  LangGraph StateNode   │
                        │    "solutionNode"      │
                        └───────────┬────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │ (Parallel Invocation via Promise.all)         │
            ▼                                               ▼
┌────────────────────────┐                     ┌────────────────────────┐
│     Mistral Medium     │                     │       Command-A        │
│   (mistralai model)    │                     │     (cohere model)     │
└───────────┬────────────┘                     └───────────┬────────────┘
            │                                               │
            │ Solution 1                                    │ Solution 2
            └───────────────────────┬───────────────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  LangGraph StateNode   │
                        │     "judge_eval"       │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │     Google Gemini      │
                        │  (gemini-flash-latest) │
                        │  + Zod Schema Output   │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │ Arena Winner & Verdict │
                        └────────────────────────┘
```

---

## 📁 Repository Structure

```
AI_Battle_Arena/
├── Backend/                      # Node.js + Express + LangGraph Server
│   ├── src/
│   │   ├── config/
│   │   │   └── config.ts         # Environment validation & schema setup
│   │   ├── services/
│   │   │   ├── models.service.ts # LangChain Model instances (Gemini, Mistral, Cohere)
│   │   │   └── graph.ai.service.ts # LangGraph StateGraph pipeline definition
│   │   └── app.ts                # Express routes & CORS setup
│   ├── server.ts                 # Server entry point
│   ├── tsconfig.json             # TypeScript configuration
│   └── package.json
│
├── Frontend/                     # React 19 + Vite UI App
│   ├── src/
│   │   ├── components/
│   │   │   ├── FighterCard.tsx       # Contender output card with score & winner indicators
│   │   │   ├── RefereeVerdict.tsx    # AI Judge score breakdown & reasoning panel
│   │   │   ├── HistoryDrawer.tsx     # Past battle drawer modal
│   │   │   ├── RenderNoticeModal.tsx # Spin-up status notification modal
│   │   │   └── Header.tsx            # Arena navigation & quick stats
│   │   ├── App.tsx               # Main battle arena application & logic
│   │   ├── types.ts              # Battle data TypeScript definitions
│   │   └── index.css             # Tailwind v4 styles & neon glow themes
│   ├── netlify.toml              # Netlify deployment rewrites & proxy rules
│   ├── vite.config.ts            # Vite configuration
│   └── package.json
│
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **API Keys**:
  - [Google Gemini API Key](https://aistudio.google.com/)
  - [Mistral AI API Key](https://console.mistral.ai/)
  - [Cohere API Key](https://dashboard.cohere.com/)

---

### 1. Backend Setup

Navigate to the `Backend` directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

Start the Backend development server:

```bash
npm run dev
```

The backend server will run at `http://localhost:3000`.

---

### 2. Frontend Setup

In a new terminal window, navigate to the `Frontend` directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Reference

### Trigger AI Model Battle

`POST /ai/graph`

Runs the full LangGraph workflow: invokes Mistral Medium and Cohere Command-A in parallel, evaluates results via Google Gemini, and returns structured data.

#### Request Body
```json
{
  "userMessage": "Write a high-performance LRU Cache in TypeScript with O(1) operations."
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "AI Graph Service",
  "data": {
    "solution_1": "...",
    "solution_2": "...",
    "judge": {
      "solution_1_score": 9,
      "solution_2_score": 8,
      "winner": "Solution-1",
      "reasoning": "Solution 1 provided a cleaner TypeScript implementation using a Map to maintain key insertion order..."
    }
  }
}
```

---

## 🛠️ Tech Stack & Libraries

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Rendering**: `react-markdown` + `remark-gfm`
- **Effects**: `canvas-confetti`

### Backend
- **Runtime**: Node.js + [Express 5](https://expressjs.com/)
- **Orchestration**: [@langchain/langgraph](https://www.langchain.com/langgraph)
- **Model Integrations**: `@langchain/google`, `@langchain/mistralai`, `@langchain/cohere`
- **Validation**: [Zod](https://zod.dev/)

---

## 🌐 Deployment

- **Frontend**: Deployed on **Netlify** with `netlify.toml` configuring single-page app fallback routes and API proxies.
- **Backend**: Deployed on **Render** as a Web Service.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
