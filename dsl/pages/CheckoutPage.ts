import type { Download, Locator, Page } from '@playwright/test';
import type { CustomerInfo, OrderSummary } from '../types';
import { parseAmount } from './amount';
import { readCartList } from './CartPage';

/** Les 3 pages de commande : Your Information, Overview, Complete!. */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // ---------- Checkout: Your Information ----------

  error(): Locator {
    return this.page.getByTestId('error');
  }

  /** Remplit les champs fournis (les autres restent vides) puis clique "Continue". */
  async submitInfo(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.page.getByTestId('firstName').fill(info.firstName);
    if (info.lastName !== undefined) await this.page.getByTestId('lastName').fill(info.lastName);
    if (info.postalCode !== undefined) await this.page.getByTestId('postalCode').fill(info.postalCode);
    await this.page.getByTestId('continue').click();
  }

  /** Libellés des champs du formulaire (leur placeholder), dans l'ordre. */
  async readFormFields(): Promise<string[]> {
    const fields = this.page.getByTestId('checkout-info-container').locator('input[placeholder]');
    await fields.first().waitFor();
    const labels: string[] = [];
    for (const field of await fields.all()) labels.push((await field.getAttribute('placeholder')) ?? '');
    return labels;
  }

  async readError(): Promise<string | null> {
    if ((await this.error().count()) === 0) return null;
    return (await this.error().innerText()).trim();
  }

  // ---------- Checkout: Overview ----------

  async readSummary(): Promise<OrderSummary> {
    const text = async (testId: string) => (await this.page.getByTestId(testId).innerText()).trim();
    await this.page.getByTestId('checkout-summary-container').waitFor();
    return {
      items: await readCartList(this.page),
      paymentInformation: await text('payment-info-value'),
      shippingInformation: await text('shipping-info-value'),
      itemTotal: parseAmount(await text('subtotal-label')),
      tax: parseAmount(await text('tax-label')),
      total: parseAmount(await text('total-label')),
    };
  }

  async clickFinish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  // ---------- Checkout: Complete! ----------

  async readConfirmation(): Promise<string> {
    return (await this.page.getByTestId('complete-header').innerText()).trim();
  }

  /** Clique "Generate PDF order" et renvoie le téléchargement déclenché. */
  async generatePdf(): Promise<Download> {
    const download = this.page.waitForEvent('download');
    await this.page.getByTestId('generate-pdf-order').click();
    return download;
  }
}
