import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["matched", "connected", "ended"],
      default: "matched",
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: (value) => value.length === 2,
        message: "A session must have exactly two participants.",
      },
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    endedReason: {
      type: String,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    reportsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

export const Session = mongoose.model("Session", sessionSchema);
