import { connectDb } from "@/lib/db/dbConnection";
import { sendError, sendSuccess } from "@/lib/helperFunction";
import User from "@/models/user.model";

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // 1. Validation
        if (!name || !email || !password) {
            return sendError({
                message: "Name, email, and password are required",
                status: 400
            });
        }

        if (password.length < 6) {
            return sendError({
                message: "Password must be at least 6 characters long",
                status: 400
            });
        }

        await connectDb();

        // 2. Check duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError({
                message: "Email is already registered",
                status: 400
            });
        }

        // 3. Create user (schema pre-save hook will hash password)
        const newUser = await User.create({
            name,
            email,
            password,
            role: role || "team_member"
        });

        // 4. Sanitize and return
        const { password: _, ...userObj } = newUser.toObject();

        return sendSuccess({
            data: userObj,
            message: "User registered successfully",
            status: 201
        });
    } catch (error: any) {
        return sendError({
            message: "Failed to register user",
            errormessage: error.message,
            status: 500
        });
    }
}