<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: "idle",
  },
});
</script>

<template>
  <span class="status-badge" :data-tone="tone">{{ label }}</span>
</template>
