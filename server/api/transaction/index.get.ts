export default eventHandler(async (event) => {
  // const {
  //   user: {userId},
  // } = await requireUserSession(event);

  const userId = 1;

  const selected = await useDrizzle()
    .select({
      transactionId: tables.transactions.transactionId,
      clientId: tables.clients.clientId,
      product: tables.transactions.product,
      amount: tables.transactions.amount,
      status: tables.transactions.status,
      email: tables.clients.email,
    })
    .from(tables.transactions)
    .innerJoin(
      tables.clients,
      eq(tables.transactions.clientId, tables.clients.clientId)
    )
    .where(eq(tables.clients.userId, userId));

  return selected;
});
