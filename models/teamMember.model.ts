import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeamMember extends Document {
    _id: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team is required"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// Prevent duplicate memberships
TeamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

const TeamMember: Model<ITeamMember> =
    mongoose.models.TeamMember ||
    mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export default TeamMember;
