import { randomUUID } from "node:crypto";

import { EVENTS } from "../socket/events.js";

const INITIAL_MEDIA_STATE = {
  micEnabled: true,
  cameraEnabled: true,
};

export class MatchmakingService {
  constructor({ createSession, endSession, markConnected, incrementMessageCount, createReport }) {
    this.createSession = createSession;
    this.endSession = endSession;
    this.markConnected = markConnected;
    this.incrementMessageCount = incrementMessageCount;
    this.createReport = createReport;
    this.clients = new Map();
    this.queue = [];
    this.processingQueue = false;
  }

  registerSocket(socket) {
    this.clients.set(socket.id, {
      socket,
      state: "idle",
      partnerId: null,
      sessionId: null,
      mediaState: { ...INITIAL_MEDIA_STATE },
    });
  }

  async unregisterSocket(socketId) {
    const client = this.clients.get(socketId);

    if (!client) {
      return;
    }

    await this.leaveSession(socketId, {
      reason: "peer-disconnected",
      requeueSelf: false,
      requeuePartner: true,
      emitToSelf: false,
    });

    this.removeFromQueue(socketId);
    this.clients.delete(socketId);
  }

  async joinQueue(socketId) {
    const client = this.getClient(socketId);

    if (client.partnerId) {
      throw new Error("Current user is already in an active session.");
    }

    this.enqueue(socketId, { autoRequeue: false });
    await this.processQueue();
  }

  async nextPartner(socketId) {
    const client = this.getClient(socketId);

    if (client.partnerId) {
      await this.leaveSession(socketId, {
        reason: "next-requested",
        requeueSelf: true,
        requeuePartner: true,
        emitToSelf: true,
      });
      return;
    }

    this.enqueue(socketId, { autoRequeue: false });
    await this.processQueue();
  }

  async markCallConnected(socketId, sessionId) {
    const client = this.getClient(socketId);

    if (client.sessionId !== sessionId) {
      return;
    }

    await this.markConnected(sessionId);
  }

  async handleSignal(socketId, eventName, payload) {
    const client = this.getClient(socketId);
    const partner = this.getPartner(client);

    if (!partner) {
      throw new Error("No active partner found for signaling.");
    }

    partner.socket.emit(eventName, {
      sessionId: client.sessionId,
      sourceSocketId: socketId,
      ...payload,
    });
  }

  async handleChatMessage(socketId, messageText) {
    const client = this.getClient(socketId);
    const partner = this.getPartner(client);

    if (!partner || !client.sessionId) {
      throw new Error("Cannot send a chat message without an active session.");
    }

    const text = String(messageText || "").trim();

    if (!text) {
      throw new Error("Chat message cannot be empty.");
    }

    if (text.length > 500) {
      throw new Error("Chat message cannot exceed 500 characters.");
    }

    const message = {
      id: randomUUID(),
      text,
      sentAt: new Date().toISOString(),
      senderSocketId: socketId,
      sessionId: client.sessionId,
    };

    partner.socket.emit(EVENTS.CHAT_MESSAGE, message);
    await this.incrementMessageCount(client.sessionId);

    return message;
  }

  async handleMediaState(socketId, mediaState) {
    const client = this.getClient(socketId);
    const partner = this.getPartner(client);

    client.mediaState = {
      micEnabled: Boolean(mediaState?.micEnabled),
      cameraEnabled: Boolean(mediaState?.cameraEnabled),
    };

    if (!partner) {
      return;
    }

    partner.socket.emit(EVENTS.PARTNER_MEDIA_STATE, {
      sessionId: client.sessionId,
      mediaState: client.mediaState,
    });
  }

  async handleReport(socketId, payload) {
    const client = this.getClient(socketId);
    const partner = this.getPartner(client);

    if (!client.sessionId || !partner) {
      throw new Error("Cannot submit a report without an active partner.");
    }

    const reason = String(payload?.reason || "").trim();
    const details = String(payload?.details || "").trim();

    if (!reason) {
      throw new Error("Report reason is required.");
    }

    const report = await this.createReport({
      sessionId: client.sessionId,
      reporterSocketId: socketId,
      reportedSocketId: partner.socket.id,
      reason,
      details,
    });

    client.socket.emit(EVENTS.REPORT_SUBMITTED, {
      reportId: report._id.toString(),
      createdAt: report.createdAt,
    });

    return report;
  }

  async leaveSession(
    socketId,
    { reason, requeueSelf = false, requeuePartner = false, emitToSelf = true }
  ) {
    const client = this.clients.get(socketId);

    if (!client) {
      return;
    }

    this.removeFromQueue(socketId);

    const partnerId = client.partnerId;
    const sessionId = client.sessionId;

    client.partnerId = null;
    client.sessionId = null;
    client.state = "idle";

    if (partnerId) {
      const partner = this.clients.get(partnerId);

      if (partner) {
        this.removeFromQueue(partnerId);
        partner.partnerId = null;
        partner.sessionId = null;
        partner.state = "idle";

        // The remaining peer is returned to the queue immediately to keep the MVP flow continuous.
        partner.socket.emit(EVENTS.SESSION_ENDED, {
          reason,
          autoRequeue: requeuePartner,
        });

        if (requeuePartner && partner.socket.connected) {
          this.enqueue(partnerId, { autoRequeue: true });
        }
      }
    }

    if (emitToSelf && client.socket.connected) {
      client.socket.emit(EVENTS.SESSION_ENDED, {
        reason,
        autoRequeue: requeueSelf,
      });
    }

    if (requeueSelf && client.socket.connected) {
      this.enqueue(socketId, { autoRequeue: true });
    }

    await this.endSession(sessionId, reason);
    await this.processQueue();
  }

  enqueue(socketId, { autoRequeue }) {
    const client = this.getClient(socketId);

    if (!this.queue.includes(socketId)) {
      this.queue.push(socketId);
    }

    client.state = "queued";

    client.socket.emit(EVENTS.QUEUE_JOINED, {
      autoRequeue,
      queuedAt: new Date().toISOString(),
    });
  }

  removeFromQueue(socketId) {
    this.queue = this.queue.filter((queuedSocketId) => queuedSocketId !== socketId);
  }

  async processQueue() {
    if (this.processingQueue) {
      return;
    }

    this.processingQueue = true;

    try {
      this.queue = this.queue.filter((socketId) => this.isQueueEligible(socketId));

      while (this.queue.length >= 2) {
        const firstSocketId = this.queue.shift();
        const secondSocketId = this.queue.shift();

        if (!firstSocketId || !secondSocketId) {
          break;
        }

        if (!this.isQueueEligible(firstSocketId) || !this.isQueueEligible(secondSocketId)) {
          continue;
        }

        const firstClient = this.clients.get(firstSocketId);
        const secondClient = this.clients.get(secondSocketId);

        try {
          const session = await this.createSession(firstSocketId, secondSocketId);
          const sessionId = session._id.toString();

          firstClient.partnerId = secondSocketId;
          firstClient.sessionId = sessionId;
          firstClient.state = "connecting";

          secondClient.partnerId = firstSocketId;
          secondClient.sessionId = sessionId;
          secondClient.state = "connecting";

          firstClient.socket.emit(EVENTS.MATCH_FOUND, {
            sessionId,
            peerSocketId: secondSocketId,
            initiator: true,
          });

          secondClient.socket.emit(EVENTS.MATCH_FOUND, {
            sessionId,
            peerSocketId: firstSocketId,
            initiator: false,
          });
        } catch (error) {
          console.error("Failed to create a match session:", error);

          firstClient.state = "idle";
          secondClient.state = "idle";

          firstClient.socket.emit(EVENTS.APP_ERROR, {
            message: "Unable to create a session right now. Please try again.",
          });
          secondClient.socket.emit(EVENTS.APP_ERROR, {
            message: "Unable to create a session right now. Please try again.",
          });
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  getClient(socketId) {
    const client = this.clients.get(socketId);

    if (!client) {
      throw new Error("Client socket is not registered.");
    }

    return client;
  }

  getPartner(client) {
    if (!client.partnerId) {
      return null;
    }

    return this.clients.get(client.partnerId) || null;
  }

  isQueueEligible(socketId) {
    const client = this.clients.get(socketId);
    return Boolean(client?.socket.connected && client.state === "queued" && !client.partnerId);
  }
}
