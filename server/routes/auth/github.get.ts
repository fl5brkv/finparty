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
      .onConflictDoUpdate({
        target: tables.users.email,
        set: {
          name: user.name || user.login,
        },
      })
      .returning({
        userId: tables.users.userId,
        email: tables.users.email,
        name: tables.users.name,
      })
      .get();

    if (!inserted || !inserted.userId) {
      throw createError({
        statusMessage: 'There was an error on the server',
        data: {message: 'There was an error on the server'},
      });
    }

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
