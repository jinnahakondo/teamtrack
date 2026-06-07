import mongoose from "mongoose";
import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import Project from "@/models/project.model";
import Task from "@/models/task.model";
import TeamMember from "@/models/teamMember.model";
import User from "@/models/user.model";
import Notification from "@/models/notification.model";

// Filter by project, status, priority, assignee, etc.
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");

        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;

        await connectDb();

        const { searchParams } = new URL(req.url);

        const projectId = searchParams.get("projectId") || "";

        const status = searchParams.get("status") || "";

        const priority = searchParams.get("priority") || "";

        const assignedTo = searchParams.get("assignedTo") || "";

        const search = searchParams.get("search") || "";

        const deadlineStatus = searchParams.get("deadlineStatus") || ""; // upcoming | overdue

        const sortBy = searchParams.get("sortBy") || "createdAt";

        const order = searchParams.get("order") === "asc" ? 1 : -1;

        const page = Math.max(1, Number(searchParams.get("page")) || 1);

        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));

        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        // Team members only see their own tasks
        if (session.role === "team_member") query.assignedTo = session.id;

        if (projectId) {
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return sendError({ message: "Invalid project ID", status: 400 });
            }
            query.projectId = projectId;
        }

        if (status) query.status = status;

        if (priority) query.priority = priority;

        if (assignedTo) {
            if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
                return sendError({ message: "Invalid assignee ID", status: 400 });
            }
            if (session.role !== "team_member") query.assignedTo = assignedTo;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (deadlineStatus === "overdue") {
            query.dueDate = { $lt: new Date() };
            if (!status) {
                query.status = { $ne: "completed" };
            }
        } else if (deadlineStatus === "upcoming") {
            const threeDaysLater = new Date();
            threeDaysLater.setDate(threeDaysLater.getDate() + 3);
            query.dueDate = {
                $gte: new Date(),
                $lte: threeDaysLater,
            };
        }

        const sortMap: Record<string, string> = {
            priority: "priorityOrder",
            deadline: "dueDate",
            updated: "updatedAt",
            created: "createdAt",
        };
        const resolvedSort = sortMap[sortBy] ?? "createdAt";

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .lean()
                .populate("assignedTo", "name email image")
                .populate("createdBy", "name email")
                .populate("projectId", "name")
                .sort({ [resolvedSort]: order })
                .skip(skip)
                .limit(limit),
            Task.countDocuments(query),
        ]);

        return sendSuccess({
            data: { tasks, total, page, limit, totalPages: Math.ceil(total / limit) },
            message: "Tasks fetched successfully",
            status: 200,
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error.message : "Unknown error";
        return sendError({ message: "Failed to fetch tasks", errormessage: err, status: 500 });
    }
}

//  Admin or Project Manager
export async function POST(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager");

        if (!auth.authorized) {
            return auth.response;
        }

        const session = auth.user!;

        await connectDb();

        const {
            projectId,
            title,
            description,
            dueDate,
            priority,
            assignedTo } = await req.json();

        // Required field checks
        if (!projectId) return sendError({
            message: "Project is required",
            status: 400
        });

        if (!title?.trim()) return sendError({
            message: "Task title is required",
            status: 400
        });

        if (!dueDate) return sendError({
            message: "Due date is required",
            status: 400
        });

        if (!assignedTo) return sendError({
            message: "Assignee is required",
            status: 400
        });

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return sendError({ message: "Invalid project ID", status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            return sendError({ message: "Invalid assignee ID", status: 400 });
        }

        const parsedDueDate = new Date(dueDate);
        if (Number.isNaN(parsedDueDate.getTime())) {
            return sendError({ message: "Invalid due date", status: 400 });
        }

        if (parsedDueDate < new Date()) {
            return sendError({
                message: "Please select a valid deadline",
                status: 400
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendError({ message: "Project not found", status: 404 });
        }

        const user = await User.findById(assignedTo);
        if (!user) {
            return sendError({ message: "Assigned member not found", status: 404 });
        }

        const teamMember = await TeamMember.findOne({
            teamId: project.teamId,
            userId: assignedTo,
        });

        if (!teamMember) {
            return sendError({ message: "User is not part of this project", status: 400 });
        }

        const normalizedTitle = title.trim();
        const duplicate = await Task.findOne({
            projectId,
            title: {
                $regex: `^${normalizedTitle}$`,
                $options: "i",
            },
        });

        if (duplicate) {
            return sendError({
                message: "This task already exists in the project",
                status: 409,
            });
        }

        const task = await Task.create({
            projectId,
            title: normalizedTitle,
            description: description?.trim() || "",
            dueDate: parsedDueDate,
            priority: priority || "medium",
            priorityOrder: priority ? ({ high: 3, medium: 2, low: 1 } as Record<string, number>)[priority] : 2,
            assignedTo,
            createdBy: session.id,
        });

        const populated = await task.populate([
            { path: "assignedTo", select: "name email image" },
            { path: "createdBy", select: "name email" },
            { path: "projectId", select: "name" },
        ]);

        // Notify assigned member
        await Notification.create({
            userId: assignedTo,
            taskId: task._id,
            type: "task_assigned",
            message: `You have been assigned a new task: "${task.title}"`,
        });

        await logActivity({
            userId: session.id,
            action: "created",
            entityType: "task",
            entityId: task._id,
            description: `Task "${task.title}" assigned to member`,
        });

        return sendSuccess({
            data: populated,
            message: "Task created successfully",
            status: 201
        });

    } catch (error: unknown) {
        const err = error instanceof Error ? error.message : "Unknown error";
        return sendError({ message: "Failed to create task", errormessage: err, status: 500 });
    }
}
