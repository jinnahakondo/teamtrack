import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import User from "@/models/user.model";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        await connectDb();

        const newUser = await User.create(payload);

        return sendSuccess({
            data: newUser,
            message: "User registered successfully",
            status: 201
        });



    } catch (error: any) {
        return sendError({
            message: "Failed to register user",
            errormessage: error.message,
            status: 500
        })
    }
}