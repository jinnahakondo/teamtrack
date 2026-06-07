import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type SessionUser = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "project_manager" | "team_member";
};

export const verifyRole = async (...roles: SessionUser["role"][]) => {
    const session = await getServerSession(authOptions);

    // 1. if user is not logged in (401 Unauthorized)
    if (!session?.user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
        };
    }

    const user = session.user as SessionUser;

    // 2. if user does not have the required role (403 Forbidden)
    if (!roles.includes(user.role)) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "You do not have permission to access this resource" }, { status: 403 }),
        };
    }

    // 3. if user is authorized, return the user object
    return { authorized: true, user };
};