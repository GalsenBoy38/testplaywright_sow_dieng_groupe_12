import type { Locator, Page } from '@playwright/test';
import type { ProductDetails } from '../types';
import { parseAmount } from './amount';

/** Fiche d'un produit (inventory-item.html). */
export class ProductDetailsPage {
  constructor(private readonly page: Page) {}

  private details(): Locator {
    return this.page.getByTestId('inventory-container').getByTestId('inventory-item');
  }

  backButton(): Locator {
    return this.page.getByTestId('back-to-products');
  }

  /** Attend la fiche produit : "Back to products" n'existe que sur cette page (pas sur le catalogue). */
  async waitForDetails(): Promise<void> {
    await this.backButton().waitFor();
  }

  async readDetails(): Promise<ProductDetails> {
    const details = this.details();
    return {
      label: (await details.getByTestId('inventory-item-name').innerText()).trim(),
      description: (await details.getByTestId('inventory-item-desc').innerText()).trim(),
      price: parseAmount(await details.getByTestId('inventory-item-price').innerText()),
    };
  }

  async clickBackToProducts(): Promise<void> {
    await this.backButton().click();
  }
}
