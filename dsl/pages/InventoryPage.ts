import type { Locator, Page } from '@playwright/test';
import type { Product, ProductButton, ProductLabel } from '../types';
import { exactly, parseAmount } from './amount';

/** Page "Products" : le catalogue. */
export class InventoryPage {
  constructor(private readonly page: Page) {}

  private cards(): Locator {
    return this.page.getByTestId('inventory-list').getByTestId('inventory-item');
  }

  /** Carte du produit dont le nom est exactement `label`. */
  private card(label: ProductLabel): Locator {
    return this.cards().filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: exactly(label) }),
    });
  }

  /** Le vrai <button> de la carte (le nom et l'image sont des liens qui ont aussi role="button"). */
  private button(label: ProductLabel): Locator {
    return this.card(label).locator('button');
  }

  async readProducts(): Promise<Product[]> {
    await this.cards().first().waitFor();
    const products: Product[] = [];
    for (const card of await this.cards().all()) {
      products.push({
        label: (await card.getByTestId('inventory-item-name').innerText()).trim(),
        price: parseAmount(await card.getByTestId('inventory-item-price').innerText()),
      });
    }
    return products;
  }

  async readButton(label: ProductLabel): Promise<ProductButton> {
    return (await this.button(label).innerText()).trim() as ProductButton;
  }

  /** Clique "Add to cart" et attend que le bouton devienne "Remove". */
  async addToCart(label: ProductLabel): Promise<void> {
    await this.card(label).getByRole('button', { name: 'Add to cart' }).click();
    await this.card(label).getByRole('button', { name: 'Remove' }).waitFor();
  }

  async openDetails(label: ProductLabel): Promise<void> {
    await this.card(label).getByTestId('inventory-item-name').click();
  }
}
