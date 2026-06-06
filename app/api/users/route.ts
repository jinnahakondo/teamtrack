import { verifyRole } from "@/lib/authMiddleware";
import { connectDb } from "@/lib/db/dbConnection";
import { sendSuccess, sendError } from "@/lib/helperFunction";
import User from "@/models/user.model";

export async function GET(request: Request) {
    try {
        const auth = await verifyRole("admin");
        if (!auth.authorized) {
            return auth.response
        }

        await connectDb();

        const users = await User.find()

        if (!users) {
            return sendError({
                message: "No users found",
                status: 404
            })
        }

        return sendSuccess({
            data: users,
            message: "Users fetched successfully",
            status: 200
        })

    } catch (error: any) {
        return sendError({
            message: "Failed to fetch users",
            errormessage: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
            status: 500
        })
    }
}