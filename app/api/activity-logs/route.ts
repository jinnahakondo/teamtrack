import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import ActivityLog from "@/models/activityLog.model";

// GET /api/activity-logs — Recent activity (latest 10 by default)
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        await connectDb();

        const { searchParams } = new URL(req.url);
        const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
        const entityType = searchParams.get("entityType") || "";
        const entityId = searchParams.get("entityId") || "";

        const query: Record<string, any> = {};
        if (entityType) query.entityType = entityType;
        if (entityId) query.entityId = entityId;

        const logs = await ActivityLog.find(query)
            .populate("userId", "name email image")
            .sort({ createdAt: -1 })
            .limit(limit);

        return sendSuccess({ data: logs, message: "Activity logs fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch activity logs", errormessage: error.message, status: 500 });
    }
}
