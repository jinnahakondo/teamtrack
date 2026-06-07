import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Notification from "@/models/notification.model";

// GET /api/notifications — Get current user's notifications
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get("unread") === "true";

        const query: Record<string, any> = { userId: session.id };
        if (unreadOnly) query.isRead = false;

        const notifications = await Notification.find(query)
            .populate("taskId", "title")
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            userId: session.id,
            isRead: false,
        });

        return sendSuccess({
            data: { notifications, unreadCount },
            message: "Notifications fetched successfully",
            status: 200,
        });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch notifications", errormessage: error.message, status: 500 });
    }
}

// PATCH /api/notifications — Mark all as read
export async function PATCH() {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        await Notification.updateMany(
            { userId: session.id, isRead: false },
            { isRead: true }
        );

        return sendSuccess({ message: "All notifications marked as read", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to update notifications", errormessage: error.message, status: 500 });
    }
}
