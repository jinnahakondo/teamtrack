import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import Project from "@/models/project.model";

// GET a single project by ID - accessible to all authenticated users
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");

        if (!auth.authorized) {
            return auth.response;
        }

        const { id } = await params;

        await connectDb();

        const project = await Project.findById(id)
            .populate("teamId", "name")
            .populate("createdBy", "name email");

        if (!project) return sendError({
            message: "Project not found",
            status: 404
        });

        return sendSuccess({
            data: project,
            message: "Project fetched successfully",
            status: 200
        });

    } catch (error: any) {

        return sendError({ message: "Failed to fetch project", errormessage: error.message, status: 500 });
    }
}

// only Admin or Project Manager can access this route
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const auth = await verifyRole("admin", "project_manager");

        if (!auth.authorized) {
            return auth.response;
        }

        const { id } = await params;

        const userId = auth?.user!.id;

        await connectDb();

        const body = await req.json();

        const {
            name,
            description,
            deadline,
            status
        } = body;

        const project = await Project.findById(id);

        if (!project) return sendError({
            message: "Project not found",
            status: 404
        });

        if (deadline && new Date(deadline) < new Date()) {
            return sendError({
                message: "Please select a valid deadline",
                status: 400
            });
        }

        const validStatuses = ["active", "completed", "on_hold"];

        if (status && !validStatuses.includes(status)) {
            return sendError({
                message: "Invalid project status",
                status: 400
            });
        }

        const updates: Record<string, any> = {};

        if (name) updates.name = name.trim();

        if (description) {
            updates.description = description.trim();
        }

        if (deadline) updates.deadline = deadline;
        if (status) updates.status = status;

        const updated = await Project.findByIdAndUpdate(id, updates, { new: true })
            .populate("teamId", "name")
            .populate("createdBy", "name email");

        await logActivity({
            userId,
            action: "updated",
            entityType: "project",
            entityId: id,
            description: `Project "${updated?.name}" updated`,
        });

        return sendSuccess({
            data: updated,
            message: "Project updated successfully",
            status: 200
        });

    } catch (error: any) {

        return sendError({ message: "Failed to update project", errormessage: error.message, status: 500 });
    }
}

// Admin only can delete a project
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyRole("admin");

        if (!auth.authorized) {
            return auth.response;
        }

        const { id } = await params;

        const userId = auth?.user!.id;

        await connectDb();

        const project = await Project.findByIdAndDelete(id);
        if (!project) return sendError({ message: "Project not found", status: 404 });

        await logActivity({
            userId,
            action: "deleted",
            entityType: "project",
            entityId: id,
            description: `Project "${project.name}" deleted`,
        });

        return sendSuccess({
            message: "Project deleted successfully",
            status: 200
        });

    } catch (error: any) {

        return sendError({ message: "Failed to delete project", errormessage: error.message, status: 500 });
    }
}
