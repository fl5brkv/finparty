import {clientDeleteSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    clientDeleteSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  // await requireUserSession(event);

  const deleted = await useDrizzle()
    .delete(tables.clients)
    .where(eq(tables.clients.clientId, result.data.clientId));

  if (!deleted)
    throw createError({
      statusMessage: 'No clients were deleted',
      data: {message: 'No clients were deleted'},
    });

  return 'The client was succesfully deleted!';
});
