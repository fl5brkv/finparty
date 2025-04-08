<template>
  <UModal
    v-model:open="open"
    :title="isUpdate ? 'Update Client' : 'New Client'"
    :description="
      isUpdate
        ? 'Edit client details in the database'
        : 'Add a new client to the database'
    "
    @update:open="emit('update:open', $event)">
    <UButton v-if="!isUpdate" label="New client" icon="tabler:plus" />

    <template #body>
      <UForm
        :schema="isUpdate ? clientUpdateSchema : clientInsertSchema"
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
            @click="isUpdate ? emit('update:open', false) : (open = false)" />
          <UButton
            :label="isUpdate ? 'Update' : 'Create'"
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
import {
  clientUpdateSchema,
  clientInsertSchema,
} from '~~/server/database/schema';

type UpdateSchema = z.output<typeof clientUpdateSchema>;
type InsertSchema = z.output<typeof clientInsertSchema>;
type Schema = InsertSchema | UpdateSchema;

const toast = useToast();

const emit = defineEmits(['update:open']);

interface Props {
  open: boolean;
  client?: Partial<Schema>;
  isUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isUpdate: false,
});

const {open, client, isUpdate} = toRefs(props);
const state = shallowReactive<Partial<Schema>>({});

watchEffect(() => {
  if (client.value) Object.assign(state, client.value);
});

let previousClients = [];

const {data: clients} = useNuxtData('clients');

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  previousClients = [...(clients.value || [])];

  const isUpdating = isUpdate.value;
  const clientData = event.data;

  if (isUpdating) {
    clients.value = (clients.value || []).map((client: Schema) => {
      if (
        'clientId' in client &&
        'clientId' in clientData &&
        client.clientId === clientData.clientId
      ) {
        return {...client, ...clientData}; 
      }
      return client; 
    });
  } else {
    clients.value = [...(clients.value || []), clientData];
  }

  try {
    await $fetch('/api/client', {
      method: isUpdating ? 'PATCH' : 'POST',
      body: clientData,
    });

    toast.add({
      title: 'Success',
      description: `Client successfully ${isUpdating ? 'updated' : 'added'}.`,
    });

    refreshNuxtData('clients');
  } catch (err: any) {
    clients.value = previousClients;

    toast.add({
      title: 'Error',
      description:
        err.data?.message ||
        err.statusMessage ||
        `Failed to ${
          isUpdating ? 'update' : 'add'
        } client. Please try again later.`,
    });
  }

  emit('update:open', false);
};
</script>
