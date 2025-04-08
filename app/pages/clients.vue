<template>
  <ClientsForm v-model:open="showInsertModal" />

  <ClientsForm
    v-model:open="showUpdateModal"
    :client="selectedClient"
    :is-update="true" />
  <div class="w-full space-y-4 pb-4">
    <div class="flex px-4 py-3.5 border-b border-(--ui-border-accented)">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="clients || []"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }" />

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
import type {clientSelectSchema} from '~~/server/database/schema';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');

const toast = useToast();

type clientsType = z.infer<typeof clientSelectSchema>;

const {clients, deleteClient} = await useClient();

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
    accessorKey: 'email',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

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
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

const globalFilter = ref('');
</script>
