import { verifyRole } from "@/lib/authMiddleware";
import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import User from "@/models/user.model";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const update = await request.json();

        const auth = await verifyRole("admin");
        if (!auth.authorized) {
            return auth.response
        }

        await connectDb()

        const updatedUser = await User.findByIdAndUpdate(id, update)
        console.log(updatedUser);
        if (!updatedUser) {
            sendError(
                {
                    message: "User not found",
                    status: 404
                }
            )
        }
        
        return sendSuccess({
            message: "User updated successfully",
            status: 200
        })
    } catch (error: any) {
        return sendError({
            message: "Failed to update user",
            errormessage: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
            status: 500
        })
    }
}