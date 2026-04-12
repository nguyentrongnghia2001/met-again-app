import { Report } from "../models/Report.js";
import { Session } from "../models/Session.js";

export const createSessionRecord = async (firstSocketId, secondSocketId) => {
  const session = await Session.create({
    participants: [{ socketId: firstSocketId }, { socketId: secondSocketId }],
  });

  return session;
};

export const markSessionConnected = async (sessionId) => {
  if (!sessionId) {
    return null;
  }

  return Session.findOneAndUpdate(
    { _id: sessionId, connectedAt: null },
    {
      $set: {
        status: "connected",
        connectedAt: new Date(),
      },
    },
    { new: true }
  );
};

export const endSessionRecord = async (sessionId, endedReason) => {
  if (!sessionId) {
    return null;
  }

  return Session.findOneAndUpdate(
    { _id: sessionId, endedAt: null },
    {
      $set: {
        status: "ended",
        endedAt: new Date(),
        endedReason,
      },
    },
    { new: true }
  );
};

export const incrementSessionMessageCount = async (sessionId) => {
  if (!sessionId) {
    return null;
  }

  return Session.findByIdAndUpdate(sessionId, { $inc: { messageCount: 1 } }, { new: true });
};

export const createSessionReport = async ({
  sessionId,
  reporterSocketId,
  reportedSocketId,
  reason,
  details,
}) => {
  const report = await Report.create({
    sessionId,
    reporterSocketId,
    reportedSocketId,
    reason,
    details,
  });

  await Session.findByIdAndUpdate(sessionId, { $inc: { reportsCount: 1 } });

  return report;
};
