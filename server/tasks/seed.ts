export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task',
  },
  async run() {
    console.log('Running DB seed task...');

    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    ];

    await useDrizzle().insert(tables.users).values(users);

    const clients = [
      {
        userId: 1,
        name: 'John Doe',
        email: 'john.client@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
      },
      {
        userId: 1,
        name: 'Jane Doe',
        email: 'jane.client@example.com',
        phone: '098-765-4321',
        address: '456 Elm St',
      },
      {
        userId: 2,
        name: 'Peter Doe',
        email: 'peter.client@example.com',
        phone: '175-757-4521',
        address: '789 Lawson St',
      },
    ];


    await useDrizzle().insert(tables.clients).values(clients);

    const transactions = [
      {
        clientId: 1,
        item: 'balloon',
        quantity: 5,
        price: 100,
        type: 'purchase',
      },
      {
        clientId: 2,
        item: 'popper',
        quantity: 10,
        price: 50,
        type: 'gift',
      },
      {
        clientId: 1,
        item: 'present',
        quantity: 2,
        price: 150,
        type: 'loan',
      },
    ];

    // @ts-ignore
    await useDrizzle().insert(tables.transactions).values(transactions);

    return {result: 'success'};
  },
});
