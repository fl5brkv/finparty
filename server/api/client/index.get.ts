export default eventHandler(async (event) => {
  const {
    user: {userId},
  } = await requireUserSession(event);

  const selected = await useDrizzle()
    .select({
      clientId: tables.clients.clientId,
      email: tables.clients.email,
      name: tables.clients.name,
      phone: tables.clients.phone,
      address: tables.clients.address,
    })
    .from(tables.clients)
    .where(eq(tables.clients.userId, userId))
  
  return selected;
});
