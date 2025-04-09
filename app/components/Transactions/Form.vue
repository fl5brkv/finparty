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

        <UFormField label="Product" name="product">
          <USelect
            v-model="state.product"
            :items="products"
            class="w-full" />
        </UFormField>

        <UFormField label="Price" placeholder="Enter price" name="price">
          <UInputNumber v-model="state.amount" class="w-full" />
        </UFormField>

        <UFormField label="Type" name="status">
          <USelect v-model="state.status" :items="statuses" class="w-full" />
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

const products = ref([
  {label: 'Piñata Insurance 🪅', value: 'pinata_insurance'},
  {label: 'Confetti Investment 🎉', value: 'confetti_investment'},
  {label: 'Cake Loan 🍰', value: 'cake_loan'},
  {label: 'Balloon Bond 🎈', value: 'balloon_bond'},
]);

const statuses = ref([
  {label: 'Pending', value: 'pending'},
  {label: 'Approved', value: 'approved'},
  {label: 'Completed', value: 'completed'},
  {label: 'Cancelled', value: 'cancelled'},
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
