<template>
  <TransactionsForm
    v-model:open="showUpdateModal"
    :transaction="selectedTransaction"
    :is-update="true" />

  <div class="flex flex-col h-screen">
    <div
      class="h-16 flex items-center justify-between px-3 md:px-5 border-b border-(--ui-border-accented)">
      <div class="flex items-center gap-2">
        <MyButton />
        <h1 class="font-semibold">Transactions</h1>
      </div>
      <TransactionsForm v-model:open="showInsertModal" />
    </div>

    <div class="h-16 flex items-center justify-between px-3 md:px-5">
      <UInput
        v-model="globalFilter"
        placeholder="Filter through all fields..."
        icon="i-lucide-search" />

      <div class="flex items-center gap-2.5">
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
        <USelect
          v-model="statusFilter"
          :items="[
            {label: 'Pending', value: 'pending'},
            {label: 'Appproved', value: 'approved'},
            {label: 'Completed', value: 'completed'},
            {label: 'Cancelled', value: 'cancelled'},
          ]"
          :ui="{
            trailingIcon:
              'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
          placeholder="Filter status"
          class="min-w-28" />
      </div>
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

  <UTooltip text="description">
    <UButton icon="lucide:download" variant="subtle" />
  </UTooltip>
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
import {UCheckbox, UTooltip} from '#components';
import {PDFDocument, rgb} from 'pdf-lib';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');

const toast = useToast();

type TransactionType = z.infer<typeof transactionSelectSchema>;

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

const getRowItems = (row: Row<TransactionType>) => {
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
          description: 'Client email copied to clipboard',
        });
      },
    },
    {
      label: 'Download data',
      icon: 'lucide:download',
      onSelect() {
        // generatePDF(row.original);
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Update transaction',
      icon: 'lucide:file-pen',
      onSelect() {
        selectedTransaction.value = row.original;
        showUpdateModal.value = true;
      },
    },
    {
      label: 'Delete transaction',
      icon: 'lucide:trash',
      color: 'error',
      onSelect() {
        deleteTransaction({transactionId: row.original.transactionId});
      },
    },
  ];
};

const columns: TableColumn<TransactionType>[] = [
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
    cell: ({row}: {row: {original: TransactionType}}) => row.original.email,
  },
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({row}) => {
      const text = row.original.product;
      return h('span', {}, productNames.value[text]);
    },
  },
  {
    accessorKey: 'amount',
    header: ({column}) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Amount',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      });
    },
    cell: ({row}: {row: {original: TransactionType}}) => {
      const amount = row.original.amount;
      return h('span', {}, `${amount} €`); // Append the Euro symbol to the amount
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}) => {
      const color = {
        pending: 'info' as const,
        approved: 'success' as const,
        completed: 'warning' as const,
        cancelled: 'error' as const,
      }[row.original.status];
      return h(
        UBadge,
        {class: 'capitalize', variant: 'subtle', color},
        () => row.original.status
      );
    },
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

const productNames = computed(() => {
  return {
    pinata_insurance: 'Piñata Insurance 🪅',
    confetti_investment: 'Confetti Investment 🎉',
    cake_loan: 'Cake Loan 🍰',
    balloon_bond: 'Balloon Bond 🎈',
  };
});

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

    const statusColumn = table.value.tableApi.getColumn('status');
    if (!statusColumn) return;

    if (newVal === 'all') {
      statusColumn.setFilterValue(undefined);
    } else {
      statusColumn.setFilterValue(newVal);
    }
  }
);

const selectedRows = computed<TransactionType[]>((): TransactionType[] => {
  return (
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) || []
  );
});

const generatePDF = async (values: TransactionType | TransactionType[]) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const {height} = page.getSize();

  let yPosition = height - 50;

  // Title
  page.drawText('Finparty', {
    x: 50,
    y: yPosition,
    size: 24,
  });

  yPosition -= 30;

  const isArray = Array.isArray(values);
  const transactions = isArray ? values : [values];

  // Header
  page.drawText(isArray ? 'Transactions List' : 'Transaction', {
    x: 50,
    y: yPosition,
    size: 18,
  });

  yPosition -= 30;

  // Transactions data
  transactions.forEach((transaction, index) => {
    if (yPosition < 50) {
      yPosition = height - 50;
    }

    // Adjust numbering for single transaction case
    const transactionNumber = isArray ? `${index + 1}. ` : '';
    const transactionInfo = `${transactionNumber}${transaction.email} ${transaction.product} - ${transaction.amount} - ${transaction.status}`;

    page.drawText(transactionInfo, {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
  });

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], {type: 'application/pdf'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = isArray ? 'transactions_list.pdf' : 'transaction.pdf';
  link.click();
};
</script>
