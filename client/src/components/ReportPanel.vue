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
  <section v-if="visible" class="report-overlay" @click.self="$emit('close')">
    <div class="report-card">
      <div class="panel-heading">
        <p class="eyebrow">Báo cáo</p>
        <h3>Gắn cờ partner hiện tại</h3>
      </div>

      <label class="field">
        <span>Lý do</span>
        <select v-model="form.reason">
          <option value="spam">Spam</option>
          <option value="nudity">Nội dung nhạy cảm</option>
          <option value="harassment">Quấy rối</option>
          <option value="hate-speech">Ngôn từ thù ghét</option>
          <option value="other">Khác</option>
        </select>
      </label>

      <label class="field">
        <span>Chi tiết</span>
        <textarea
          v-model="form.details"
          maxlength="500"
          placeholder="Mô tả thêm nếu cần cho phần follow-up."
          rows="4"
        />
      </label>

      <div class="report-actions">
        <button class="chat-send" :disabled="isSubmitting" @click="submit">
          {{ isSubmitting ? "Đang gửi..." : "Gửi báo cáo" }}
        </button>
        <button class="report-close" type="button" @click="$emit('close')">Đóng</button>
      </div>
    </div>
  </section>
</template>
