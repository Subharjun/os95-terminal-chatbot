# OS-95 Terminal — Retro Computing Chatbot

> **A purpose-built chatbot themed as a 1990s operating system, running AXIOM-7: an AI expert in the history of Retro Computing.**

Live demo: [Link after Vercel deployment]

---

## The Concept

**Topic: Retro Computing (1970s–2000s)**

OS-95 is not a generic chatbot. It's built around a specific niche — the history, culture, and hardware of vintage computing. The UI, the persona, and the knowledge base all reinforce each other:

- The **UI** looks like an old phosphor-green terminal (because the subject IS old computers)
- The **AI persona** (AXIOM-7) is an AI running on "OS-95" — a fictional 1995 OS
- The **knowledge base** is focused: MS-DOS, Windows 95/98, Commodore 64, BBS culture, early internet, classic hardware

This is what "trained on a topic" means in this context: a carefully engineered **system prompt** that defines the bot's scope, expertise, and personality.

---

## Features

### Frontend Thinking
| Feature | What it shows |
|---|---|
| **Boot sequence** | The first thing users see — not a blank screen. Sets the tone immediately. |
| **Loading state** | "PINGING DATALINK... ROUTING TO AXIOM-7..." (never just a spinner) |
| **Empty state** | "NO PRIOR TRANSMISSIONS IN THIS SESSION. READY FOR FIRST CONTACT." |
| **Error state** | Red-bordered: "SYSTEM_ERROR: CONNECTION TO AXIOM-7 LOST" |
| **Amber vs Green** | User messages in amber, AXIOM-7 in green — clear visual hierarchy |
| **Live clock + Session ID** | Shows the user they're in a "real" system session |
| **Blinking cursor** | `>_` that blinks — tiny detail, huge character |
| **Chat persistence** | Messages survive page refresh (MongoDB) — feels like a real product |

### AI
- **GROQ** (`llama-3.3-70b-versatile`) for near-instant responses
- **Focused system prompt** — AXIOM-7 is an expert on retro computing, classic OS history, old hardware
- **Live web search** (SerpAPI) — triggered by keywords like "latest", "news", "today"

### Backend
- `POST /api/chat` — GROQ with AXIOM-7 persona
- `GET /api/search` — SerpAPI live web search
- `GET /api/history` — Load past session from MongoDB

---

## Tech Stack
- **Next.js 16** (App Router, JavaScript)
- **GROQ API** (LLM backbone)
- **SerpAPI** (live web search)
- **MongoDB Atlas + Mongoose** (chat persistence)
- **Vanilla CSS** (CRT effects, scanlines, phosphor glow)
- **VT323** (Google Fonts — pixel-art monospace)

---

## How to Run Locally

```bash
git clone <your-repo-url>
cd ThinkyLab
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_groq_key
SERPAPI_KEY=your_serpapi_key
MONGODB_URI=your_mongodb_connection_string
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Ask AXIOM-7 About...
- "What was Windows 95 like?"
- "Tell me about the Commodore 64"
- "What is a BBS?"
- "What were the best games on MS-DOS?"
- "How did early internet work?"
- "What is the demoscene?"

---

## Why I Picked This Topic

Retro computing is a niche subject with a passionate community. It also has a natural visual identity (terminals, green text, old fonts) that makes UI design choices feel purposeful — not arbitrary. The whole experience is designed so that even the interface is a "character" in the story.
