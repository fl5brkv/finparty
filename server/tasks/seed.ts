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
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
      },
    ];

    await useDrizzle().insert(tables.users).values(users);

    const clients = [
      {
        userId: 1, 
        name: 'John Doe Client 1',
        email: 'john.client1@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
      },
      {
        userId: 1,
        name: 'John Doe Client 2',
        email: 'john.client2@example.com',
        phone: '123-456-7891',
        address: '124 Main St',
      },
      {
        userId: 2, 
        name: 'Jane Doe Client 1',
        email: 'jane.client1@example.com',
        phone: '098-765-4321',
        address: '456 Elm St',
      },
      {
        userId: 2, 
        name: 'Jane Doe Client 2',
        email: 'jane.client2@example.com',
        phone: '098-765-4322',
        address: '457 Elm St',
      },
      {
        userId: 3, 
        name: 'Bob Smith Client',
        email: 'bob.client@example.com',
        phone: '555-555-5555',
        address: '789 Oak St',
      },
    ];

    await useDrizzle().insert(tables.clients).values(clients);

    const transactions = [
      {
        clientId: 1,
        product: 'pinata_insurance',
        amount: 100,
        status: 'pending',
      },
      {
        clientId: 1, 
        product: 'cake_loan',
        amount: 200,
        status: 'approved',
      },
      {
        clientId: 2, 
        product: 'balloon_bond',
        amount: 150,
        status: 'completed',
      },
      {
        clientId: 2, 
        product: 'pinata_insurance',
        amount: 120,
        status: 'pending',
      },
      {
        clientId: 3, 
        product: 'pinata_insurance',
        amount: 180,
        status: 'approved',
      },
      {
        clientId: 3, 
        product: 'cake_loan',
        amount: 250,
        status: 'completed',
      },
      {
        clientId: 4,
        product: 'balloon_bond',
        amount: 160,
        status: 'cancelled',
      },
      {
        clientId: 5, 
        product: 'pinata_insurance',
        amount: 130,
        status: 'approved',
      },
    ];

    // @ts-ignore
    await useDrizzle().insert(tables.transactions).values(transactions);

    return {result: 'success'};
  },
});
