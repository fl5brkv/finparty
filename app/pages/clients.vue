<template>
  <ClientsInsert />

  <UTable :data="clients || []" :columns="columns" />
</template>

<script setup lang="ts">
import {h, resolveComponent} from 'vue';
import type {TableColumn} from '@nuxt/ui';
import type {Row} from '@tanstack/vue-table';
import type {z} from 'zod';
import type {clientSelectSchema} from '~~/server/database/schema';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');

const toast = useToast();

type clientsType = z.infer<typeof clientSelectSchema>;

const {clients, deleteClient} = await useClient();

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
      label: 'Delete item',
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
    header: 'Email',
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
</script>
