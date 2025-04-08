export default eventHandler(async (event) => {
  // const {
  //   user: {userId},
  // } = await requireUserSession(event);

  const userId = 1;

  const selected = await useDrizzle()
    .select({
      transactionId: tables.transactions.transactionId,
      item: tables.transactions.item,
      quantity: tables.transactions.quantity,
      price: tables.transactions.price,
      type: tables.transactions.type,
      clientId: tables.clients.clientId,
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
