import ActivityLog from "@/models/activityLog.model";
import mongoose from "mongoose";

type EntityType =
    | "project"
    | "task"
    | "team"
    | "comment"
    | "attachment"
    | "user";

export const logActivity = async ({
    userId,
    action,
    entityType,
    entityId,
    description,
}: {
    userId: string | mongoose.Types.ObjectId;
    action: string;
    entityType: EntityType;
    entityId: string | mongoose.Types.ObjectId;
    description: string;
}) => {
    try {
        await ActivityLog.create({ userId, action, entityType, entityId, description });
    } catch {
        // Non-blocking — logging failure should never break main flow
        console.error("Activity log failed:", description);
    }
};
