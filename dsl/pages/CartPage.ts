import type { Locator, Page } from '@playwright/test';
import type { CartItem, ProductLabel } from '../types';
import { exactly, parseAmount } from './amount';

/** Lit les articles d'une liste "cart-list" (page Your Cart et page Checkout: Overview). */
export async function readCartList(page: Page): Promise<CartItem[]> {
  const rows = page.getByTestId('cart-list').getByTestId('inventory-item');
  const items: CartItem[] = [];
  for (const row of await rows.all()) {
    items.push({
      quantity: Number((await row.getByTestId('item-quantity').innerText()).trim()),
      label: (await row.getByTestId('inventory-item-name').innerText()).trim(),
      description: (await row.getByTestId('inventory-item-desc').innerText()).trim(),
      price: parseAmount(await row.getByTestId('inventory-item-price').innerText()),
    });
  }
  return items;
}

/** Page "Your Cart". */
export class CartPage {
  constructor(private readonly page: Page) {}

  private rows(): Locator {
    return this.page.getByTestId('cart-list').getByTestId('inventory-item');
  }

  private row(label: ProductLabel): Locator {
    return this.rows().filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: exactly(label) }),
    });
  }

  continueShoppingButton(): Locator {
    return this.page.getByTestId('continue-shopping');
  }

  async readItems(): Promise<CartItem[]> {
    await this.page.getByTestId('cart-list').waitFor();
    return readCartList(this.page);
  }

  async countItems(): Promise<number> {
    return this.rows().count();
  }

  /** Clique "Remove" sur l'article et attend qu'il disparaisse. */
  async remove(label: ProductLabel): Promise<void> {
    const row = this.row(label);
    await row.getByRole('button', { name: 'Remove' }).click();
    await row.waitFor({ state: 'detached' });
  }

  /** Retire le premier article de la liste et attend qu'il y en ait un de moins. */
  async removeFirst(): Promise<void> {
    const before = await this.countItems();
    await this.rows().first().getByRole('button', { name: 'Remove' }).click();
    await this.rows().nth(before - 1).waitFor({ state: 'detached' });
  }

  async clickContinueShopping(): Promise<void> {
    await this.continueShoppingButton().click();
  }

  async clickCheckout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }
}
