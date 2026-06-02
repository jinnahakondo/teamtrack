import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    provider: "credentials" | "google"
    email: string;
    password: string;
    displayName: string;
    role: "admin" | "project_manager" | "team_member";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        provider: {
            type: String,
            enum: ["credentials", "google"],
            default: "credentials",
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },
        displayName: {
            type: String,
            required: [true, "Display name is required"],
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "project_manager", "team_member"],
            default: "team_member",
        },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
