<script setup>
defineProps({
  canStart: {
    type: Boolean,
    required: true,
  },
  canNext: {
    type: Boolean,
    required: true,
  },
  canReport: {
    type: Boolean,
    required: true,
  },
  micEnabled: {
    type: Boolean,
    required: true,
  },
  cameraEnabled: {
    type: Boolean,
    required: true,
  },
  socketConnected: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["next", "start", "toggle-camera", "toggle-mic", "toggle-report"]);
</script>

<template>
  <section class="control-card">
    <div class="control-group">
      <button class="primary-button" :disabled="!canStart" @click="$emit('start')">Start</button>
      <button class="secondary-button" :disabled="!canNext" @click="$emit('next')">Next</button>
    </div>

    <div class="control-group">
      <button class="ghost-button" @click="$emit('toggle-mic')">
        {{ micEnabled ? "Mute Mic" : "Unmute Mic" }}
      </button>
      <button class="ghost-button" @click="$emit('toggle-camera')">
        {{ cameraEnabled ? "Hide Cam" : "Show Cam" }}
      </button>
      <button class="ghost-button" :disabled="!canReport" @click="$emit('toggle-report')">
        Report
      </button>
    </div>

    <p class="socket-state">
      Socket:
      <span :class="socketConnected ? 'online' : 'offline'">
        {{ socketConnected ? "Connected" : "Disconnected" }}
      </span>
    </p>
  </section>
</template>
