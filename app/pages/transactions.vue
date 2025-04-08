<template>
  <TransactionsForm v-model:open="showInsertModal" />

  <TransactionsForm
    v-model:open="showUpdateModal"
    :transaction="selectedTransaction"
    :is-update="true" />

  <UTable :data="transactions || []" :columns="columns" />
</template>

<script setup lang="ts">
import {h, resolveComponent} from 'vue';
import type {TableColumn} from '@nuxt/ui';
import type {Row} from '@tanstack/vue-table';
import type {z} from 'zod';
import type {transactionSelectSchema} from '~~/server/database/schema';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');

const toast = useToast();

type transactionsType = z.infer<typeof transactionSelectSchema>;

const {transactions, deleteTransaction} = await useTransaction();

const showInsertModal = ref(false);
const showUpdateModal = ref(false);
const selectedTransaction = ref();

const getRowItems = (row: Row<transactionsType>) => {
  return [
    {
      type: 'label',
      label: 'Actions',
    },
    {
      label: 'Copy client email',
      icon: 'tabler:copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.email);
        toast.add({
          title: 'Copied to clipboard',
          description: 'Client email copied to clipboard',
        });
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Update transaction',
      icon: 'tabler:user',
      color: 'error',
      onSelect() {
        selectedTransaction.value = row.original;
        showUpdateModal.value = true;
      },
    },
    {
      label: 'Delete transaction',
      icon: 'tabler:trash',
      color: 'error',
      onSelect() {
        deleteTransaction({transactionId: row.original.transactionId});
      },
    },
  ];
};

const columns: TableColumn<transactionsType>[] = [
  {
    accessorKey: 'transactionId',
    header: 'Transaction ID',
    cell: ({row}: {row: {original: transactionsType}}) =>
      row.original.transactionId,
  },
  {
    accessorKey: 'email',
    header: ({column}) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Email',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      });
    },
    cell: ({row}: {row: {original: transactionsType}}) => row.original.email,
  },
  {
    accessorKey: 'item',
    header: 'Item',
    cell: ({row}: {row: {original: transactionsType}}) => row.original.item,
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({row}: {row: {original: transactionsType}}) => row.original.quantity,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({row}: {row: {original: transactionsType}}) => row.original.type,
  },
  {
    accessorKey: 'price',
    header: ({column}) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Price',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      });
    },
    cell: ({row}: {row: {original: transactionsType}}) => row.original.price,
  },
  {
    id: 'actions',
    cell: ({row}) => {
      return h(
        'div',
        {class: 'text-right'},
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end',
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown',
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown',
            })
        )
      );
    },
  },
];
</script>
