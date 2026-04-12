<script setup>
import { reactive } from "vue";

defineProps({
  isSubmitting: {
    type: Boolean,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "submit"]);

const form = reactive({
  reason: "spam",
  details: "",
});

const submit = () => {
  emit("submit", {
    reason: form.reason,
    details: form.details.trim(),
  });
};
</script>

<template>
  <section v-if="visible" class="panel-card report-card">
    <div class="panel-heading">
      <p class="eyebrow">Basic Report</p>
      <h3>Flag current partner</h3>
    </div>

    <label class="field">
      <span>Reason</span>
      <select v-model="form.reason">
        <option value="spam">Spam</option>
        <option value="nudity">Nudity</option>
        <option value="harassment">Harassment</option>
        <option value="hate-speech">Hate speech</option>
        <option value="other">Other</option>
      </select>
    </label>

    <label class="field">
      <span>Details</span>
      <textarea
        v-model="form.details"
        maxlength="500"
        placeholder="Optional context for moderation follow-up."
        rows="4"
      />
    </label>

    <div class="control-group">
      <button class="primary-button" :disabled="isSubmitting" @click="submit">
        {{ isSubmitting ? "Submitting..." : "Submit Report" }}
      </button>
      <button class="secondary-button" type="button" @click="$emit('close')">Close</button>
    </div>
  </section>
</template>
