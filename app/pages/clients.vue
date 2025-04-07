<template>
  {{ clients }}
</template>

<script setup lang="ts">
const {data: clients} = await useAsyncData('clients', () =>
  $fetch('/api/client')
);
</script>
