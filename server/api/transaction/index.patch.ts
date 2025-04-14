import {transactionUpdateSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    transactionUpdateSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  await requireUserSession(event);

  const updated = await useDrizzle()
    .update(tables.transactions)
    .set(result.data)
    .where(eq(tables.transactions.transactionId, result.data.transactionId));

  if (!updated)
    throw createError({
      statusMessage: 'The data is invalid.',
      data: {message: 'The data is invalid.'},
    });

  return 'The transaction has been succesfully added!';
});
