import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import Comment from "@/models/comment.model";
import Task from "@/models/task.model";
import Notification from "@/models/notification.model";

// GET /api/comments?taskId=xxx — Get all comments for a task
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        await connectDb();

        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get("taskId");

        if (!taskId) return sendError({ message: "taskId is required", status: 400 });

        const comments = await Comment.find({ taskId })
            .populate("userId", "name email image")
            .sort({ createdAt: -1 });

        return sendSuccess({ data: comments, message: "Comments fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch comments", errormessage: error.message, status: 500 });
    }
}

// POST /api/comments — Add a comment to a task
export async function POST(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { taskId, content } = await req.json();

        if (!taskId) return sendError({ message: "taskId is required", status: 400 });
        if (!content?.trim()) return sendError({ message: "Comment content is required", status: 400 });

        const task = await Task.findById(taskId);
        if (!task) return sendError({ message: "Task not found", status: 404 });

        const comment = await Comment.create({
            taskId,
            userId: session.id,
            content: content.trim(),
        });

        const populated = await comment.populate("userId", "name email image");

        // Notify task assignee (if commenter is not the assignee)
        if (task.assignedTo.toString() !== session.id) {
            await Notification.create({
                userId: task.assignedTo,
                taskId: task._id,
                type: "comment_added",
                message: `New comment on task "${task.title}"`,
            });
        }

        await logActivity({
            userId: session.id,
            action: "commented",
            entityType: "comment",
            entityId: comment._id,
            description: `Comment added to task "${task.title}"`,
        });

        return sendSuccess({ data: populated, message: "Comment added successfully", status: 201 });
    } catch (error: any) {
        return sendError({ message: "Failed to add comment", errormessage: error.message, status: 500 });
    }
}
