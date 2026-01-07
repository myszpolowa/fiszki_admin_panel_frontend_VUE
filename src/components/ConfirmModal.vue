<template>
  <div class="modal">
    <div class="modal__backdrop" @click="$emit('cancel')"></div>
    <div class="modal__content">
      <p class="modal__title">{{ title }}</p>
      <p class="modal__subtitle">{{ showWarning ? 'changes cannot be reversed.' : ' ' }}</p>
      <div class="modal__actions">
        <button @click="$emit('cancel')" class="btn btn--ghost">cancel</button>
        <button @click="$emit('confirm')" class="btn btn--primary">yes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  showWarning: {
    type: Boolean,
    default: true
  }
})

defineEmits(['confirm', 'cancel'])
</script>
