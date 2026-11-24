import type { Page, TestInfo } from '@playwright/test';
import type {
  CartItem,
  CustomerInfo,
  Invoice,
  OrderSummary,
  PageTitle,
  Product,
  ProductButton,
  ProductDetails,
  ProductLabel,
  UserDSL,
} from './types';
import { LoginPage } from './pages/LoginPage';
import { Header } from './pages/Header';
import { InventoryPage } from './pages/InventoryPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { readInvoice } from './pages/InvoiceReader';

/**
 * L'utilisateur de Sauce Demo, au niveau des tâches.
 * - Les actions attendent que l'écran soit stable avant de rendre la main.
 * - Les perceptions lisent la page courante et renvoient des données, jamais des Locator.
 */
export class User implements UserDSL {
  private readonly login: LoginPage;
  private readonly header: Header;
  private readonly inventory: InventoryPage;
  private readonly productDetails: ProductDetailsPage;
  private readonly cart: CartPage;
  private readonly checkout: CheckoutPage;

  /** Dernière facture téléchargée par generateInvoice(). */
  private invoiceFile: { path: string; fileName: string } | null = null;

  constructor(page: Page, private readonly testInfo: TestInfo) {
    this.login = new LoginPage(page);
    this.header = new Header(page);
    this.inventory = new InventoryPage(page);
    this.productDetails = new ProductDetailsPage(page);
    this.cart = new CartPage(page);
    this.checkout = new CheckoutPage(page);
  }

  // ======================= Contexte commun =======================

  /** Se connecter avec standard_user : l'utilisateur voit la page Products. */
  async loginAsStandardUser(): Promise<void> {
    await this.login.login('standard_user', 'secret_sauce');
    await this.header.waitForTitle('Products');
  }

  // ======================= Actions =======================

  async addToCart(...labels: ProductLabel[]): Promise<void> {
    for (const label of labels) await this.inventory.addToCart(label);
  }

  async removeFromCart(...labels: ProductLabel[]): Promise<void> {
    await this.ensureOnCart();
    for (const label of labels) await this.cart.remove(label);
  }

  async emptyCart(): Promise<void> {
    await this.ensureOnCart();
    while ((await this.cart.countItems()) > 0) await this.cart.removeFirst();
  }

  async openProductDetails(label: ProductLabel): Promise<void> {
    await this.inventory.openDetails(label);
    await this.productDetails.waitForDetails();
  }

  /** Revient au catalogue depuis la fiche produit ("Back to products") ou le panier ("Continue Shopping"). */
  async backToProducts(): Promise<void> {
    if (await this.cart.continueShoppingButton().isVisible()) {
      await this.cart.clickContinueShopping();
    } else {
      await this.productDetails.clickBackToProducts();
    }
    await this.header.waitForTitle('Products');
  }

  async openCart(): Promise<void> {
    await this.header.clickCart();
    await this.header.waitForTitle('Your Cart');
  }

  async startCheckout(): Promise<void> {
    await this.ensureOnCart();
    await this.cart.clickCheckout();
    await this.header.waitForTitle('Checkout: Your Information');
  }

  /** Saisit les informations fournies puis "Continue" : attend la page Overview ou un message d'erreur. */
  async submitCustomerInfo(info: Partial<CustomerInfo>): Promise<void> {
    await this.checkout.submitInfo(info);
    await this.checkout.error().or(this.header.titleIs('Checkout: Overview')).first().waitFor();
  }

  async finishOrder(): Promise<void> {
    await this.checkout.clickFinish();
    await this.header.waitForTitle('Checkout: Complete!');
  }

  /** "Generate PDF order" : le PDF téléchargé est enregistré dans le dossier de résultats du test. */
  async generateInvoice(): Promise<void> {
    const download = await this.checkout.generatePdf();
    const fileName = download.suggestedFilename();
    const path = this.testInfo.outputPath(fileName);
    await download.saveAs(path);
    this.invoiceFile = { path, fileName };
    // pièce jointe : la facture s'ouvre depuis le mode --ui et le rapport HTML
    await this.testInfo.attach(fileName, { path, contentType: 'application/pdf' });
  }

  // ======================= Perceptions =======================

  async getPerceivedPageTitle(): Promise<PageTitle> {
    return (await this.header.readTitle()) as PageTitle;
  }

  async getPerceivedProducts(): Promise<Product[]> {
    return this.inventory.readProducts();
  }

  async getPerceivedProductButton(label: ProductLabel): Promise<ProductButton> {
    return this.inventory.readButton(label);
  }

  async getPerceivedCartCount(): Promise<number> {
    return this.header.readCartCount();
  }

  async getPerceivedCartItems(): Promise<CartItem[]> {
    return this.cart.readItems();
  }

  async getPerceivedProductDetails(): Promise<ProductDetails> {
    return this.productDetails.readDetails();
  }

  async getPerceivedButtons(): Promise<string[]> {
    return this.header.readButtonLabels();
  }

  async getPerceivedFormFields(): Promise<string[]> {
    return this.checkout.readFormFields();
  }

  async getPerceivedErrorMessage(): Promise<string | null> {
    return this.checkout.readError();
  }

  async getPerceivedOrderSummary(): Promise<OrderSummary> {
    return this.checkout.readSummary();
  }

  async getPerceivedConfirmation(): Promise<string> {
    return this.checkout.readConfirmation();
  }

  async getPerceivedInvoice(): Promise<Invoice> {
    if (!this.invoiceFile) throw new Error('Aucune facture : appeler generateInvoice() avant.');
    return readInvoice(this.invoiceFile.path, this.invoiceFile.fileName);
  }

  // ======================= Outils internes =======================

  private async ensureOnCart(): Promise<void> {
    if ((await this.header.readTitle()) !== 'Your Cart') await this.openCart();
  }
}
