import {transactionDeleteSchema} from '~~/server/database/schema';

export default eventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    transactionDeleteSchema.safeParse(body)
  );

  if (!result.success)
    throw createError({
      statusMessage: 'The provided data is invalid',
      data: {message: 'The provided data is invalid'},
    });

  // await requireUserSession(event);

  const deleted = await useDrizzle()
    .delete(tables.transactions)
    .where(eq(tables.transactions.transactionId, result.data.transactionId));

  if (!deleted)
    throw createError({
      statusMessage: 'No transactions were deleted',
      data: {message: 'No transactions were deleted'},
    });

  return 'The transaction was succesfully deleted!';
});
