import type {z} from 'zod';
import type {
  transactionDeleteSchema,
  transactionInsertSchema,
  transactionSelectSchema,
  transactionUpdateSchema,
} from '~~/server/database/schema';

export const useTransaction = async () => {
  const toast = useToast();

  const transactions = useState<
    z.infer<typeof transactionSelectSchema>[] | null
  >('transactions', () => []);

  await useFetch('/api/transaction', {
    onResponse({response}) {
      transactions.value = response._data;
    },
  });

  const insertTransaction = async (
    values: z.infer<typeof transactionInsertSchema>
  ) => {
    try {
      await $fetch('/api/transaction', {
        method: 'POST',
        body: values,
      });

      transactions.value = [...transactions.value, values];

      toast.add({
        title: 'Success',
        description: 'Transaction successfully added.',
      });
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description:
          err.data?.message ||
          err.statusMessage ||
          'Failed to add transaction. Please try again later.',
      });
    }
  };

  const updateTransaction = async (
    values: z.infer<typeof transactionUpdateSchema>
  ) => {
    try {
      await $fetch('/api/transaction', {
        method: 'PATCH',
        body: values,
      });

      transactions.value =
        transactions.value?.map((transaction) =>
          transaction.transactionId === values.transactionId
            ? {...transaction, ...values}
            : transaction
        ) || null;

      toast.add({
        title: 'Success',
        description: 'Transaction successfully updated.',
      });
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description:
          err.data?.message ||
          err.statusMessage ||
          'Failed to update transaction. Please try again later.',
      });
    }
  };

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
        ) || null;

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

  return {
    transactions,
    insertTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
