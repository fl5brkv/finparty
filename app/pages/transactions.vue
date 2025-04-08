<template>
  <TransactionsForm v-model:open="showInsertModal" />

  <TransactionsForm
    v-model:open="showUpdateModal"
    :transaction="selectedTransaction"
    :is-update="true" />

  <div class="w-full space-y-4 pb-4">
    <div class="flex px-4 py-3.5 border-b border-(--ui-border-accented)">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="transactions"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="status === 'pending'" />

    <div class="flex justify-center border-t border-(--ui-border) pt-4">
      <UPagination
        :default-page="
          (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
        "
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {h, resolveComponent} from 'vue';
import type {TableColumn} from '@nuxt/ui';
import {getPaginationRowModel, type Row} from '@tanstack/vue-table';
import type {z} from 'zod';
import type {
  transactionDeleteSchema,
  transactionSelectSchema,
} from '~~/server/database/schema';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');

const toast = useToast();

type transactionsType = z.infer<typeof transactionSelectSchema>;

const {data: transactions, status} = await useFetch('/api/transaction', {
  key: 'transactions',
  transform: (data) => {
    return (
      data?.map((transaction) => ({
        ...transaction,
      })) || []
    );
  },
  lazy: true,
});

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

const deleteTransaction = async (
  values: z.infer<typeof transactionDeleteSchema>
) => {
  try {
    await $fetch('/api/transaction', {
      method: 'DELETE',
      body: values,
    });

    transactions.value =
      transactions.value?.filter(
        (transaction) => transaction.transactionId !== values.transactionId
      ) || [];

    toast.add({
      title: 'Success',
      description: 'Transaction was successfully deleted.',
    });
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description:
        err.data?.message ||
        err.statusMessage ||
        'Oops! Something went wrong. Please try again later.',
    });
  }
};

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const globalFilter = ref('');
</script>
