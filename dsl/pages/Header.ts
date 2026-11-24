import type { Locator, Page } from '@playwright/test';
import { exactly } from './amount';

/** En-tête commun à toutes les pages : titre, panier, boutons visibles de la page. */
export class Header {
  constructor(private readonly page: Page) {}

  private title(): Locator {
    return this.page.getByTestId('title');
  }

  /** Titre de la page courante, '' si la page n'en a pas (fiche produit). */
  async readTitle(): Promise<string> {
    if ((await this.title().count()) === 0) return '';
    return (await this.title().innerText()).trim();
  }

  /** Locator du titre quand il vaut exactement `title` (pour attendre une page). */
  titleIs(title: string): Locator {
    return this.title().filter({ hasText: exactly(title) });
  }

  async waitForTitle(title: string): Promise<void> {
    await this.titleIs(title).waitFor();
  }

  /** Nombre d'articles lu sur le badge, 0 si le badge est absent. */
  async readCartCount(): Promise<number> {
    const badge = this.page.getByTestId('shopping-cart-badge');
    if ((await badge.count()) === 0) return 0;
    return Number((await badge.innerText()).trim());
  }

  async clickCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }

  /** Libellés distincts des boutons visibles, hors menu latéral et bouton de fermeture d'erreur. */
  async readButtonLabels(): Promise<string[]> {
    const buttons = this.page.locator(
      'button:visible:not([id^="react-burger"]):not([data-test="error-button"])',
    );
    const labels = (await buttons.allInnerTexts()).map(l => l.trim()).filter(l => l !== '');
    return [...new Set(labels)];
  }
}
