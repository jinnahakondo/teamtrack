import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import Project from "@/models/project.model";
import Task from "@/models/task.model";
import ActivityLog from "@/models/activityLog.model";

// GET /api/dashboard — KPI cards + analytics data
export async function GET() {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const now = new Date();

        // Scoped queries for team members
        const taskQuery: Record<string, any> =
            session.role === "team_member" ? { assignedTo: session.id } : {};

        const [
            totalProjects,
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            tasksByPriority,
            tasksByStatus,
            recentActivities,
            upcomingDeadlines,
            highPriorityTasks,
        ] = await Promise.all([
            // KPI counts
            Project.countDocuments(),
            Task.countDocuments(taskQuery),
            Task.countDocuments({ ...taskQuery, status: "completed" }),
            Task.countDocuments({ ...taskQuery, status: { $ne: "completed" } }),
            Task.countDocuments({
                ...taskQuery,
                status: { $ne: "completed" },
                dueDate: { $lt: now },
            }),

            // Tasks grouped by priority
            Task.aggregate([
                { $match: taskQuery },
                { $group: { _id: "$priority", count: { $sum: 1 } } },
            ]),

            // Tasks grouped by status
            Task.aggregate([
                { $match: taskQuery },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // Recent activity log (latest 10)
            ActivityLog.find()
                .populate("userId", "name image")
                .sort({ createdAt: -1 })
                .limit(10),

            // Upcoming deadlines within 7 days
            Task.find({
                ...taskQuery,
                status: { $ne: "completed" },
                dueDate: {
                    $gte: now,
                    $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
            })
                .populate("assignedTo", "name")
                .populate("projectId", "name")
                .sort({ dueDate: 1 })
                .limit(5),

            // High priority pending tasks
            Task.find({ ...taskQuery, priority: "high", status: { $ne: "completed" } })
                .populate("assignedTo", "name")
                .populate("projectId", "name")
                .sort({ dueDate: 1 })
                .limit(5),
        ]);

        // Project progress summary
        const projectSummaries = await Project.aggregate([
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "projectId",
                    as: "tasks",
                },
            },
            {
                $project: {
                    name: 1,
                    deadline: 1,
                    status: 1,
                    totalTasks: { $size: "$tasks" },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: "$tasks",
                                as: "t",
                                cond: { $eq: ["$$t.status", "completed"] },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    progress: {
                        $cond: [
                            { $eq: ["$totalTasks", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$completedTasks", "$totalTasks"] },
                                    100,
                                ],
                            },
                        ],
                    },
                    pendingTasks: { $subtract: ["$totalTasks", "$completedTasks"] },
                },
            },
            { $sort: { deadline: 1 } },
            { $limit: 10 },
        ]);

        return sendSuccess({
            data: {
                kpi: {
                    totalProjects,
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    overdueTasks,
                },
                charts: {
                    tasksByPriority,
                    tasksByStatus,
                },
                projectSummaries,
                recentActivities,
                upcomingDeadlines,
                highPriorityTasks,
            },
            message: "Dashboard data fetched successfully",
            status: 200,
        });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED")
            return sendError({ message: "Unauthorized", status: 401 });

        return sendError({ message: "Failed to fetch dashboard data", errormessage: error.message, status: 500 });
    }
}
