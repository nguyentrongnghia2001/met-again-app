import {
  createSessionRecord,
  createSessionReport,
  endSessionRecord,
  incrementSessionMessageCount,
  markSessionConnected,
} from "../services/sessionService.js";
import { MatchmakingService } from "../services/matchmakingService.js";
import { EVENTS } from "./events.js";

const handleAck = (callback, payload) => {
  if (typeof callback === "function") {
    callback(payload);
  }
};

export const registerSocketHandlers = (io) => {
  const matchmakingService = new MatchmakingService({
    createSession: createSessionRecord,
    endSession: endSessionRecord,
    markConnected: markSessionConnected,
    incrementMessageCount: incrementSessionMessageCount,
    createReport: createSessionReport,
  });

  io.on("connection", (socket) => {
    matchmakingService.registerSocket(socket);

    socket.on(EVENTS.MATCH_ENQUEUE, async (_payload, callback) => {
      try {
        await matchmakingService.joinQueue(socket.id);
        handleAck(callback, { ok: true });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.MATCH_NEXT, async (_payload, callback) => {
      try {
        await matchmakingService.nextPartner(socket.id);
        handleAck(callback, { ok: true });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.SESSION_CONNECTED, async (payload) => {
      await matchmakingService.markCallConnected(socket.id, payload?.sessionId);
    });

    socket.on(EVENTS.SIGNAL_OFFER, async (payload, callback) => {
      try {
        await matchmakingService.handleSignal(socket.id, EVENTS.SIGNAL_OFFER, payload);
        handleAck(callback, { ok: true });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.SIGNAL_ANSWER, async (payload, callback) => {
      try {
        await matchmakingService.handleSignal(socket.id, EVENTS.SIGNAL_ANSWER, payload);
        handleAck(callback, { ok: true });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.SIGNAL_ICE_CANDIDATE, async (payload, callback) => {
      try {
        await matchmakingService.handleSignal(socket.id, EVENTS.SIGNAL_ICE_CANDIDATE, payload);
        handleAck(callback, { ok: true });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.CHAT_MESSAGE, async (payload, callback) => {
      try {
        const message = await matchmakingService.handleChatMessage(socket.id, payload?.text);
        handleAck(callback, { ok: true, message });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on(EVENTS.MEDIA_STATE, async (payload) => {
      await matchmakingService.handleMediaState(socket.id, payload);
    });

    socket.on(EVENTS.SESSION_REPORT, async (payload, callback) => {
      try {
        const report = await matchmakingService.handleReport(socket.id, payload);
        handleAck(callback, {
          ok: true,
          reportId: report._id.toString(),
          createdAt: report.createdAt,
        });
      } catch (error) {
        handleAck(callback, { ok: false, message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      await matchmakingService.unregisterSocket(socket.id);
    });
  });
};
