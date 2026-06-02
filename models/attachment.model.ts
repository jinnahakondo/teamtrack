import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAttachment extends Document {
    _id: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    uploadedBy: mongoose.Types.ObjectId;
    fileName: string;
    fileUrl: string;
    createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: [true, "Task is required"],
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"],
        },
        fileName: {
            type: String,
            required: [true, "File name is required"],
            trim: true,
        },
        fileUrl: {
            type: String,
            required: [true, "File URL is required"],
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const Attachment: Model<IAttachment> =
    mongoose.models.Attachment ||
    mongoose.model<IAttachment>("Attachment", AttachmentSchema);

export default Attachment;
