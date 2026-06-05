import mongoose from "mongoose";
import { connectDb } from "@/lib/db/dbConnection";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        await connectDb()
        const stateId = mongoose.connection.readyState;

        const states: { [key: number]: string } = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting',
        };

        return NextResponse.json({
            status: stateId === 1 ? 'healthy' : 'unhealthy',
            database: states[stateId] || 'Unknown',
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}