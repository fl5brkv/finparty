<template>
  <UModal
    v-model:open="open"
    title="New client"
    description="Add a new client to the database">
    <UButton label="New client" icon="tabler:plus" />

    <template #body>
      <UForm
        :schema="clientInsertSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit">
        <UFormField
          label="First Name"
          placeholder="Enter client's first name"
          name="firstName">
          <UInput v-model="state.firstName" class="w-full" />
        </UFormField>

        <UFormField
          label="Last Name"
          placeholder="Enter client's last name"
          name="lastName">
          <UInput v-model="state.lastName" class="w-full" />
        </UFormField>

        <UFormField
          label="Email"
          placeholder="Enter client's email"
          name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField
          label="Phone"
          placeholder="Enter client's phone number"
          name="phone">
          <UInput v-model="state.phone" class="w-full" />
        </UFormField>

        <UFormField
          label="Address"
          placeholder="Enter client's address"
          name="address">
          <UInput v-model="state.address" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false" />
          <UButton
            label="Create"
            color="primary"
            variant="solid"
            type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type {FormSubmitEvent} from '@nuxt/ui';
import type {z} from 'zod';
import {clientInsertSchema} from '~~/server/database/schema';
const {insertClient} = await useClient();

type Schema = z.output<typeof clientInsertSchema>;

const state = reactive<Partial<Schema>>({
  firstName: '',
  lastName: '',
  email: undefined,
  phone: undefined,
  address: undefined,
});

const open = ref(false);
const toast = useToast();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const {firstName, lastName, email, phone, address} = event.data;

  await insertClient({firstName, lastName, email, phone, address});

  open.value = false;
};
</script>
