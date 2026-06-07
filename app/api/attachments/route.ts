import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import Attachment from "@/models/attachment.model";
import Task from "@/models/task.model";

// GET /api/attachments?taskId=xxx — Get all attachments for a task
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

        const attachments = await Attachment.find({ taskId })
            .populate("uploadedBy", "name email image")
            .sort({ createdAt: -1 });

        return sendSuccess({ data: attachments, message: "Attachments fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch attachments", errormessage: error.message, status: 500 });
    }
}

// POST /api/attachments — Upload attachment metadata (actual file upload handled via storage service)
export async function POST(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { taskId, fileName, fileUrl } = await req.json();

        if (!taskId) return sendError({ message: "taskId is required", status: 400 });
        if (!fileName?.trim()) return sendError({ message: "fileName is required", status: 400 });
        if (!fileUrl?.trim()) return sendError({ message: "fileUrl is required", status: 400 });

        const task = await Task.findById(taskId);
        if (!task) return sendError({ message: "Task not found", status: 404 });

        const attachment = await Attachment.create({
            taskId,
            uploadedBy: session.id,
            fileName: fileName.trim(),
            fileUrl: fileUrl.trim(),
        });

        const populated = await attachment.populate("uploadedBy", "name email image");

        await logActivity({
            userId: session.id,
            action: "uploaded",
            entityType: "attachment",
            entityId: attachment._id,
            description: `File "${fileName}" attached to task "${task.title}"`,
        });

        return sendSuccess({ data: populated, message: "Attachment added successfully", status: 201 });
    } catch (error: any) {
        return sendError({ message: "Failed to add attachment", errormessage: error.message, status: 500 });
    }
}
