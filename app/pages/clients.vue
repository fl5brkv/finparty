<template>
  <ClientsForm
    v-model:open="showUpdateModal"
    :client="selectedClient"
    :is-update="true" />

  <div class="flex flex-col h-screen">
    <div
      class="h-16 flex items-center justify-between px-3 md:px-5 border-b border-(--ui-border-accented)">
      <div class="flex items-center gap-2">
        <MyButton />
        <h1 class="font-semibold">Clients</h1>
      </div>

      <ClientsForm v-model:open="showInsertModal" />
    </div>

    <div class="h-16 flex items-center justify-between px-3 md:px-5">
      <UInput
        v-model="globalFilter"
        placeholder="Filter through all fields..."
        icon="i-lucide-search" />

      <UButton
        v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
        label="Download"
        variant="subtle"
        icon="lucide:download"
        @click="generatePDF(selectedRows)">
        <template #trailing>
          <UKbd>
            {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
          </UKbd>
        </template>
      </UButton>
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
        base: 'table-fixed border-separate border-spacing-0 px-3 md:px-5',
        thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
        td: 'border-b border-(--ui-border)',
      }" />

    <div
      class="flex items-center justify-between gap-3 px-3 md:px-5 mt-auto mb-4.5">
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
import {PDFDocument, rgb} from 'pdf-lib';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');

const toast = useToast();

type ClientType = z.infer<typeof clientSelectSchema>;

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

const getRowItems = (row: Row<ClientType>) => {
  return [
    {
      type: 'label',
      label: 'Actions',
    },
    {
      label: 'Copy email',
      icon: 'lucide:copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.email);
        toast.add({
          title: 'Copied to clipboard',
          description: 'Email copied to clipboard',
        });
      },
    },
    {
      label: 'Download data',
      icon: 'lucide:download',
      onSelect() {
        generatePDF(row.original);
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Update client',
      icon: 'lucide:user-pen',
      onSelect() {
        selectedClient.value = row.original;
        showUpdateModal.value = true;
      },
    },
    {
      label: 'Delete client',
      icon: 'lucide:trash',
      color: 'error',
      onSelect() {
        deleteClient({clientId: row.original.clientId});
      },
    },
  ];
};

const columns: TableColumn<ClientType>[] = [
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
    cell: ({row}: {row: {original: ClientType}}) => row.original.email,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({row}: {row: {original: ClientType}}) => row.original.name,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({row}: {row: {original: ClientType}}) => row.original.phone,
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({row}: {row: {original: ClientType}}) => row.original.address,
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
  pageSize: 11,
});

const globalFilter = ref('');

const selectedRows = computed<ClientType[]>((): ClientType[] => {
  return (
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) || []
  );
});

const generatePDF = async (values: ClientType | ClientType[]) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size (210mm x 297mm)
  const {height} = page.getSize();

  let yPosition = height - 50;

  // Title
  page.drawText('Finparty Financial Statement', {
    x: 50,
    y: yPosition,
    size: 20,
  });

  yPosition -= 30;

  // const logoImage = await pdfDoc.embedPng(logoBytes);
  // page.drawImage(logoImage, { x: 500, y: yPosition, width: 80, height: 80 });
  // yPosition -= 90;

  // Subheader
  const isArray = Array.isArray(values);
  page.drawText(isArray ? 'Client List' : 'Client Details', {
    x: 50,
    y: yPosition,
    size: 16,
  });

  yPosition -= 30;

  // Draw header row if it's a client list
  if (isArray) {
    page.drawText('Name', {
      x: 50,
      y: yPosition,
      size: 12,
    });
    page.drawText('Email', {
      x: 150,
      y: yPosition,
      size: 12,
    });
    page.drawText('Phone', {
      x: 300,
      y: yPosition,
      size: 12,
    });
    page.drawText('Address', {
      x: 400,
      y: yPosition,
      size: 12,
    });
    yPosition -= 20; // space for header
  }

  // Clients data
  const clients = isArray ? values : [values];
  clients.forEach((client, index) => {
    if (yPosition < 50) {
      yPosition = height - 50;
    }

    // Adjust numbering for single client case
    const clientNumber = isArray ? `${index + 1}. ` : '';
    const clientInfo = `${clientNumber}${client.name} - ${client.email} - ${client.phone} - ${client.address}`;

    if (isArray) {
      // If its a client list draw each item in columns
      page.drawText(client.name, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      page.drawText(client.email, {
        x: 150,
        y: yPosition,
        size: 10,
      });
      page.drawText(client.phone ? client.phone : 'N/A', {
        x: 300,
        y: yPosition,
        size: 10,
      });
      page.drawText(client.address ? client.address : 'N/A', {
        x: 400,
        y: yPosition,
        size: 10,
      });
    } else {
      page.drawText(clientInfo, {
        x: 50,
        y: yPosition,
        size: 12,
      });
    }

    yPosition -= 15;
  });

  // Add footer with page number
  page.drawText(`Page ${pdfDoc.getPageCount()}`, {
    x: 500,
    y: 30,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], {type: 'application/pdf'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = isArray ? 'clients_list.pdf' : 'client_details.pdf';
  link.click();
};
</script>
