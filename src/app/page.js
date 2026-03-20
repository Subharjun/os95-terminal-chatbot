"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Session helpers ────────────────────────────────────────────────────────

function getAllSessions() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("os95-sessions") || "[]"); }
  catch { return []; }
}

function saveAllSessions(sessions) {
  if (typeof window === "undefined") return;
  localStorage.setItem("os95-sessions", JSON.stringify(sessions));
}

function getOrCreateCurrentSession() {
  if (typeof window === "undefined") return null;
  const currentId = localStorage.getItem("os95-current-session");
  const all = getAllSessions();
  if (currentId && all.find((s) => s.id === currentId)) return all.find((s) => s.id === currentId);
  const s = { id: "SID-" + Math.random().toString(36).substr(2, 9).toUpperCase(), label: "TRANSMISSION-1", createdAt: new Date().toISOString() };
  saveAllSessions([s]);
  localStorage.setItem("os95-current-session", s.id);
  return s;
}

function createNewSession(all) {
  if (typeof window === "undefined") return null;
  const s = { id: "SID-" + Math.random().toString(36).substr(2, 9).toUpperCase(), label: `TRANSMISSION-${all.length + 1}`, createdAt: new Date().toISOString() };
  saveAllSessions([...all, s]);
  localStorage.setItem("os95-current-session", s.id);
  return s;
}

function needsSearch(text) {
  return ["latest","news","current","today","what is","who is","price","score","weather","when did","how many","how much","define","search","find","look up","tell me about","2024","2025","2026"].some(k => text.toLowerCase().includes(k));
}

const BOOT = [
  "OS-95 KERNEL v2.6.1 LOADED SUCCESSFULLY.",
  "PARSING SYSTEM CONFIG... [OK]",
  "MEMORY CHECK: 655,360 BYTES FREE.",
  "INITIALIZING GROQ ACCELERATOR UNIT...",
  "AXIOM-7 NEURAL ENGINE ONLINE... [OK]",
  "DATALINK MODULE (SERPAPI) INITIALIZED...",
  "CONNECTING TO MONGODB ARCHIVE CLUSTER...",
  "ESTABLISHING DOWNLINK: SECTOR-7...",
  "SYSTEM READY. ALL SYSTEMS NOMINAL.",
  "========================================",
  "WELCOME, OPERATOR. TERMINAL ACTIVE.",
  "TYPE YOUR QUERY TO BEGIN TRANSMISSION.",
];

const G = "#33ff33";
const A = "#ffb000";
const BG = "#0d0208";

function btn(color) {
  return { border: `1px solid ${color}`, color, background: "transparent", padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", minHeight: "28px", whiteSpace: "nowrap" };
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isBooting, setIsBooting] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState("");
  const [session, setSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [clock, setClock] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const scrollRef = useRef(null);

  // Boot
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT.length) { setBootLines(p => [...p, BOOT[i]]); i++; }
      else { clearInterval(iv); setTimeout(() => setIsBooting(false), 500); }
    }, 280);
    return () => clearInterval(iv);
  }, []);

  // Clock + mount
  useEffect(() => {
    setMounted(true);
    setClock(new Date().toLocaleTimeString());
    const t = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Init session after boot
  useEffect(() => {
    if (!isBooting) {
      const s = getOrCreateCurrentSession();
      setSession(s);
      setAllSessions(getAllSessions());
      if (s) loadHistory(s.id);
    }
  }, [isBooting]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, bootLines, isTyping]);

  const loadHistory = async (sid) => {
    setMessages([]);
    try {
      const r = await fetch(`/api/history?sessionId=${sid}`);
      const d = await r.json();
      if (d.messages?.length > 0) {
        setMessages(d.messages.map(m => ({ _id: m._id?.toString(), role: m.role, content: m.content, timestamp: new Date(m.timestamp).toLocaleTimeString() })));
      }
    } catch (e) { console.error(e); }
  };

  const switchSession = useCallback((s) => {
    localStorage.setItem("os95-current-session", s.id);
    setSession(s);
    setShowLogs(false);
    setInput("");
    loadHistory(s.id);
  }, []);

  const deleteMessage = useCallback(async (msgId, idx) => {
    setMessages(p => p.filter((_, i) => i !== idx));
    if (!msgId) return;
    try { await fetch(`/api/messages?id=${msgId}`, { method: "DELETE" }); } catch (e) { console.error(e); }
  }, []);

  const deleteSession = useCallback(async (s) => {
    try { await fetch(`/api/history?sessionId=${s.id}`, { method: "DELETE" }); } catch (e) { console.error(e); }
    const updated = getAllSessions().filter(x => x.id !== s.id);
    saveAllSessions(updated);
    setAllSessions(updated);
    if (s.id === session?.id) {
      if (updated.length > 0) {
        localStorage.setItem("os95-current-session", updated[0].id);
        setSession(updated[0]);
        loadHistory(updated[0].id);
      } else {
        const all = getAllSessions();
        const fresh = createNewSession(all);
        setSession(fresh);
        setAllSessions([fresh]);
        setMessages([]);
      }
    }
  }, [session]);

  const restartSession = useCallback(() => {
    setConfirmRestart(false);
    const all = getAllSessions();
    const fresh = createNewSession(all);
    setSession(fresh);
    setAllSessions(getAllSessions());
    setMessages([]);
    setInput("");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !session) return;
    const text = input.trim();
    setMessages(p => [...p, { _id: null, role: "user", content: text, timestamp: new Date().toLocaleTimeString() }]);
    setInput("");
    setIsTyping(true);
    let searchResults = null;

    if (needsSearch(text)) {
      setStatus("PINGING DATALINK...");
      try {
        const sr = await fetch(`/api/search?q=${encodeURIComponent(text)}`);
        const sd = await sr.json();
        if (sd.results) { searchResults = sd.results; setStatus("ROUTING TO AXIOM-7..."); }
      } catch { setStatus("ROUTING TO AXIOM-7..."); }
    } else { setStatus("ROUTING TO AXIOM-7..."); }

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, sessionId: session.id, searchResults }) });
      const data = await res.json();
      const reply = data.reply || data.error || "TRANSMISSION FAILED.";
      if (data.userMsgId) setMessages(p => p.map((m, i) => i === p.length - 1 && m._id === null ? { ...m, _id: data.userMsgId } : m));
      setMessages(p => [...p, { _id: data.botMsgId || null, role: "bot", content: reply, timestamp: new Date().toLocaleTimeString(), usedSearch: !!searchResults }]);
    } catch {
      setMessages(p => [...p, { _id: null, role: "bot", content: "SYSTEM_ERROR: CONNECTION TO AXIOM-7 LOST.", timestamp: new Date().toLocaleTimeString(), error: true }]);
    } finally { setIsTyping(false); setStatus(""); }
  }, [input, isTyping, session]);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div suppressHydrationWarning style={{ display: "flex", flexDirection: "column", height: "100dvh", padding: "8px 12px", boxSizing: "border-box" }}>

      {/* HEADER */}
      <header style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(51,255,51,0.3)", paddingBottom: "6px", marginBottom: "8px", flexShrink: 0 }}>
        <div style={{ color: G, fontSize: "0.8rem", fontWeight: "bold", whiteSpace: "nowrap" }}>OS-95&#8482;</div>
        <div suppressHydrationWarning style={{ flex: 1, textAlign: "center", color: G, fontSize: "0.7rem", opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hide-xs">
          {mounted ? (session ? `${session.label} \u2022 ${clock}` : clock) : ""}
        </div>
        {!isBooting && (
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={() => setShowLogs(true)} style={btn(G)}>&#9776; LOGS</button>
            <button onClick={() => setConfirmRestart(true)} style={btn(A)}>&#8635; NEW</button>
          </div>
        )}
      </header>

      {/* MISSION LOGS */}
      {showLogs && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: "8vh", overflowY: "auto", fontFamily: "inherit" }}>
          <div style={{ width: "min(560px, 92vw)", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${G}`, paddingBottom: "8px" }}>
              <div style={{ color: G, fontSize: "1.1rem", letterSpacing: "0.1em" }}>&#9776; MISSION LOGS</div>
              <button onClick={() => setShowLogs(false)} style={btn("#555")}>CLOSE</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allSessions.length === 0 && <div style={{ color: "#444", textAlign: "center", padding: "2rem" }}>NO ARCHIVED MISSIONS.</div>}
              {[...allSessions].reverse().map(s => {
                const active = s.id === session?.id;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", border: `1px solid ${active ? G : "#1a4a1a"}`, padding: "10px 12px", background: active ? "rgba(51,255,51,0.05)" : "transparent", gap: "10px" }}>
                    <div onClick={() => switchSession(s)} style={{ flex: 1, cursor: "pointer" }}>
                      <div style={{ color: active ? G : "#22aa22", fontSize: "0.95rem" }}>{active ? "▶ " : ""}{s.label}</div>
                      <div style={{ color: "#444", fontSize: "0.65rem", marginTop: "2px" }}>{s.id} • {new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteSession(s); }} style={{ ...btn("#ff4444"), padding: "3px 8px", fontSize: "0.7rem" }}>DEL</button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setShowLogs(false); restartSession(); }} style={{ ...btn(A), width: "100%", padding: "10px", fontSize: "0.9rem", textAlign: "center" }}>
              &#8635; START NEW TRANSMISSION
            </button>
          </div>
        </div>
      )}

      {/* RESTART CONFIRM */}
      {confirmRestart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px", fontFamily: "inherit" }}>
          <div style={{ color: A, fontSize: "1.1rem", letterSpacing: "0.08em", textAlign: "center" }}>&#9888; START NEW TRANSMISSION?</div>
          <div style={{ color: "#666", fontSize: "0.8rem", textAlign: "center", maxWidth: "280px" }}>Current session is saved in MISSION LOGS.</div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={restartSession} style={{ ...btn(G), padding: "8px 20px" }}>CONFIRM</button>
            <button onClick={() => setConfirmRestart(false)} style={{ ...btn("#555"), padding: "8px 20px" }}>ABORT</button>
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "flex-end", minHeight: "100%" }}>

          {isBooting ? (
            <div>
              {bootLines.filter(Boolean).map((line, i) => (
                <div key={i} style={{ color: line.startsWith("=") || line.startsWith("WELCOME") ? G : "#22cc22", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {line.startsWith("=") || line.startsWith("WELCOME") || line.startsWith("TYPE") ? line : `> ${line}`}
                </div>
              ))}
              <span style={{ display: "inline-block", width: "10px", height: "1em", background: G, animation: "blink 0.8s step-start infinite", verticalAlign: "middle" }} />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div style={{ color: G, opacity: 0.3, fontStyle: "italic", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
                  --- NO PRIOR TRANSMISSIONS. READY FOR FIRST CONTACT. ---
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i}
                  style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onTouchStart={() => setHovered(i === hovered ? null : i)}
                >
                  <div style={{ fontSize: "0.62rem", opacity: 0.35, marginBottom: "2px", color: G }}>
                    [{msg.role === "user" ? "OPERATOR" : "AXIOM-7"} @ {msg.timestamp}{msg.usedSearch ? " | LIVE" : ""}]
                  </div>
                  <div style={{ position: "relative", maxWidth: "90%" }}>
                    <div style={{
                      padding: "8px 12px",
                      border: `1px solid ${msg.role === "user" ? A : msg.error ? "#ff4444" : G}`,
                      color: msg.role === "user" ? A : msg.error ? "#ff4444" : G,
                      background: msg.role === "user" ? "rgba(255,176,0,0.05)" : msg.error ? "rgba(255,68,68,0.05)" : "rgba(51,255,51,0.04)",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.55,
                      fontSize: "0.95rem",
                      wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    {hovered === i && (
                      <button onClick={() => deleteMessage(msg._id, i)}
                        style={{ position: "absolute", top: "-10px", right: "-10px", background: BG, border: "1px solid #ff4444", color: "#ff4444", width: "22px", height: "22px", fontSize: "0.6rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", zIndex: 10 }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5, fontSize: "0.85rem", color: G, fontStyle: "italic" }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span>
                  {status || "PROCESSING..."}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* INPUT */}
      {!isBooting && (
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid rgba(51,255,51,0.25)", paddingTop: "8px", marginTop: "6px", flexShrink: 0 }}>
          <span style={{ color: G, fontSize: "1rem", animation: "blink 0.8s step-start infinite", flexShrink: 0 }}>&#62;_</span>
          <input
            id="terminal-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(e); }}
            placeholder="ENTER QUERY..."
            disabled={isTyping}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: G, fontFamily: "inherit", fontSize: "1rem", caretColor: G, minWidth: 0 }}
          />
          <button type="submit" disabled={isTyping || !input.trim()} style={{ ...btn(G), opacity: isTyping || !input.trim() ? 0.3 : 1, flexShrink: 0 }}>
            SEND
          </button>
        </form>
      )}

      <style jsx global>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
