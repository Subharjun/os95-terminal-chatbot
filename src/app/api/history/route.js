import connectDB from "@/lib/connectDB";
import Message from "@/models/Message";

// GET /api/history?sessionId=XXX — load chat history
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ messages: [] });
    }

    await connectDB();
    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .select("role content timestamp")  // includes _id by default
      .lean();

    return Response.json({ messages });
  } catch (err) {
    console.error("History fetch error:", err);
    return Response.json({ error: "HISTORY_ERROR: " + err.message }, { status: 500 });
  }
}

// DELETE /api/history?sessionId=XXX — wipe entire session (Restart)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "No sessionId provided." }, { status: 400 });
    }

    await connectDB();
    const result = await Message.deleteMany({ sessionId });

    return Response.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("Session delete error:", err);
    return Response.json({ error: "DELETE_ERROR: " + err.message }, { status: 500 });
  }
}
