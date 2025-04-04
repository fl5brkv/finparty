export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, {user}) {
    const inserted = await useDrizzle()
      .insert(tables.users)
      .values({
        name: user.name || user.login, // Use 'user.name' if available, otherwise fallback to 'user.login'
        email: user.email,
      })
      .onConflictDoUpdate({
        target: tables.users.email, // Target the 'email' column for conflict check
        set: {
          name: user.name || user.login, // Update the 'name' field if there's a conflict
        },
      })
      .returning({
        userId: tables.users.userId,
        email: tables.users.email,
        name: tables.users.name,
      })
      .get();

    // Ensure user was inserted or updated successfully
    if (!inserted || !inserted.userId) {
      throw createError({
        statusMessage: 'There was an error on the server',
        data: {message: 'There was an error on the server'},
      });
    }

    // Update the session with the user details
    await replaceUserSession(event, {
      user: {
        userId: inserted.userId,
        email: inserted.email,
        name: inserted.name,
      },
    });

    // Redirect to the dashboard
    // return sendRedirect(event, '/dashboard');
  },

  onError(event, error) {
    console.warn('GitHub OAuth error:', error);
    return sendRedirect(event, '/');
  },
});
