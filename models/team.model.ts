import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeam extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    createdAt: Date;
}

const TeamSchema = new Schema<ITeam>(
    {
        name: {
            type: String,
            required: [true, "Team name is required"],
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
