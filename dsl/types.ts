// Types métier du DSL : voir docs/dsl-glossaire.md §5 et docs/strategie-tests.md §4.

/** Nom affiché d'un produit : identifiant du produit et de l'article. */
export type ProductLabel = string;

/** Titres des pages traversées par les scénarios. */
export type PageTitle =
  | 'Products'
  | 'Your Cart'
  | 'Checkout: Your Information'
  | 'Checkout: Overview'
  | 'Checkout: Complete!';

/** Une référence du catalogue. */
export interface Product {
  label: ProductLabel;
  price: number; // 29.99, sans "$"
}

/** Fiche complète d'un produit. */
export interface ProductDetails extends Product {
  description: string;
}

/** Bouton perçu sur la carte d'un produit. */
export type ProductButton = 'Add to cart' | 'Remove';

/** Une ligne du panier : un produit choisi par l'utilisateur. */
export interface CartItem {
  quantity: number; // toujours 1 sur Sauce Demo
  label: ProductLabel;
  description: string;
  price: number;
}

/** Informations saisies avant la commande. Un champ absent = laissé vide. */
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Ce que l'utilisateur va commander, avant validation. */
export interface OrderSummary {
  items: CartItem[];
  paymentInformation: string; // "SauceCard #31337"
  shippingInformation: string; // "Free Pony Express Delivery!"
  itemTotal: number;
  tax: number;
  total: number;
}

/** Destinataire imprimé sur la facture. */
export interface ShipTo {
  name: string; // "Jean LECOQ"
  postalCode: string; // "75000"
}

/** Une ligne de la facture. */
export interface InvoiceLine {
  label: ProductLabel;
  price: number;
}

/** La facture PDF "Order Receipt". */
export interface Invoice {
  fileName: string; // "swag-labs-order-<date>.pdf"
  orderDate: string;
  shipTo: ShipTo;
  lines: InvoiceLine[];
  itemTotal: number;
  tax: number;
  total: number;
}

/** Le DSL : ce que l'utilisateur fait (actions) et ce qu'il perçoit (perceptions). */
export interface UserDSL {
  // ---------- Actions : ce que l'utilisateur fait ----------
  loginAsStandardUser(): Promise<void>; // contexte commun, appelée par la fixture
  addToCart(...labels: ProductLabel[]): Promise<void>;
  removeFromCart(...labels: ProductLabel[]): Promise<void>;
  emptyCart(): Promise<void>;
  openProductDetails(label: ProductLabel): Promise<void>;
  backToProducts(): Promise<void>;
  openCart(): Promise<void>;
  startCheckout(): Promise<void>;
  submitCustomerInfo(info: Partial<CustomerInfo>): Promise<void>;
  finishOrder(): Promise<void>;
  generateInvoice(): Promise<void>;

  // ---------- Perceptions : ce que l'utilisateur perçoit ----------
  getPerceivedPageTitle(): Promise<PageTitle>;
  getPerceivedProducts(): Promise<Product[]>;
  getPerceivedProductButton(label: ProductLabel): Promise<ProductButton>;
  getPerceivedCartCount(): Promise<number>;
  getPerceivedCartItems(): Promise<CartItem[]>;
  getPerceivedProductDetails(): Promise<ProductDetails>;
  getPerceivedButtons(): Promise<string[]>;
  getPerceivedFormFields(): Promise<string[]>;
  getPerceivedErrorMessage(): Promise<string | null>;
  getPerceivedOrderSummary(): Promise<OrderSummary>;
  getPerceivedConfirmation(): Promise<string>;
  getPerceivedInvoice(): Promise<Invoice>;
}
