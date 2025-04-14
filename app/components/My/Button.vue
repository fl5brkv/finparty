<template>
  <UButton
    :icon="opened.opened ? 'lucide:menu' : 'lucide:x'"
    size="md"
    color="neutral"
    variant="ghost"
    @click="opened.toggle"
    class="md:hidden" />
</template>

<script setup>
const opened = inject('opened');
</script>
