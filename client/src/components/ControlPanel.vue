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
    <button class="control-tile control-tile-start" :disabled="!canStart" @click="$emit('start')">
      <span class="tile-label">Bắt đầu</span>
    </button>

    <button class="control-tile control-tile-stop" :disabled="!canNext" @click="$emit('next')">
      <span class="tile-label">Tiếp</span>
    </button>

    <article class="control-tile control-tile-info">
      <span class="tile-kicker">Quốc gia</span>
      <strong>
        Ngẫu nhiên
        <span>🌍</span>
      </strong>
    </article>

    <article class="control-tile control-tile-info">
      <span class="tile-kicker">Tôi là</span>
      <strong>
        Bất kỳ
        <span>🙂</span>
      </strong>
    </article>

    <div class="utility-row">
      <button class="utility-chip" @click="$emit('toggle-mic')">
        {{ micEnabled ? "Mic bật" : "Mic tắt" }}
      </button>
      <button class="utility-chip" @click="$emit('toggle-camera')">
        {{ cameraEnabled ? "Cam bật" : "Cam tắt" }}
      </button>
      <button class="utility-chip" :disabled="!canReport" @click="$emit('toggle-report')">
        Báo cáo
      </button>

      <span class="utility-state">
        <span class="utility-dot" :class="socketConnected ? 'online' : 'offline'"></span>
        {{ socketConnected ? "Socket online" : "Socket offline" }}
      </span>
    </div>
  </section>
</template>
