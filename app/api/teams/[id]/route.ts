import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import Team from "@/models/team.model";

// GET /api/teams/:id
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyRole("admin", "project_manager");
        if (!auth.authorized) {
            return auth.response;
        }
        await connectDb();

        const team = await Team.findById(id);
        if (!team) return sendError({ message: "Team not found", status: 404 });

        return sendSuccess({ data: team, message: "Team fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch team", errormessage: error.message, status: 500 });
    }
}

// PATCH /api/teams/:id — Update team name
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyRole("admin", "project_manager");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const { name } = await req.json();

        if (!name?.trim()) {
            return sendError({ message: "Team name is required", status: 400 });
        }

        const team = await Team.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true }
        );

        if (!team) return sendError({ message: "Team not found", status: 404 });

        await logActivity({
            userId: session.id,
            action: "updated",
            entityType: "team",
            entityId: team._id,
            description: `Team renamed to "${team.name}"`,
        });

        return sendSuccess({ data: team, message: "Team updated successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to update team", errormessage: error.message, status: 500 });
    }
}

// DELETE /api/teams/:id — Admin only
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await verifyRole("admin");
        if (!auth.authorized) {
            return auth.response;
        }
        const session = auth.user!;
        await connectDb();

        const team = await Team.findByIdAndDelete(id);
        if (!team) return sendError({ message: "Team not found", status: 404 });

        await logActivity({
            userId: session.id,
            action: "deleted",
            entityType: "team",
            entityId: id,
            description: `Team "${team.name}" deleted`,
        });

        return sendSuccess({ message: "Team deleted successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to delete team", errormessage: error.message, status: 500 });
    }
}
