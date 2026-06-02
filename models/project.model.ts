import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    deadline: Date;
    status: "active" | "completed" | "on_hold";
    teamId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        deadline: {
            type: Date,
            required: [true, "Deadline is required"],
        },
        status: {
            type: String,
            enum: ["active", "completed", "on_hold"],
            default: "active",
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team is required"],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },
    },
    { timestamps: true }
);

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
