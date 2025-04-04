export default eventHandler(async (event) => {
  // const {
  //   user: {userId},
  // } = await requireUserSession(event);

  const userId = 1;

  // const selected = await useDrizzle()
  //   .select()
  //   .from(tables.clients)
  //   .where(eq(tables.clients.userId, userId))
  //   .leftJoin(
  //     tables.transactions,
  //     eq(tables.clients.clientId, tables.transactions.transactionId)
  //   )

  const selected = await useDrizzle().query.clients.findMany({
    with: {
      transactions: true,
    },
    where: eq(tables.clients.userId, userId),
  });
  
  return selected;
});
