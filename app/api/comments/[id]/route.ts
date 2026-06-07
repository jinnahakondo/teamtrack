import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Comment from "@/models/comment.model";

// DELETE /api/comments/:id — Owner or admin
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const comment = await Comment.findById(id);
        if (!comment) return sendError({ message: "Comment not found", status: 404 });

        // Only the author or admin can delete
        if (comment.userId.toString() !== session.id && session.role !== "admin") {
            return sendError({ message: "Access denied", status: 403 });
        }

        await comment.deleteOne();

        return sendSuccess({ message: "Comment deleted successfully", status: 200 });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED")
            return sendError({ message: "Unauthorized", status: 401 });

        return sendError({ message: "Failed to delete comment", errormessage: error.message, status: 500 });
    }
}
