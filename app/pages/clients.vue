<template>
  <div v-for="client in clients" :key="client.clientId">
    {{ client }}
  </div>
</template>

<script setup lang="ts">
const {clients} = await useClient();
</script>
