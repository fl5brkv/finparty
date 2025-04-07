<template>
  <div v-for="client in clients" :key="client.clientId">
    <div
      v-for="transaction in client.transactions"
      :key="transaction.transactionId">
      {{ transaction }}
    </div>
  </div>
</template>

<script setup lang="ts">
const {clients} = await useClient();
</script>
