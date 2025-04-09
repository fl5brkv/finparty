<template>
  <UModal
    v-model:open="open"
    :title="isUpdate ? 'Update Transaction' : 'New Transaction'"
    :description="
      isUpdate
        ? 'Edit transaction details in the database'
        : 'Add a new transaction to the database'
    "
    @update:open="emit('update:open', $event)">
    <UButton v-if="!isUpdate" label="New transaction" icon="tabler:plus" />

    <template #body>
      <UForm
        :schema="isUpdate ? transactionUpdateSchema : transactionInsertSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit">
        <UFormField label="Client" name="client">
          <USelect
            v-model="state.clientId"
            :items="mappedClients"
            class="w-full" />
        </UFormField>

        <UFormField label="Item" name="item">
          <USelect v-model="state.item" :items="items" class="w-full" />
        </UFormField>

        <UFormField
          label="Quantity"
          placeholder="Enter quantity"
          name="quantity">
          <UInputNumber v-model="state.quantity" class="w-full" />
        </UFormField>

        <UFormField label="Price" placeholder="Enter price" name="price">
          <UInputNumber v-model="state.price" class="w-full" />
        </UFormField>

        <UFormField label="Type" name="type">
          <USelect v-model="state.type" :items="types" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="isUpdate ? emit('update:open', false) : (open = false)" />
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
import {
  transactionUpdateSchema,
  transactionInsertSchema,
} from '~~/server/database/schema';
import {clientSelectSchema} from '~~/server/database/schema';

const toast = useToast();

type SelectSchema = z.output<typeof clientSelectSchema>;

const {data: clients} = useNuxtData<SelectSchema[]>('clients');

type UpdateSchema = z.output<typeof transactionUpdateSchema>;
type InsertSchema = z.output<typeof transactionInsertSchema>;
type Schema = InsertSchema | UpdateSchema;

const mappedClients = computed(() => {
  return (clients.value || []).map((client) => ({
    label: client.name,
    value: client.clientId,
  }));
});

const emit = defineEmits(['update:open']);

interface Props {
  open: boolean;
  transaction?: Partial<Schema>;
  isUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isUpdate: false,
});

const {open, transaction, isUpdate} = toRefs(props);
const state = shallowReactive<Partial<Schema>>({});

watchEffect(() => {
  if (transaction.value) Object.assign(state, transaction.value);
});

const items = ref([
  {label: 'Ballooon', value: 'balloon'},
  {label: 'Popper', value: 'popper'},
  {label: 'Confetti', value: 'confetti'},
  {label: 'Present', value: 'present'},
]);

const types = ref([
  {label: 'Loan', value: 'loan'},
  {label: 'Purchase', value: 'purchase'},
  {label: 'Gift', value: 'gift'},
  {label: 'Burn', value: 'burn'},
  {label: 'Airdrop', value: 'airdrop'},
]);

let previousTransactions = [];

const {data: transactions} = useNuxtData('transactions');

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  previousTransactions = [...(transactions.value || [])];

  const isUpdating = isUpdate.value;
  const transactionData = event.data;

  if (isUpdating) {
    transactions.value = (transactions.value || []).map(
      (transaction: Schema) => {
        if (
          'transactionId' in transaction &&
          'transactionId' in transactionData &&
          transaction.transactionId === transactionData.transactionId
        ) {
          return {...transaction, ...transactionData};
        }
        return transaction;
      }
    );
  } else {
    transactions.value = [...(transactions.value || []), transactionData];
  }

  try {
    await $fetch('/api/transaction', {
      method: isUpdating ? 'PATCH' : 'POST',
      body: transactionData,
    });

    toast.add({
      title: 'Success',
      description: `Transaction successfully ${
        isUpdating ? 'updated' : 'added'
      }.`,
    });

    refreshNuxtData('transactions');
  } catch (err: any) {
    transactions.value = previousTransactions;

    toast.add({
      title: 'Error',
      description:
        err.data?.message ||
        err.statusMessage ||
        `Failed to ${
          isUpdating ? 'update' : 'add'
        } transaction. Please try again later.`,
    });
  }

  emit('update:open', false);
};
</script>
