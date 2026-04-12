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
        label: "Đang tìm",
        description: "Đang tìm một partner ngẫu nhiên trong hàng chờ.",
        tone: "searching",
        promoLine: "Đang tìm người dùng trực tuyến",
      };
    case "connecting":
      return {
        label: "Đang kết nối",
        description: "Đã tìm thấy người phù hợp. Đang trao đổi offer, answer và ICE.",
        tone: "connecting",
        promoLine: "Đang đồng bộ kết nối video",
      };
    case "connected":
      return {
        label: "Đã kết nối",
        description: "Kết nối P2P đã sẵn sàng. Bạn có thể chat, báo cáo hoặc bỏ qua.",
        tone: "connected",
        promoLine: "Đã ghép nối trực tiếp với partner",
      };
    case "disconnected":
      return {
        label: "Đã ngắt",
        description: "Socket hoặc partner đã ngắt kết nối. Hãy bắt đầu lại.",
        tone: "disconnected",
        promoLine: "Kết nối đã tạm dừng",
      };
    default:
      return {
        label: "Sẵn sàng",
        description: "Cho phép camera/microphone rồi nhấn Bắt đầu để ghép nhanh.",
        tone: "idle",
        promoLine: "Camera của bạn đã sẵn sàng",
      };
  }
});

const safetyMessage = computed(() => {
  if (mediaError.value) {
    return mediaError.value;
  }

  if (errorMessage.value) {
    return errorMessage.value;
  }

  if (reportSuccess.value) {
    return reportSuccess.value;
  }

  return "Bằng cách nhấn \"Bắt đầu\", bạn đồng ý với quy tắc của chúng tôi. Vui lòng giữ khuôn mặt của bạn trong khung hình camera.";
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
  <main class="app-shell ometv-shell">
    <section class="floating-status">
      <StatusBadge :label="statusMeta.label" :tone="statusMeta.tone" />
      <span class="floating-dot" :data-tone="statusMeta.tone"></span>
      <p>{{ statusMeta.description }}</p>
    </section>

    <section class="ometv-frame">
      <VideoStage
        :camera-enabled="cameraEnabled"
        :local-stream="localStream"
        :online-label="statusMeta.promoLine"
        :partner-media-state="partnerMediaState"
        :remote-stream="remoteStream"
        :status-description="statusMeta.description"
        :status-label="statusMeta.label"
      />

      <section class="bottom-deck">
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

        <section class="chat-stack">
          <article class="safety-card">
            <div class="safety-logo">Met</div>

            <div class="safety-copy">
              <p>{{ safetyMessage }}</p>

              <button
                class="link-button"
                :disabled="isRequestingPermission"
                @click="requestPermissions"
              >
                {{ hasMediaPermission ? "Quyền camera đã cấp" : "Cấp lại quyền camera" }}
              </button>
            </div>
          </article>

          <ReportPanel
            :is-submitting="isSubmittingReport"
            :visible="showReportPanel"
            @close="showReportPanel = false"
            @submit="handleReportSubmit"
          />

          <ChatPanel :disabled="!canSendMessage" :messages="messages" @send="sendMessage" />
        </section>
      </section>
    </section>
  </main>
</template>
