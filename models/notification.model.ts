import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    type: "task_assigned" | "task_updated" | "task_completed" | "comment_added" | "deadline_reminder";
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: [true, "Task is required"],
        },
        type: {
            type: String,
            enum: [
                "task_assigned",
                "task_updated",
                "task_completed",
                "comment_added",
                "deadline_reminder",
            ],
            required: [true, "Notification type is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for fast unread notification queries per user
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
