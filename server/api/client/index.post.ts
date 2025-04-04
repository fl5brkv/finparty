import {clientInsertSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    clientInsertSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  // const {
  //   user: {userId},
  // } = await requireUserSession(event);

  const userId = 1

  const inserted = await useDrizzle()
    .insert(tables.clients)
    .values({...result.data, userId})
    .returning({clientId: tables.clients.clientId})
    .get();

  if (!inserted)
    throw createError({
      statusMessage: 'The data is invalid.',
      data: {message: 'The data is invalid.'},
    });

  return 'The client has been succesfully added!';
});
