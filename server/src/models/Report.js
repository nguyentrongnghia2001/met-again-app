import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    reporterSocketId: {
      type: String,
      required: true,
      trim: true,
    },
    reportedSocketId: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    details: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const Report = mongoose.model("Report", reportSchema);
