import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = {
        conn: null,
        promise: null,
    };
}

export const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "teamtrack",
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;

    return cached.conn;
};