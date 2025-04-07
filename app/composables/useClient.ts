import type {z} from 'zod';
import type {
  clientDeleteSchema,
  clientInsertSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from '~~/server/database/schema';

export const useClient = async () => {
  const clients = useState<z.infer<typeof clientSelectSchema>[] | null>(
    'clients',
    () => [] 
  );

  const res = ref<string | null>(null);

  const error = ref<string | null>(null);

  await useFetch('/api/client', {
    onResponse({response}) {
      clients.value = response._data;
    },
  });

  const insertClient = async (values: z.infer<typeof clientInsertSchema>) => {
    try {
      res.value = await $fetch('/api/client', {
        method: 'POST',
        body: values,
      });
    } catch (err: any) {
      error.value =
        err.data?.message ||
        err.statusMessage ||
        'Oops! Something went wrong. Please try again later.';
    }
  };

  const updateClient = async (values: z.infer<typeof clientUpdateSchema>) => {
    try {
      res.value = await $fetch('/api/client', {
        method: 'PATCH',
        body: values,
      });
      clients.value =
        clients.value?.map((client) =>
          client.clientId === values.clientId ? {...client, ...values} : client
        ) || null;
    } catch (err: any) {
      error.value =
        err.data?.message ||
        err.statusMessage ||
        'Oops! Something went wrong. Please try again later.';
    }
  };

  const deleteClient = async (values: z.infer<typeof clientDeleteSchema>) => {
    try {
      res.value = await $fetch('/api/client', {
        method: 'DELETE',
        body: {values},
      });
      clients.value =
        clients.value?.filter(
          (client) => client.clientId !== values.clientId
        ) || null;
    } catch (err: any) {
      error.value =
        err.data?.message ||
        err.statusMessage ||
        'Oops! Something went wrong. Please try again later.';
    }
  };

  return {res, clients, error, insertClient, updateClient, deleteClient};
};
