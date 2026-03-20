# LOOM VIDEO SCRIPT — OS-95 Terminal (5–10 min)

This is a guide to help you record your Loom video for the Thinkly Labs submission.
Total target time: 6–8 minutes. Stay confident and casual.

---

## SECTION 1: Intro (0:00 – 0:45)
**What to say:**
"Hey! I'm Subharjun, and this is OS-95 — a retro computing chatbot I built for the Thinkly Labs 
frontend assignment. I picked retro computing as my topic because it has this really natural visual 
identity — terminals, green text, old fonts — so the UI and the subject reinforce each other. 
Let me show you what I built."

**What to show:**
- Your screen with the app running at localhost:3000

---

## SECTION 2: Show the Product (0:45 – 2:30)

**What to say:**
"The first thing the user sees is this boot sequence — I wanted to avoid just showing a blank chat 
window. It sets the tone: this isn't a generic chatbot, it's a deliberately designed experience. 
Once the boot finishes, you get the terminal prompt."

**What to show:**
- Refresh the page so the boot sequence plays
- Point out the CRT scanlines, the phosphor-green glow, the blinking cursor
- Point out the live clock and session ID in the header
- Point out the empty state: "NO PRIOR TRANSMISSIONS"

**What to say:**
"Now let me ask it something. AXIOM-7 is trained on retro computing — it knows MS-DOS, 
Windows 95, the Commodore 64, early internet, BBS systems, the demoscene. All defined 
in the system prompt."

**What to show:**
- Type: "Tell me about the Commodore 64"
- Wait for response — point out the amber (user) vs green (AXIOM-7) styling
- Point out the loading state message while it's thinking

---

## SECTION 3: Live Search Feature (2:30 – 3:30)

**What to say:**
"One feature I added is live web search via SerpAPI. If you ask something that sounds like 
current news — using words like 'latest', 'today', '2026' — it automatically pings the web 
and injects that data into the AI's context. Watch the status bar."

**What to show:**
- Type: "What's the latest news about retro computing today?"
- Show the status change: "PINGING DATALINK... FETCHING LIVE INTEL..."
- Show the response that says "[LIVE DATALINK ACTIVE]"

---

## SECTION 4: Chat History / Persistence (3:30 – 4:30)

**What to say:**
"I also hooked up MongoDB to persist the chat. Your session is saved to the database — 
so if you close the tab and come back, your conversation is still there. Let me show you."

**What to show:**
- Refresh the page (Cmd+R or F5)
- After boot sequence, show that old messages are restored
- Say: "This is what makes it feel like a real product, not a demo."

---

## SECTION 5: Walk Through the Code (4:30 – 7:00)

**What to say:**
"Let me quickly walk through how it's structured."

### Open `src/app/page.js`
"This is the main component. The boot sequence is a `useEffect` that adds lines to state 
every 350ms. I moved the array outside the component to avoid stale closure bugs — 
that was actually a bug I caught and fixed during testing. Once booting is false, 
the chat interface appears."

### Open `src/app/api/chat/route.js`
"This is the GROQ endpoint. The key part is the system prompt — this is where I 'train' 
the bot on retro computing. It lists the specific areas it knows: MS-DOS, Commodore 64, 
BBSes, the demoscene, DOOM. I also pass in the SerpAPI results here if the query triggered 
a search — so the AI can answer with live data."

### Open `src/app/api/search/route.js`
"This hits SerpAPI with the user's query and returns the top 3 snippets, formatted for 
injection into the GROQ prompt."

### Open `src/app/api/history/route.js`
"And this loads the user's previous messages from MongoDB using their session ID — 
which is generated client-side and stored in localStorage."

---

## SECTION 6: On AI Usage (7:00 – 8:00)

**What to say:**
"For this project I used AI tools to help me move faster — but I directed every decision. 
For example, the AI suggested keeping the date rendering inside the component, 
which caused a hydration error in Next.js. I caught it, diagnosed it, and fixed it by 
moving it to a client-only `useEffect`. I also chose the retro computing topic, designed 
the boot sequence UX, and wrote the AXIOM-7 system prompt — those are the things 
that make or break the product."

---

## SECTION 7: Outro (8:00 – 8:30)

**What to say:**
"The whole point was to build something that doesn't feel like a generic wrapper. 
OS-95 feels like a product — it has a beginning (the boot), a purpose (retro computing), 
and small details that show I thought about the user. Hope you enjoy it, thanks for watching."

---

## Pro tips for recording:
- Keep your terminal font large (Cmd+= in your code editor)
- Don't rush — slower is better on Loom
- It's OK to make a small mistake — just keep going, it shows authenticity
- Point with your mouse to highlight what you're talking about
