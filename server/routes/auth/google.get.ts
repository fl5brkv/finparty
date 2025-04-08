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

      console.log(user)
    await replaceUserSession(event, {
      user: {
        userId: inserted.userId,
        email: inserted.email,
        name: inserted.name,
        img: user.picture,
      },
    });

    return sendRedirect(event, '/clients');
  },

  onError(event, error) {
    console.warn('Google OAuth error:', error);
    return sendRedirect(event, '/clients');
  },
});
