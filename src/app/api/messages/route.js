import connectDB from "@/lib/connectDB";
import Message from "@/models/Message";

// DELETE /api/messages?id=XXX — delete a single message by its MongoDB _id
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "No message id provided." }, { status: 400 });
    }

    await connectDB();
    const result = await Message.findByIdAndDelete(id);

    if (!result) {
      return Response.json({ error: "Message not found." }, { status: 404 });
    }

    return Response.json({ deleted: true, id });
  } catch (err) {
    console.error("Message delete error:", err);
    return Response.json({ error: "DELETE_ERROR: " + err.message }, { status: 500 });
  }
}
