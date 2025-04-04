import {transactionInsertSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    transactionInsertSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  // await requireUserSession(event);

  const inserted = await useDrizzle()
    .insert(tables.transactions)
    .values(result.data)
    .returning({transactionId: tables.transactions.transactionId})
    .get();

  if (!inserted)
    throw createError({
      statusMessage: 'The data is invalid.',
      data: {message: 'The data is invalid.'},
    });

  return 'The transaction has been succesfully added!';
});
