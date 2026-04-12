<script setup>
import { computed, onMounted, ref } from "vue";

import ChatPanel from "./components/ChatPanel.vue";
import ControlPanel from "./components/ControlPanel.vue";
import ReportPanel from "./components/ReportPanel.vue";
import StatusBadge from "./components/StatusBadge.vue";
import VideoStage from "./components/VideoStage.vue";
import { useMediaDevices } from "./composables/useMediaDevices";
import { useVideoChat } from "./composables/useVideoChat";

const showReportPanel = ref(false);

const {
  cameraEnabled,
  hasMediaPermission,
  isRequestingPermission,
  localStream,
  mediaError,
  micEnabled,
  requestPermissions,
  toggleCamera,
  toggleMicrophone,
} = useMediaDevices();

const {
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
} = useVideoChat({
  localStream,
  hasMediaPermission,
  micEnabled,
  cameraEnabled,
  requestPermissions,
});

const statusMeta = computed(() => {
  switch (status.value) {
    case "searching":
      return {
        label: "Searching",
        description: "Looking for an available partner in the queue.",
        tone: "searching",
      };
    case "connecting":
      return {
        label: "Connecting",
        description: "Match found. Exchanging WebRTC offer, answer and ICE candidates.",
        tone: "connecting",
      };
    case "connected":
      return {
        label: "Connected",
        description: "Peer-to-peer media is active. You can chat, report or skip.",
        tone: "connected",
      };
    case "disconnected":
      return {
        label: "Disconnected",
        description: "Socket or partner connection was closed. Reconnect and start again.",
        tone: "disconnected",
      };
    default:
      return {
        label: "Ready",
        description: "Allow camera and microphone, then hit Start for a random match.",
        tone: "idle",
      };
  }
});

const handleReportSubmit = async (payload) => {
  const ok = await submitReport(payload);

  if (ok) {
    showReportPanel.value = false;
  }
};

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <main class="app-shell">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Met Again</p>
        <h1>Random video chat MVP built for fast local iteration.</h1>
        <p class="hero-copy">
          Vue 3 handles the UI, Socket.IO handles signaling, and WebRTC keeps media peer to peer.
        </p>
      </div>

      <div class="hero-status">
        <StatusBadge :label="statusMeta.label" :tone="statusMeta.tone" />
        <p>{{ statusMeta.description }}</p>
      </div>
    </section>

    <section v-if="mediaError || errorMessage || reportSuccess" class="alert-stack">
      <article v-if="mediaError" class="alert-card warning">
        <strong>Media access:</strong> {{ mediaError }}
      </article>
      <article v-if="errorMessage" class="alert-card danger">
        <strong>Realtime:</strong> {{ errorMessage }}
      </article>
      <article v-if="reportSuccess" class="alert-card success">
        <strong>Report:</strong> {{ reportSuccess }}
      </article>
    </section>

    <section class="dashboard-grid">
      <VideoStage
        :local-stream="localStream"
        :partner-media-state="partnerMediaState"
        :remote-stream="remoteStream"
        :status-description="statusMeta.description"
        :status-label="statusMeta.label"
      />

      <div class="sidebar-column">
        <ControlPanel
          :camera-enabled="cameraEnabled"
          :can-next="canNext"
          :can-report="canReport"
          :can-start="canStart"
          :mic-enabled="micEnabled"
          :socket-connected="socketConnected"
          @next="nextPartner"
          @start="startMatchmaking"
          @toggle-camera="toggleCamera"
          @toggle-mic="toggleMicrophone"
          @toggle-report="showReportPanel = !showReportPanel"
        />

        <section class="panel-card">
          <div class="panel-heading">
            <p class="eyebrow">Permissions</p>
            <h3>Local devices</h3>
          </div>

          <p class="device-copy">
            The app requests camera and microphone on load. Use the retry button if the browser
            permission prompt was blocked or dismissed.
          </p>

          <div class="control-group">
            <button class="secondary-button" :disabled="isRequestingPermission" @click="requestPermissions">
              {{ isRequestingPermission ? "Requesting..." : "Retry Permissions" }}
            </button>
            <StatusBadge
              :label="hasMediaPermission ? 'Granted' : 'Missing'"
              :tone="hasMediaPermission ? 'connected' : 'disconnected'"
            />
          </div>
        </section>

        <ReportPanel
          :is-submitting="isSubmittingReport"
          :visible="showReportPanel"
          @close="showReportPanel = false"
          @submit="handleReportSubmit"
        />

        <ChatPanel :disabled="!canSendMessage" :messages="messages" @send="sendMessage" />
      </div>
    </section>
  </main>
</template>
