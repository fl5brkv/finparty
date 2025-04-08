<template>
  <TransactionsForm
    v-model:open="showUpdateModal"
    :transaction="selectedTransaction"
    :is-update="true" />

  <div
    class="h-16 flex items-center justify-between px-5 border-b border-(--ui-border-accented)">
    <h1 class="font-semibold">Clients</h1>
    <TransactionsForm v-model:open="showInsertModal" />
  </div>

  <div class="h-16 flex items-center justify-between px-5">
    <UInput
      v-model="globalFilter"
      placeholder="Filter through all fields..."
      icon="i-lucide-search" />

    <USelect
      v-model="statusFilter"
      :items="[
        {label: 'All', value: 'all'},
        {label: 'Purchase', value: 'purchase'},
        {label: 'Loan', value: 'loan'},
      ]"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
      placeholder="Filter status"
      class="min-w-28" />
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
    :loading="status === 'pending'"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0 px-5',
      thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
      td: 'border-b border-(--ui-border)',
    }" />

  <div class="flex items-center justify-between gap-3 mt-6">
    <div class="text-sm text-(--ui-text-muted)">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
      selected.
    </div>

    <div class="flex items-center gap-1.5 px-5">
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
    cell: ({row}) => {
      const color = {
        purchase: 'success' as const,
        loan: 'info' as const,
      }[row.original.type];

      return h(
        UBadge,
        {class: 'capitalize', variant: 'subtle', color},
        () => row.original.type
      );
    },
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

const statusFilter = ref('all');

watch(
  () => statusFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return;

    const statusColumn = table.value.tableApi.getColumn('type');
    if (!statusColumn) return;

    if (newVal === 'all') {
      statusColumn.setFilterValue(undefined);
    } else {
      statusColumn.setFilterValue(newVal);
    }
  }
);
</script>
