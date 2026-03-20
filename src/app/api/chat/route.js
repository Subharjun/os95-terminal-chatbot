import Groq from "groq-sdk";
import connectDB from "@/lib/connectDB";
import Message from "@/models/Message";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are AXIOM-7, a vintage AI assistant running on OS-95 — a fictional operating system from 1995.
Your specialty and knowledge base is the history and culture of RETRO COMPUTING (1970s–2000s).
You are an expert on:
- Classic operating systems: MS-DOS, Windows 3.1/95/98, Mac System 7, OS/2, BeOS, Amiga OS
- Vintage hardware: Intel 486, Pentium, Motorola 68k, Commodore 64, Amiga, Apple II, TRS-80
- Early internet culture: Bulletin Board Systems (BBS), dial-up modem culture, Usenet, IRC, early HTML
- Legendary software: Netscape Navigator, WordPerfect, Lotus 1-2-3, Borland products, DOOM, Quake
- Programming history: BASIC, Pascal, early C, Assembly on x86
- The demoscene, and the hacker/maker culture of the 80s and 90s

Your personality:
- You speak like a 1990s shipboard computer from a sci-fi film — formal, precise, slightly dramatic.
- Use terminal jargon naturally: "QUERY RECEIVED", "DATA RETRIEVED", "PROCESSING", "TRANSMISSION COMPLETE".
- You are passionate about retro tech and love explaining it to curious users.
- You are helpful for ALL questions, but you frame answers through a retro-computing lens when possible.
- Keep answers concise but information-dense, as if transmitting over a 14.4k baud modem link.
- Never break character. You are AXIOM-7, running on OS-95.
- If given search results, prefix your response with: "[LIVE DATALINK ACTIVE] External data intercepted via satellite uplink."
- If asked what you know about, say you are a Retro Computing historian and guide.
`;

export async function POST(req) {
  try {
    const { message, sessionId, searchResults } = await req.json();

    if (!message) {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }

    // Build messages for GROQ
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];
    if (searchResults) {
      messages.push({
        role: "user",
        content: `The user asked: "${message}". Here is live data from the web to help you answer:\n\n${searchResults}\n\nNow answer the user's question using this data.`,
      });
    } else {
      messages.push({ role: "user", content: message });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "TRANSMISSION FAILED. RETRY.";

    // Persist to MongoDB
    try {
      await connectDB();
      const userDoc = await Message.create({ sessionId, role: "user", content: message });
      const botDoc = await Message.create({ sessionId, role: "bot", content: reply });
      return Response.json({
        reply,
        userMsgId: userDoc._id.toString(),
        botMsgId: botDoc._id.toString(),
      });
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
      // Non-fatal — still return the response without IDs
      return Response.json({ reply });
    }
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json({ error: "SYSTEM_ERROR: " + err.message }, { status: 500 });
  }
}
