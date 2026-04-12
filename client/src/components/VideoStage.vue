<script setup>
import { ref, watchEffect } from "vue";

const props = defineProps({
  localStream: {
    type: Object,
    default: null,
  },
  remoteStream: {
    type: Object,
    default: null,
  },
  partnerMediaState: {
    type: Object,
    required: true,
  },
  onlineLabel: {
    type: String,
    required: true,
  },
  cameraEnabled: {
    type: Boolean,
    required: true,
  },
  statusLabel: {
    type: String,
    required: true,
  },
  statusDescription: {
    type: String,
    required: true,
  },
});

const localVideoRef = ref(null);
const remoteVideoRef = ref(null);

watchEffect(() => {
  if (localVideoRef.value) {
    localVideoRef.value.srcObject = props.localStream || null;
  }

  if (remoteVideoRef.value) {
    remoteVideoRef.value.srcObject = props.remoteStream || null;
  }
});
</script>

<template>
  <section class="stage-card">
    <div class="stage-pane stage-promo">
      <video v-if="remoteStream" ref="remoteVideoRef" autoplay class="stage-video" playsinline />

      <div v-if="!remoteStream" class="stage-placeholder promo-shell">
        <div class="tv-mark">
          <div class="tv-mark-antenna"></div>
          <div class="tv-mark-body">
            <span class="tv-mark-ome">Met</span>
            <span class="tv-mark-tv">TV</span>
          </div>
        </div>

        <div class="promo-online">
          <span class="promo-dot"></span>
          <span>{{ onlineLabel }}</span>
        </div>

        <div class="promo-badges">
          <div class="promo-badge">
            <small>Web client</small>
            <strong>Vue 3</strong>
          </div>
          <div class="promo-badge">
            <small>Realtime</small>
            <strong>WebRTC</strong>
          </div>
        </div>
      </div>

      <div v-if="remoteStream" class="partner-indicators">
        <span class="partner-tag">Partner</span>
        <span :class="{ off: !partnerMediaState.micEnabled }">Mic</span>
        <span :class="{ off: !partnerMediaState.cameraEnabled }">Cam</span>
      </div>
    </div>

    <div class="stage-pane stage-local">
      <video ref="localVideoRef" autoplay class="stage-video" muted playsinline />

      <div class="local-overlay">
        <div class="local-status">
          <span class="local-label">Bạn</span>
          <span class="camera-pill" :class="{ off: !cameraEnabled }">
            {{ cameraEnabled ? "Camera bật" : "Camera tắt" }}
          </span>
        </div>

        <div class="stage-caption">
          <strong>{{ statusLabel }}</strong>
          <p>{{ statusDescription }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
