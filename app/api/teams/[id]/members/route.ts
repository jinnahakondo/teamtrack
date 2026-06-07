import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import { verifyRole } from "@/lib/authMiddleware";
import { logActivity } from "@/lib/activityHelper";
import TeamMember from "@/models/teamMember.model";
import Team from "@/models/team.model";

// GET /api/teams/:id/members — List members of a team
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

        const members = await TeamMember.find({ teamId: id })
            .populate("userId", "name email role image")
            .sort({ joinedAt: -1 });

        return sendSuccess({ data: members, message: "Members fetched successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to fetch members", errormessage: error.message, status: 500 });
    }
}

// POST /api/teams/:id/members — Add a member to a team
export async function POST(
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

        const { userId } = await req.json();

        if (!userId) {
            return sendError({ message: "userId is required", status: 400 });
        }

        const team = await Team.findById(id);
        if (!team) return sendError({ message: "Team not found", status: 404 });

        // Prevent duplicate membership
        const exists = await TeamMember.findOne({ teamId: id, userId });
        if (exists) {
            return sendError({ message: "User is already a member of this team", status: 409 });
        }

        const member = await TeamMember.create({ teamId: id, userId });
        const populated = await member.populate("userId", "name email role image");

        await logActivity({
            userId: session.id,
            action: "added",
            entityType: "team",
            entityId: id,
            description: `Member added to team "${team.name}"`,
        });

        return sendSuccess({ data: populated, message: "Member added successfully", status: 201 });
    } catch (error: any) {
        return sendError({ message: "Failed to add member", errormessage: error.message, status: 500 });
    }
}

// DELETE /api/teams/:id/members — Remove a member from a team
export async function DELETE(
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

        const { userId } = await req.json();
        if (!userId) return sendError({ message: "userId is required", status: 400 });

        const team = await Team.findById(id);
        if (!team) return sendError({ message: "Team not found", status: 404 });

        const removed = await TeamMember.findOneAndDelete({ teamId: id, userId });
        if (!removed) return sendError({ message: "Member not found", status: 404 });

        await logActivity({
            userId: session.id,
            action: "removed",
            entityType: "team",
            entityId: id,
            description: `Member removed from team "${team.name}"`,
        });

        return sendSuccess({ message: "Member removed successfully", status: 200 });
    } catch (error: any) {
        return sendError({ message: "Failed to remove member", errormessage: error.message, status: 500 });
    }
}
