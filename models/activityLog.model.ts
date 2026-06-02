import mongoose, { Document, Model, Schema } from "mongoose";

export interface IActivityLog extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: "project" | "task" | "team" | "comment" | "attachment" | "user";
    entityId: mongoose.Types.ObjectId;
    description: string;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        action: {
            type: String,
            required: [true, "Action is required"],
            trim: true,
            // e.g. "created", "updated", "deleted", "assigned", "completed"
        },
        entityType: {
            type: String,
            enum: ["project", "task", "team", "comment", "attachment", "user"],
            required: [true, "Entity type is required"],
        },
        entityId: {
            type: Schema.Types.ObjectId,
            required: [true, "Entity ID is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            // e.g. 'Task "Setup API" assigned to John'
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const ActivityLog: Model<IActivityLog> =
    mongoose.models.ActivityLog ||
    mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
