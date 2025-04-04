export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, {user}) {
    const inserted = await useDrizzle()
      .insert(tables.users)
      .values({
        name: user.name || user.login,
        email: user.email,
      })
      .onConflictDoNothing()
      .returning({
        userId: tables.users.userId,
        email: tables.users.email,
        name: tables.users.name,
      })
      .get();

    if (!inserted)
      throw createError({
        statusMessage: 'The email is invalid or already taken',
        data: {message: 'The email is invalid or already taken'},
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
    console.warn('GitHub OAuth error:', error);
    return sendRedirect(event, '/');
  },
});
