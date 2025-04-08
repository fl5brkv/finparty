<template>
  <ClientsForm
    v-model:open="showUpdateModal"
    :client="selectedClient"
    :is-update="true" />

  <div
    class="h-16 flex items-center justify-between px-5 border-b border-(--ui-border-accented)">
    <h1 class="font-semibold">Clients</h1>
    <ClientsForm v-model:open="showInsertModal" />
  </div>

  <div class="h-16 flex items-center justify-between px-5">
    <UInput
      v-model="globalFilter"
      placeholder="Filter through all fields..."
      icon="i-lucide-search" />
  </div>

  <UTable
    ref="table"
    v-model:pagination="pagination"
    v-model:global-filter="globalFilter"
    :data="clients"
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

  <div class="flex items-center justify-between gap-3 mt-6 px-5">
    <div class="text-sm text-(--ui-text-muted)">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
      selected.
    </div>

    <div class="flex items-center gap-1.5">
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
import {UCheckbox} from '#components';
import {getPaginationRowModel, type Row} from '@tanstack/vue-table';
import type {z} from 'zod';
import type {
  clientDeleteSchema,
  clientSelectSchema,
} from '~~/server/database/schema';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');

const toast = useToast();

type clientsType = z.infer<typeof clientSelectSchema>;

const {data: clients, status} = await useFetch('/api/client', {
  key: 'clients',
  transform: (data) => {
    return (
      data?.map((client) => ({
        ...client,
      })) || []
    );
  },
  lazy: true,
});

const showInsertModal = ref(false);
const showUpdateModal = ref(false);
const selectedClient = ref();

const getRowItems = (row: Row<clientsType>) => {
  return [
    {
      type: 'label',
      label: 'Actions',
    },
    {
      label: 'Copy email',
      icon: 'tabler:copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.email);
        toast.add({
          title: 'Copied to clipboard',
          description: 'Email copied to clipboard',
        });
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Update client',
      icon: 'tabler:user',
      color: 'error',
      onSelect() {
        selectedClient.value = row.original;
        showUpdateModal.value = true;
      },
    },
    {
      label: 'Delete client',
      icon: 'tabler:trash',
      color: 'error',
      onSelect() {
        deleteClient({clientId: row.original.clientId});
      },
    },
  ];
};

const columns: TableColumn<clientsType>[] = [
  {
    id: 'select',
    header: ({table}) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all',
      }),
    cell: ({row}) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        ariaLabel: 'Select row',
      }),
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
    cell: ({row}: {row: {original: clientsType}}) => row.original.email,
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({row}: {row: {original: clientsType}}) => row.original.firstName,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({row}: {row: {original: clientsType}}) => row.original.lastName,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({row}: {row: {original: clientsType}}) => row.original.phone,
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({row}: {row: {original: clientsType}}) => row.original.address,
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

const deleteClient = async (values: z.infer<typeof clientDeleteSchema>) => {
  try {
    await $fetch('/api/client', {
      method: 'DELETE',
      body: values,
    });

    clients.value =
      clients.value?.filter((client) => client.clientId !== values.clientId) ||
      [];

    toast.add({
      title: 'Success',
      description: 'Client was successfully deleted.',
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

const selectedRows = computed(() => {
  return (
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) || []
  );
});
</script>
