<template>
  <div v-for="client in data">
    {{ client.firstName }}
    <div v-for="trans in client.transactions">
      {{ trans.item }}
    </div>
  </div>

  {{ error }}

  <button id="show-modal" @click="showModal = true">New client</button>

  <Teleport to="body">
    <Modal :show="showModal" @close="showModal = false">
      <template #header>
        <h3>New client</h3>
      </template>

      <template #body>
        <form>
          <input type="text" />
        </form>
      </template>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
const {data, error} = await useFetch('/api/client');

const showModal = ref(false);
</script>
