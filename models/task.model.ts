import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITask extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    priority: "high" | "medium" | "low";
    status: "todo" | "in_progress" | "completed";
    assignedTo: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Project is required"],
        },
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
        priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "completed"],
            default: "todo",
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Assignee is required"],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },
    },
    { timestamps: true }
);

// Prevent duplicate task titles within the same project
TaskSchema.index({ projectId: 1, title: 1 }, { unique: true });

const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
