export const IsLoggedInGuard = () => {
  // Replace this with actual login validation (for example, check for a token)
  const isLoggedIn = !!localStorage.getItem('token');
  if (isLoggedIn) {
    return true;
  } else {
    return { redirect: '/login' };
  }
};