import { test as base, expect } from '@playwright/test';
import { User } from './User';

/** Fixture `user` : l'utilisateur standard_user est connecté et voit la page Products. */
export const test = base.extend<{ user: User }>({
  user: async ({ page }, use, testInfo) => {
    const user = new User(page, testInfo);
    await user.loginAsStandardUser();
    await use(user);
  },
});

export { expect };
export type { CustomerInfo } from './types';
