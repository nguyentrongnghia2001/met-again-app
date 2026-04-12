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
    <div class="stage-remote">
      <video ref="remoteVideoRef" autoplay class="stage-video" playsinline />

      <div v-if="!remoteStream" class="stage-placeholder">
        <p class="eyebrow">Remote Feed</p>
        <h2>{{ statusLabel }}</h2>
        <p>{{ statusDescription }}</p>
      </div>

      <div v-if="remoteStream" class="partner-indicators">
        <span :class="{ off: !partnerMediaState.micEnabled }">Mic</span>
        <span :class="{ off: !partnerMediaState.cameraEnabled }">Cam</span>
      </div>
    </div>

    <div class="stage-local">
      <video ref="localVideoRef" autoplay class="stage-video" muted playsinline />
      <span class="local-label">You</span>
    </div>
  </section>
</template>
