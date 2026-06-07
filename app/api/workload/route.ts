import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Task from "@/models/task.model";

// GET /api/workload?teamId=xxx — Member workload summary
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager");
        if (!auth.authorized) {
            return auth.response;
        }
        await connectDb();

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId") || "";

        const matchStage: Record<string, any> = {};
        if (projectId) matchStage.projectId = { $eq: projectId };

        const workload = await Task.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$assignedTo",
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                    },
                    pendingTasks: {
                        $sum: { $cond: [{ $ne: ["$status", "completed"] }, 1, 0] },
                    },
                    highPriority: {
                        $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "member",
                },
            },
            { $unwind: "$member" },
            {
                $project: {
                    _id: 0,
                    memberId: "$_id",
                    name: "$member.name",
                    email: "$member.email",
                    image: "$member.image",
                    totalTasks: 1,
                    completedTasks: 1,
                    pendingTasks: 1,
                    highPriority: 1,
                },
            },
            { $sort: { totalTasks: -1 } },
        ]);

        return sendSuccess({ data: workload, message: "Workload summary fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch workload", errormessage: error.message, status: 500 });
    }
}
