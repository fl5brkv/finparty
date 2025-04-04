import {clientUpdateSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    clientUpdateSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  // await requireUserSession(event);

  const updated = await useDrizzle()
    .update(tables.clients)
    .set(result.data)
    .where(eq(tables.clients.clientId, result.data.clientId));

  if (!updated)
    throw createError({
      statusMessage: 'The data is invalid.',
      data: {message: 'The data is invalid.'},
    });

  return 'The client has been succesfully updated!';
});
