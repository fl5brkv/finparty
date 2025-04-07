import type {z} from 'zod';
import type {
  clientDeleteSchema,
  clientInsertSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from '~~/server/database/schema';

export const useClient = async () => {
  const toast = useToast();

  const clients = useState<z.infer<typeof clientSelectSchema>[] | null>(
    'clients',
    () => []
  );


  await useFetch('/api/client', {
    onResponse({response}) {
      clients.value = response._data;
    },
  });

  const insertClient = async (values: z.infer<typeof clientInsertSchema>) => {
    try {
      await $fetch('/api/client', {
        method: 'POST',
        body: values,
      });

      clients.value = [...clients.value, values];

      toast.add({
        title: 'Success',
        description: 'Client successfully added.',
      });
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description:
          err.data?.message ||
          err.statusMessage ||
          'Failed to add client. Please try again later.',
      });
    }
  };

  const updateClient = async (values: z.infer<typeof clientUpdateSchema>) => {
    try {
      await $fetch('/api/client', {
        method: 'PATCH',
        body: values,
      });

      clients.value =
        clients.value?.map((client) =>
          client.clientId === values.clientId ? {...client, ...values} : client
        ) || null;

      toast.add({
        title: 'Success',
        description: 'Client successfully updated.',
      });
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description:
          err.data?.message ||
          err.statusMessage ||
          'Failed to update client. Please try again later.',
      });
    }
  };

  const deleteClient = async (values: z.infer<typeof clientDeleteSchema>) => {
    try {
      await $fetch('/api/client', {
        method: 'DELETE',
        body: values,
      });

      clients.value =
        clients.value?.filter(
          (client) => client.clientId !== values.clientId
        ) || null;

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

  return {clients, insertClient, updateClient, deleteClient};
};
