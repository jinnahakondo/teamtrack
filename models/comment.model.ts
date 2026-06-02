import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: [true, "Task is required"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        content: {
            type: String,
            required: [true, "Comment content is required"],
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const Comment: Model<IComment> =
    mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
