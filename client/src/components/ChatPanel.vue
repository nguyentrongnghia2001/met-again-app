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
  <section class="panel-card">
    <div class="panel-heading">
      <p class="eyebrow">Text Chat</p>
      <h3>Session messages</h3>
    </div>

    <div ref="messagesRef" class="chat-messages">
      <template v-if="hasMessages">
        <article
          v-for="message in messages"
          :key="message.id"
          class="chat-bubble"
          :data-sender="message.sender"
        >
          <span class="chat-author">{{ message.sender === "self" ? "You" : "Partner" }}</span>
          <p>{{ message.text }}</p>
          <time>{{ new Date(message.sentAt).toLocaleTimeString() }}</time>
        </article>
      </template>

      <div v-else class="chat-empty">
        Messages appear here after the call connects.
      </div>
    </div>

    <form class="chat-form" @submit.prevent="submitMessage">
      <input
        v-model="draft"
        :disabled="disabled"
        maxlength="500"
        placeholder="Type a message..."
        type="text"
      />
      <button class="primary-button" :disabled="disabled || !draft.trim()" type="submit">
        Send
      </button>
    </form>
  </section>
</template>
