import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Attachment from "@/models/attachment.model";

// DELETE /api/attachments/:id — Owner or admin
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

        const attachment = await Attachment.findById(id);
        if (!attachment) return sendError({ message: "Attachment not found", status: 404 });

        if (
            attachment.uploadedBy.toString() !== session.id &&
            session.role !== "admin"
        ) {
            return sendError({ message: "Access denied", status: 403 });
        }

        await attachment.deleteOne();

        return sendSuccess({ message: "Attachment deleted successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to delete attachment", errormessage: error.message, status: 500 });
    }
}
