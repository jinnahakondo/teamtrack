import { connectDb } from "@/lib/db/dbConnection";
import User from "@/models/user.model";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        await connectDb();

        const newUser = await User.create(payload);

        return new Response(JSON.stringify({ message: "User registered successfully", newUser }), {
            status: 201,
        });



    } catch (error) {
        return new Response(JSON.stringify({ message: "registration failed", error }), {
            status: 500,

        });
    }
}