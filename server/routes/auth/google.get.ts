export default defineOAuthGoogleEventHandler({
  async onSuccess(event, {user}) {
    const inserted = await useDrizzle()
      .insert(tables.users)
      .values({
        name: user.name,
        email: user.email,
      })
      .onConflictDoUpdate({
        target: tables.users.email,
        set: {
          name: user.name,
        },
      })
      .returning({
        userId: tables.users.userId,
        email: tables.users.email,
        name: tables.users.name,
      })
      .get();

    if (!inserted)
      throw createError({
        statusMessage: 'There was an error on server',
        data: {message: 'There was an error on server'},
      });

    await replaceUserSession(event, {
      user: {
        userId: inserted.userId,
        email: inserted.email,
        name: inserted.name,
      },
    });

    return sendRedirect(event, '/dashboard');
  },

  onError(event, error) {
    console.warn('Google OAuth error:', error);
    return sendRedirect(event, '/');
  },
});
