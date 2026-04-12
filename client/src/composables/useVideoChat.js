import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";

import { EVENTS } from "../constants/socketEvents";
import { createSocket } from "../services/socket";

const DEFAULT_PARTNER_MEDIA_STATE = {
  micEnabled: true,
  cameraEnabled: true,
};

const parseIceServers = () => {
  const rawValue =
    import.meta.env.VITE_STUN_SERVERS ||
    "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302";

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((url) => ({ urls: url }));
};

export const useVideoChat = ({
  localStream,
  hasMediaPermission,
  micEnabled,
  cameraEnabled,
  requestPermissions,
}) => {
  const socket = shallowRef(null);
  const peerConnection = shallowRef(null);
  const remoteStream = shallowRef(null);
  const status = ref("idle");
  const errorMessage = ref("");
  const socketConnected = ref(false);
  const sessionId = ref(null);
  const partnerId = ref(null);
  const messages = ref([]);
  const reportSuccess = ref("");
  const isSubmittingReport = ref(false);
  const partnerMediaState = ref({ ...DEFAULT_PARTNER_MEDIA_STATE });
  const pendingIceCandidates = [];

  const canStart = computed(
    () =>
      hasMediaPermission.value &&
      socketConnected.value &&
      ["idle", "disconnected"].includes(status.value)
  );

  const canNext = computed(
    () => socketConnected.value && ["searching", "connecting", "connected"].includes(status.value)
  );

  const canSendMessage = computed(() => status.value === "connected" && Boolean(sessionId.value));
  const canReport = computed(() => ["connecting", "connected"].includes(status.value));

  const resetSessionState = () => {
    sessionId.value = null;
    partnerId.value = null;
    remoteStream.value = null;
    partnerMediaState.value = { ...DEFAULT_PARTNER_MEDIA_STATE };
    messages.value = [];
    pendingIceCandidates.length = 0;
  };

  const clearNotices = () => {
    errorMessage.value = "";
    reportSuccess.value = "";
  };

  const cleanupPeerConnection = () => {
    const currentPeer = peerConnection.value;

    if (!currentPeer) {
      return;
    }

    currentPeer.ontrack = null;
    currentPeer.onicecandidate = null;
    currentPeer.onconnectionstatechange = null;
    currentPeer.oniceconnectionstatechange = null;
    currentPeer.close();
    peerConnection.value = null;
  };

  const emitWithAck = (eventName, payload = {}) =>
    new Promise((resolve) => {
      if (!socket.value) {
        resolve({ ok: false, message: "Socket is not connected." });
        return;
      }

      socket.value?.emit(eventName, payload, (response) => {
        resolve(response || { ok: false, message: "No response from server." });
      });
    });

  const setDisconnected = (message) => {
    cleanupPeerConnection();
    resetSessionState();
    status.value = "disconnected";
    errorMessage.value = message;
  };

  const syncMediaState = () => {
    if (!socketConnected.value || !sessionId.value) {
      return;
    }

    socket.value?.emit(EVENTS.MEDIA_STATE, {
      micEnabled: micEnabled.value,
      cameraEnabled: cameraEnabled.value,
    });
  };

  const flushPendingIceCandidates = async () => {
    if (!peerConnection.value) {
      return;
    }

    // ICE can arrive before the remote SDP lands; keep it buffered until then.
    while (pendingIceCandidates.length > 0) {
      const candidate = pendingIceCandidates.shift();
      await peerConnection.value.addIceCandidate(candidate);
    }
  };

  const createPeerConnection = async (initiator) => {
    cleanupPeerConnection();

    const stream = localStream.value;

    if (!stream) {
      throw new Error("Local media stream is not ready.");
    }

    const connection = new RTCPeerConnection({
      iceServers: parseIceServers(),
    });

    peerConnection.value = connection;

    stream.getTracks().forEach((track) => {
      connection.addTrack(track, stream);
    });

    connection.ontrack = (event) => {
      remoteStream.value = event.streams[0];
    };

    connection.onicecandidate = async ({ candidate }) => {
      if (!candidate || !sessionId.value) {
        return;
      }

      await emitWithAck(EVENTS.SIGNAL_ICE_CANDIDATE, {
        sessionId: sessionId.value,
        candidate,
      });
    };

    connection.onconnectionstatechange = () => {
      if (peerConnection.value !== connection) {
        return;
      }

      if (connection.connectionState === "connected") {
        status.value = "connected";
        errorMessage.value = "";
        socket.value?.emit(EVENTS.SESSION_CONNECTED, { sessionId: sessionId.value });
        return;
      }

      if (["failed", "disconnected"].includes(connection.connectionState)) {
        void nextPartner();
      }
    };

    connection.oniceconnectionstatechange = () => {
      if (peerConnection.value !== connection) {
        return;
      }

      if (connection.iceConnectionState === "failed") {
        void nextPartner();
      }
    };

    if (initiator) {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      const response = await emitWithAck(EVENTS.SIGNAL_OFFER, {
        sessionId: sessionId.value,
        sdp: connection.localDescription,
      });

      if (!response.ok) {
        throw new Error(response.message || "Unable to send the offer.");
      }
    }
  };

  const handleIncomingOffer = async (payload) => {
    if (payload.sessionId !== sessionId.value) {
      return;
    }

    if (!peerConnection.value) {
      await createPeerConnection(false);
    }

    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    await flushPendingIceCandidates();

    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);

    const response = await emitWithAck(EVENTS.SIGNAL_ANSWER, {
      sessionId: sessionId.value,
      sdp: peerConnection.value.localDescription,
    });

    if (!response.ok) {
      throw new Error(response.message || "Unable to send the answer.");
    }
  };

  const handleIncomingAnswer = async (payload) => {
    if (payload.sessionId !== sessionId.value || !peerConnection.value) {
      return;
    }

    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    await flushPendingIceCandidates();
  };

  const handleIncomingIceCandidate = async (payload) => {
    if (payload.sessionId !== sessionId.value || !payload.candidate) {
      return;
    }

    const candidate = new RTCIceCandidate(payload.candidate);

    if (!peerConnection.value?.remoteDescription) {
      pendingIceCandidates.push(candidate);
      return;
    }

    await peerConnection.value.addIceCandidate(candidate);
  };

  const ensureSocketConnected = async () => {
    if (!socket.value) {
      const nextSocket = createSocket();
      socket.value = nextSocket;

      nextSocket.on("connect", () => {
        socketConnected.value = true;
        clearNotices();

        if (status.value === "disconnected" && hasMediaPermission.value) {
          status.value = "idle";
        }
      });

      nextSocket.on("disconnect", () => {
        socketConnected.value = false;
        setDisconnected("Socket connection lost. Reconnect to start another match.");
      });

      nextSocket.on("connect_error", () => {
        socketConnected.value = false;
        setDisconnected("Unable to connect to the signaling server.");
      });

      nextSocket.on(EVENTS.QUEUE_JOINED, () => {
        clearNotices();
        status.value = "searching";
      });

      nextSocket.on(EVENTS.MATCH_FOUND, async (payload) => {
        try {
          cleanupPeerConnection();
          resetSessionState();
          clearNotices();

          sessionId.value = payload.sessionId;
          partnerId.value = payload.peerSocketId;
          status.value = "connecting";

          await createPeerConnection(payload.initiator);
          syncMediaState();
        } catch (error) {
          setDisconnected(error.message || "Unable to create the peer connection.");
        }
      });

      nextSocket.on(EVENTS.SIGNAL_OFFER, async (payload) => {
        try {
          await handleIncomingOffer(payload);
        } catch (error) {
          setDisconnected(error.message || "Failed to apply the incoming offer.");
        }
      });

      nextSocket.on(EVENTS.SIGNAL_ANSWER, async (payload) => {
        try {
          await handleIncomingAnswer(payload);
        } catch (error) {
          setDisconnected(error.message || "Failed to apply the incoming answer.");
        }
      });

      nextSocket.on(EVENTS.SIGNAL_ICE_CANDIDATE, async (payload) => {
        try {
          await handleIncomingIceCandidate(payload);
        } catch (error) {
          setDisconnected(error.message || "Failed to apply the ICE candidate.");
        }
      });

      nextSocket.on(EVENTS.CHAT_MESSAGE, (message) => {
        messages.value.push({
          ...message,
          sender: message.senderSocketId === socket.value?.id ? "self" : "peer",
        });
      });

      nextSocket.on(EVENTS.SESSION_ENDED, ({ reason, autoRequeue }) => {
        cleanupPeerConnection();
        resetSessionState();
        clearNotices();
        status.value = autoRequeue ? "searching" : "disconnected";

        if (reason === "peer-disconnected") {
          errorMessage.value = autoRequeue
            ? "Your partner disconnected. Looking for a new one."
            : "Your partner disconnected.";
        }
      });

      nextSocket.on(EVENTS.PARTNER_MEDIA_STATE, ({ mediaState }) => {
        partnerMediaState.value = {
          ...DEFAULT_PARTNER_MEDIA_STATE,
          ...mediaState,
        };
      });

      nextSocket.on(EVENTS.APP_ERROR, ({ message }) => {
        errorMessage.value = message || "Unexpected signaling error.";
      });

      nextSocket.on(EVENTS.REPORT_SUBMITTED, () => {
        reportSuccess.value = "Report submitted successfully.";
      });
    }

    if (socketConnected.value) {
      return socket.value;
    }

    const currentSocket = socket.value;

    return new Promise((resolve, reject) => {
      const handleConnect = () => {
        cleanup();
        resolve(currentSocket);
      };

      const handleError = () => {
        cleanup();
        reject(new Error("Unable to connect to the signaling server."));
      };

      const cleanup = () => {
        currentSocket.off("connect", handleConnect);
        currentSocket.off("connect_error", handleError);
      };

      currentSocket.on("connect", handleConnect);
      currentSocket.on("connect_error", handleError);
      currentSocket.connect();
    });
  };

  const initialize = async () => {
    await requestPermissions();
    await ensureSocketConnected();
  };

  const startMatchmaking = async () => {
    clearNotices();

    if (!hasMediaPermission.value) {
      const granted = await requestPermissions();

      if (!granted) {
        return;
      }
    }

    await ensureSocketConnected();
    cleanupPeerConnection();
    resetSessionState();
    status.value = "searching";

    const response = await emitWithAck(EVENTS.MATCH_ENQUEUE);

    if (!response.ok) {
      status.value = "idle";
      errorMessage.value = response.message || "Unable to join the queue.";
    }
  };

  const nextPartner = async () => {
    clearNotices();
    await ensureSocketConnected();
    cleanupPeerConnection();
    resetSessionState();
    status.value = "searching";

    const response = await emitWithAck(EVENTS.MATCH_NEXT);

    if (!response.ok) {
      setDisconnected(response.message || "Unable to skip the current partner.");
    }
  };

  const sendMessage = async (text) => {
    const content = String(text || "").trim();

    if (!content) {
      return false;
    }

    const response = await emitWithAck(EVENTS.CHAT_MESSAGE, { text: content });

    if (!response.ok) {
      errorMessage.value = response.message || "Unable to send the message.";
      return false;
    }

    messages.value.push({
      ...response.message,
      sender: "self",
    });

    return true;
  };

  const submitReport = async ({ reason, details }) => {
    if (!sessionId.value) {
      errorMessage.value = "No active session to report.";
      return false;
    }

    isSubmittingReport.value = true;
    reportSuccess.value = "";

    try {
      const response = await emitWithAck(EVENTS.SESSION_REPORT, {
        reason,
        details,
      });

      if (!response.ok) {
        throw new Error(response.message || "Unable to submit the report.");
      }

      reportSuccess.value = "Report submitted successfully.";
      return true;
    } catch (error) {
      errorMessage.value = error.message || "Unable to submit the report.";
      return false;
    } finally {
      isSubmittingReport.value = false;
    }
  };

  watch([micEnabled, cameraEnabled], () => {
    syncMediaState();
  });

  onBeforeUnmount(() => {
    cleanupPeerConnection();
    socket.value?.disconnect();
  });

  return {
    canNext,
    canReport,
    canSendMessage,
    canStart,
    errorMessage,
    initialize,
    isSubmittingReport,
    messages,
    nextPartner,
    partnerMediaState,
    remoteStream,
    reportSuccess,
    sendMessage,
    socketConnected,
    startMatchmaking,
    status,
    submitReport,
  };
};
