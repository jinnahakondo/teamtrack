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
const priorityWeight = { high: 3, medium: 2, low: 1 } as const;

// GET a single task by ID - accessible to assigned team members, project managers, and admins
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError({ message: "Invalid task ID", status: 400 });
        }

        const task = await Task.findById(id)
            .populate("assignedTo", "name email image")
            .populate("createdBy", "name email")
            .populate("projectId", "name deadline");

        if (!task) return sendError({ message: "Task not found", status: 404 });

        // Team members can only view their own tasks
        if (
            session.role === "team_member" &&
            task.assignedTo._id.toString() !== session.id
        ) {
            return sendError({ message: "Access denied", status: 403 });
        }

        return sendSuccess({ data: task, message: "Task fetched successfully", status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "UNAUTHORIZED")
            return sendError({ message: "Unauthorized", status: 401 });

        const err = error instanceof Error ? error.message : "Unknown error";
        return sendError({ message: "Failed to fetch task", errormessage: err, status: 500 });
    }
}

// PATCH /api/tasks/:id — Update task (team members can only update status)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const body = await req.json();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError({ message: "Invalid task ID", status: 400 });
        }

        const task = await Task.findById(id);
        if (!task) return sendError({ message: "Task not found", status: 404 });

        // Team members can only update their own task's status
        if (session.role === "team_member") {
            if (task.assignedTo.toString() !== session.id) {
                return sendError({ message: "You can only update your own tasks", status: 403 });
            }
            if (!body.status) {
                return sendError({ message: "Team members can only update task status", status: 403 });
            }
        }

        const { title, description, dueDate, priority, status, assignedTo } = body;

        // Prevent assigning a completed task
        if (assignedTo && task.status === "completed") {
            return sendError({ message: "Completed tasks cannot be reassigned", status: 400 });
        }

        let parsedDueDate;
        if (dueDate) {
            parsedDueDate = new Date(dueDate);
            if (Number.isNaN(parsedDueDate.getTime())) {
                return sendError({ message: "Invalid due date", status: 400 });
            }
            if (parsedDueDate < new Date()) {
                return sendError({ message: "Please select a valid deadline", status: 400 });
            }
        }

        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return sendError({ message: "Invalid assignee ID", status: 400 });
        }

        // Prevent duplicate title within same project (if title is being changed)
        if (title && title.trim().toLowerCase() !== task.title.toLowerCase()) {
            const duplicate = await Task.findOne({
                projectId: task.projectId,
                title: {
                    $regex: `^${title.trim()}$`,
                    $options: "i",
                },
                _id: { $ne: id },
            });
            if (duplicate) {
                return sendError({ message: "This task already exists in the project", status: 409 });
            }
        }

        if (assignedTo && String(assignedTo) !== String(task.assignedTo)) {
            const project = await Project.findById(task.projectId);
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
        }

        const validStatuses = ["todo", "in_progress", "completed"];
        if (status && !validStatuses.includes(status)) {
            return sendError({ message: "Invalid task status", status: 400 });
        }

        const updates: Record<string, unknown> = {};
        if (title) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (dueDate) updates.dueDate = parsedDueDate;
        if (priority) {
            updates.priority = priority;
            const priorityKey = priority as keyof typeof priorityWeight;
            if (priorityKey in priorityWeight) {
                updates.priorityOrder = priorityWeight[priorityKey];
            }
        }
        if (status) updates.status = status;
        if (assignedTo) updates.assignedTo = assignedTo;

        const updated = await Task.findByIdAndUpdate(id, updates, { new: true })
            .populate("assignedTo", "name email image")
            .populate("createdBy", "name email")
            .populate("projectId", "name");

        // Notify assignee on reassignment
        if (assignedTo && assignedTo !== task.assignedTo.toString()) {
            await Notification.create({
                userId: assignedTo,
                taskId: task._id,
                type: "task_assigned",
                message: `You have been assigned task: "${task.title}"`,
            });
        }

        // Notify assignee on status change
        if (status && status !== task.status) {
            await Notification.create({
                userId: task.assignedTo,
                taskId: task._id,
                type: "task_updated",
                message: `Task "${task.title}" status changed to ${status}`,
            });
        }

        await logActivity({
            userId: session.id,
            action: "updated",
            entityType: "task",
            entityId: id,
            description: status
                ? `Task "${updated?.title}" marked as ${status}`
                : `Task "${updated?.title}" updated`,
        });

        return sendSuccess({ data: updated, message: "Task updated successfully", status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "UNAUTHORIZED")
            return sendError({ message: "Unauthorized", status: 401 });

        const err = error instanceof Error ? error.message : "Unknown error";
        return sendError({ message: "Failed to update task", errormessage: err, status: 500 });
    }
}

//  Admin or Project Manager
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyRole("admin", "project_manager");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { id } = await params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) return sendError({ message: "Task not found", status: 404 });

        await logActivity({
            userId: session.id,
            action: "deleted",
            entityType: "task",
            entityId: id,
            description: `Task "${task.title}" deleted`,
        });

        return sendSuccess({ message: "Task deleted successfully", status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "UNAUTHORIZED")
            return sendError({ message: "Unauthorized", status: 401 });
        if (error instanceof Error && error.message === "FORBIDDEN")
            return sendError({ message: "Access denied", status: 403 });

        const err = error instanceof Error ? error.message : "Unknown error";
        return sendError({ message: "Failed to delete task", errormessage: err, status: 500 });
    }
}
