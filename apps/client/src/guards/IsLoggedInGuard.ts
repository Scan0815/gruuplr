import { AccountService } from '../features/account/account.service';

export const IsLoggedInGuard = async () => {
  console.log('IsLoggedInGuard:');
  const isLoggedIn = AccountService.getInstance().isLoggedInValue(); // Replace this with actual login validation

  console.log('IsLoggedInGuard:',isLoggedIn);
  if (isLoggedIn) {
    return true;
  } else {
    return { redirect: '/login' }; // If a user is not logged in, they will be redirected to the /login page
  }
}