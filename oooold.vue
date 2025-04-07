<template>
  <div v-for="(client, index) in clients" :key="index">
    {{ client.email }}
    <!-- <div v-for="(trans, index) in client.transactions" :key="index">
        {{ trans.item }}
      </div> -->

    <!-- <button @click="editClient(client)">edit</button>
  
      <button @click="deleteClient({clientId: client.clientId})">delete</button>  -->
  </div>
  <!-- 
    {{ error }}
  
    <button @click="newClient()">New client</button> -->

  <!-- <Teleport to="body">
      <Modal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>New client</h3>
        </template>
  
        <template #body>
          <form @submit.prevent="onSubmit">
            <label>
              First Name:
              <input type="text" v-model="form.firstName" required />
            </label>
  
            <label>
              Last Name:
              <input type="text" v-model="form.lastName" required />
            </label>
  
            <label>
              Email:
              <input type="email" v-model="form.email" />
            </label>
  
            <label>
              Phone:
              <input type="tel" v-model="form.phone" />
            </label>
  
            <label>
              Address:
              <input type="text" v-model="form.address" />
            </label>
  
            {{ isEditing }}
            <button type="submit">Submit</button>
          </form>
        </template>
      </Modal>
    </Teleport> -->
</template>

<script setup lang="ts">
// import type {z} from 'zod';
// import type {
//   clientDeleteSchema,
//   clientUpdateSchema,
// } from '~~/server/database/schema';

const {data: clients} = await useFetch('/api/client', {
  key: 'clients',
});

// const showModal = ref(false);

// const isEditing = ref(false);

// const form = ref({
//   clientId: 0,
//   firstName: '',
//   lastName: '',
//   email: '',
//   phone: '',
//   address: '',
// });

// const resetForm = () => {
//   form.value = {
//     clientId: 0,
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
//   };
// };

// const newClient = () => {
//   resetForm();
//   isEditing.value = false;
//   showModal.value = true;
// };

// const editClient = (values: z.infer<typeof clientUpdateSchema>) => {
//   Object.assign(form.value, values);
//   isEditing.value = true;
//   showModal.value = true;
// };

// const deleteClient = async (values: z.infer<typeof clientDeleteSchema>) => {
//   try {
//     await $fetch('/api/client', {
//       method: 'DELETE',
//       body: values,
//     });

//     console.log(values);
//   } catch (err: any) {
//     error.value =
//       err.data?.message ||
//       err.statusMessage ||
//       'Oops! Something went wrong. Please try again later.';
//   }
// };

// const onSubmit = async () => {
//   try {
//     await $fetch('/api/client', {
//       method: isEditing.value ? 'PATCH' : 'POST',
//       body: form.value,
//     });

//     resetForm();

//     showModal.value = false;
//     isEditing.value = false;
//   } catch (err: any) {
//     error.value =
//       err.data?.message ||
//       err.statusMessage ||
//       'Oops! Something went wrong. Please try again later.';
//   }
// };
</script>
