import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";

import { logActivity } from "@/lib/activityHelper";
import Project from "@/models/project.model";
import { verifyRole } from "@/lib/authMiddleware";

// All users can view projects
export async function GET(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager", "team_member");

        if (!auth.authorized) {
            return auth.response;
        }

        await connectDb();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const status = searchParams.get("status") || "";

        const sortBy = searchParams.get("sortBy") || "createdAt";

        const order = searchParams.get("order") === "asc" ? 1 : -1;

        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

        const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));

        const skip = (page - 1) * limit;

        const query: Record<string, any> = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (status) {
            query.status = status;
        }

        const [projects, total] = await Promise.all([
            Project.find(query)
                .populate("teamId", "name")
                .populate("createdBy", "name email")
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),
            Project.countDocuments(query),
        ]);

        return sendSuccess({
            data: {
                projects,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            message: "Projects fetched successfully",
            status: 200,
        });

    } catch (error: any) {

        return sendError({ message: "Failed to fetch projects", errormessage: error.message, status: 500 });
    }
}

// Admin or Project Manager
export async function POST(req: Request) {
    try {
        const auth = await verifyRole("admin", "project_manager");

        if (!auth.authorized) {
            return auth.response;
        }

        const userId = auth?.user!.id;

        await connectDb();

        const { name, description, deadline, teamId } = await req.json();

        if (!name?.trim()) return sendError({
            message: "Project name is required", status: 400
        });

        if (!deadline) return sendError({
            message: "Deadline is required", status: 400
        });

        if (!teamId) return sendError({
            message: "Team is required",
            status: 400
        });

        if (new Date(deadline) < new Date()) {
            return sendError({
                message: "Please select a valid deadline",
                status: 400
            });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description?.trim() || "",
            deadline,
            teamId,
            createdBy: userId,
        });

        await logActivity({
            userId,
            action: "created",
            entityType: "project",
            entityId: project._id,
            description: `Project "${project.name}" created`,
        });

        return sendSuccess({
            data: project,
            message: "Project created successfully",
            status: 201
        });

    } catch (error: any) {

        return sendError({ message: "Failed to create project", errormessage: error.message, status: 500 });
    }
}
