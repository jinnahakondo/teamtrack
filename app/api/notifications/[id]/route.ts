import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Notification from "@/models/notification.model";

// PATCH /api/notifications/:id — Mark single notification as read
export async function PATCH(
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

        const notification = await Notification.findOne({
            _id: id,
            userId: session.id,
        });

        if (!notification) return sendError({ message: "Notification not found", status: 404 });

        notification.isRead = true;
        await notification.save();

        return sendSuccess({ data: notification, message: "Notification marked as read", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to update notification", errormessage: error.message, status: 500 });
    }
}
