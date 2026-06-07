import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";

import { logActivity } from "@/lib/activityHelper";
import Team from "@/models/team.model";
import { verifyRole } from "@/lib/authMiddleware";

// Fetch all teams
export async function GET() {
    try {
        const auth = await verifyRole("admin", "project_manager");

        if (!auth.authorized) {
            return auth.response;
        }

        await connectDb();

        const teams = await Team.find().sort({ createdAt: -1 });

        return sendSuccess({ data: teams, message: "Teams fetched successfully", status: 200 });

    } catch (error: any) {

        return sendError({ message: "Failed to fetch teams", errormessage: error.message, status: 500 });
    }
}

//  Create a team (admin or project manager)
export async function POST(req: Request) {
    try {
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

        const team = await Team.create({ name: name.trim() });

        await logActivity({
            userId: session.id,
            action: "created",
            entityType: "team",
            entityId: team._id,
            description: `Team "${team.name}" created`,
        });

        return sendSuccess({ data: team, message: "Team created successfully", status: 201 });
    } catch (error: any) {
        
        return sendError({ message: "Failed to create team", errormessage: error.message, status: 500 });
    }
}
