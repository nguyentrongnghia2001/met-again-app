<script setup>
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    required: true,
  },
  messages: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["send"]);

const draft = ref("");
const messagesRef = ref(null);

const hasMessages = computed(() => props.messages.length > 0);

const submitMessage = () => {
  if (!draft.value.trim()) {
    return;
  }

  emit("send", draft.value);
  draft.value = "";
};

watch(
  () => props.messages.length,
  async () => {
    await nextTick();
    messagesRef.value?.scrollTo({
      top: messagesRef.value.scrollHeight,
      behavior: "smooth",
    });
  }
);
</script>

<template>
  <section class="chat-card">
    <div ref="messagesRef" class="chat-messages">
      <template v-if="hasMessages">
        <article
          v-for="message in messages"
          :key="message.id"
          class="chat-bubble"
          :data-sender="message.sender"
        >
          <span class="chat-author">{{ message.sender === "self" ? "Bạn" : "Partner" }}</span>
          <p>{{ message.text }}</p>
          <time>{{ new Date(message.sentAt).toLocaleTimeString() }}</time>
        </article>
      </template>

      <div v-else class="chat-empty">
        Tin nhắn sẽ xuất hiện khi phiên call được kết nối.
      </div>
    </div>

    <form class="chat-form" @submit.prevent="submitMessage">
      <input
        v-model="draft"
        :disabled="disabled"
        maxlength="500"
        placeholder="Viết một tin nhắn"
        type="text"
      />
      <button class="chat-send" :disabled="disabled || !draft.trim()" type="submit">Gửi</button>
    </form>
  </section>
</template>
