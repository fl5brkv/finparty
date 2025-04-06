<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
      @click.self="$emit('close')">
      <div
        class="w-80 p-6 bg-white rounded-lg shadow-lg transform transition-all duration-300"
        ref="modal">
        <div class="flex justify-between items-center">
          <h3><slot name="header" /></h3>
          <button class="transition" @click="$emit('close')">x</button>
        </div>

        <slot name="body" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{show: boolean}>();

const emit = defineEmits(['close']);
</script>

<style>
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.6);
}
</style>
