import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    image: string;
    role: "admin" | "project_manager" | "team_member";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
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
        image: {
            type: String,
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

// hash password before save
UserSchema.pre("save", async function () {
    // only hash if password modified
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10);
});

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
