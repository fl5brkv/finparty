export default eventHandler(async (event) => {
  const {
    user: {userId},
  } = await requireUserSession(event);

  const selected = await useDrizzle()
    .select()
    .from(tables.clients)
    .where(eq(tables.clients.userId, userId));

  return selected;
});
