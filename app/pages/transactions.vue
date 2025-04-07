<template>
  <div>{{ clients }}</div>
</template>

<script setup lang="ts">
const { data: clients } = useNuxtData('clients');
</script>
