# Stratégie de tests IHM : Sauce Demo

> Groupe 12 : Fatimatou SOW et Ahmadou DIENG
> Site testé : <https://www.saucedemo.com/>
> Entrées : [scenarios.md](scenarios.md) · [actions.md](actions.md) · [perceptions.md](perceptions.md)
> DSL : [dsl-glossaire.md](dsl-glossaire.md) · [dsl-actions-perceptions.md](dsl-actions-perceptions.md)

## 1. Production des cas de test

1. **Identifier les tâches utilisateur** sur le site : 8 scénarios, validés par l'enseignant ([scenarios.md](scenarios.md)).
2. **Relever sur le site** les actions de l'utilisateur ([actions.md](actions.md)) et ce qu'il perçoit ([perceptions.md](perceptions.md)), connecté avec `standard_user`.
3. **Fixer le vocabulaire** dans un glossaire : un mot = un concept, en particulier **produit ≠ article** ([dsl-glossaire.md](dsl-glossaire.md)).
4. **Écrire chaque scénario en GIVEN / WHEN / THEN** en langage naturel.
5. **Associer chaque étape à une méthode du DSL** : action pour le WHEN, perceptions pour le GIVEN et le THEN ([dsl-actions-perceptions.md](dsl-actions-perceptions.md)).
6. **Traduire** chaque scénario en test TypeScript qui se lit comme le scénario, en couvrant le cas nominal, les cas limites (panier vidé, badge absent) et les cas d'erreur (champ manquant).

## 2. Raison d'être des tests

Sauce Demo est une boutique en ligne : un utilisateur connecté parcourt un catalogue,
remplit un panier, passe commande et obtient une facture. Les tests vérifient que
**ce que l'utilisateur perçoit** après chaque tâche est correct :

- **Le panier reflète les choix** : le badge, avec les boutons *Add to cart* / *Remove* et la page *Your Cart* disent la même chose dans les scénarios (S1, S2, S4, S8).
- **L'information produit est fidèle** : la fiche produit reprend le nom et le prix du catalogue (S3).
- **Le parcours de commande guide l'utilisateur** : il est bloqué tant qu'une information manque, avec un message qui dit laquelle (S5).
- **Les montants sont justes** : sous-total = somme des prix, taxe = 8 %, total = sous-total + taxe (S6).
- **La commande laisse une trace exacte** : la facture PDF reprend le destinataire, les articles et les montants (S7).

Ce que les tests **ne couvrent pas** : les autres comptes (`locked_out_user`, `problem_user`…)

## 3. Correspondance tâches / concepts / DSL

| Scénario | Tâche utilisateur | Concepts ([glossaire](dsl-glossaire.md)) | Actions | Perceptions |
|---|---|---|---|---|
| S1 | ajouter un produit au panier | Produit, Article, Bouton d'un produit, Nombre d'articles | `addToCart`, `openCart` | `getPerceivedProducts`, `getPerceivedProductButton`, `getPerceivedCartCount`, `getPerceivedCartItems` |
| S2 | supprimer un produit du panier | Article ≠ Produit, Panier | `addToCart`, `openCart`, `removeFromCart`, `backToProducts` | `getPerceivedCartItems`, `getPerceivedCartCount`, `getPerceivedProducts`, `getPerceivedProductButton` |
| S3 | afficher les détails d'un produit | Produit, Fiche produit, Prix | `openProductDetails` | `getPerceivedProducts`, `getPerceivedProductDetails`, `getPerceivedButtons` |
| S4 | consulter le panier | Panier, Article, Quantité | `addToCart`, `openCart` | `getPerceivedCartCount`, `getPerceivedPageTitle`, `getPerceivedCartItems`, `getPerceivedButtons` |
| S5 | saisir ses informations | Informations client, Message d'erreur | `addToCart`, `startCheckout`, `submitCustomerInfo` | `getPerceivedPageTitle`, `getPerceivedFormFields`, `getPerceivedErrorMessage` |
| S6 | afficher le récapitulatif | Récapitulatif, Sous-total, Taxe, Total | `addToCart`, `startCheckout`, `submitCustomerInfo` | `getPerceivedPageTitle`, `getPerceivedOrderSummary`, `getPerceivedButtons` |
| S7 | générer la facture | Confirmation, Facture, Destinataire | `addToCart`, `startCheckout`, `submitCustomerInfo`, `finishOrder`, `generateInvoice` | `getPerceivedOrderSummary`, `getPerceivedConfirmation`, `getPerceivedCartCount`, `getPerceivedInvoice`, `getPerceivedPageTitle` |
| S8 | vider le panier | Panier vide, Nombre d'articles | `addToCart`, `openCart`, `emptyCart` | `getPerceivedCartItems`, `getPerceivedCartCount` |

## 4. Interface TypeScript du DSL

```ts
// dsl/types.ts

export interface UserDSL {
  // Actions : ce que l'utilisateur fait
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

  // Perceptions : ce que l'utilisateur perçoit
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
```

Règles de l'interface :

1. Une **action** renvoie `Promise<void>` et attend que l'écran soit stable avant de rendre la main.
2. Une **perception** renvoie une donnée métier.
3. Les paramètres sont des **données métier** (`ProductLabel`, `CustomerInfo`).
4. Les noms suivent le [glossaire](dsl-glossaire.md) : *produit* en entrée de `addToCart`, *article* en sortie de `getPerceivedCartItems`.

## 5. Stratégie d'implémentation

### 5.1 Architecture

```
tests/
  cart.spec.ts
  product.spec.ts
  checkout.spec.ts
dsl/
  types.ts
  User.ts
  fixtures.ts
  pages/
    LoginPage.ts  Header.ts  InventoryPage.ts  ProductDetailsPage.ts
    CartPage.ts  CheckoutPage.ts  InvoiceReader.ts
    amount.ts
```

| Fichier | Responsabilité |
|---|---|
| `LoginPage` | se connecter avec `standard_user` / `secret_sauce` |
| `Header` | titre de la page, badge du panier, icône du panier |
| `InventoryPage` | cartes produits : nom, prix, bouton ; ouvrir une fiche |
| `ProductDetailsPage` | nom, description, prix ; *Back to products* |
| `CartPage` | lignes du panier ; *Remove*, *Continue Shopping*, *Checkout* |
| `CheckoutPage` | formulaire, message d'erreur, récapitulatif, *Finish*, confirmation, *Generate PDF order* |
| `InvoiceReader` | lire le PDF téléchargé et le transformer en `Invoice` |

### 5.2 Sélecteurs

Le site expose des attributs `data-test`. On les utilise via `getByTestId` en ajoutant
dans [`playwright.config.ts`](../playwright.config.ts) :

```ts
use: {
  baseURL: 'https://www.saucedemo.com/',
  testIdAttribute: 'data-test',
  trace: 'on-first-retry',
},
```

### 5.3 Fixture `user`

```ts
// dsl/fixtures.ts
import { test as base, expect } from '@playwright/test';
import { User } from './User';

export const test = base.extend<{ user: User }>({
  user: async ({ page }, use, testInfo) => {
    const user = new User(page, testInfo);
    await user.loginAsStandardUser();
    await use(user);
  },
});

export { expect };
export type { CustomerInfo } from './types';
```

`testInfo` donne au DSL le dossier propre au test, où `generateInvoice()` enregistre la facture PDF (S7).

Chaque test part d'un navigateur neuf : panier vide, aucune dépendance entre tests,
exécution parallèle possible (`fullyParallel: true`).

### 5.4 Perceptions : données et attente

Les perceptions lisent l'écran et renvoient des **données métier** : les prix `"$29.99"` deviennent `29.99`,
un badge absent vaut `0`. Ce sont les **actions** qui attendent que l'écran soit stable (par exemple,
`addToCart` attend que le bouton passe à *Remove*) : les tests n'ont donc jamais besoin de `waitForTimeout`.

### 5.5 Facture PDF (S7)

`generateInvoice()` clique *Generate PDF order* et enregistre le PDF téléchargé. `getPerceivedInvoice()` le lit
avec `pdf-parse` et en extrait la date, le destinataire, les articles et les montants. Le test compare ces données
au récapitulatif, jamais le PDF brut. Si le format du PDF change, seul `InvoiceReader` est à adapter.

### 5.6 Exécution

```bash
npm install
npx playwright install            # navigateurs, la première fois
npx playwright test               # 11 tests (8 scénarios) × chromium, firefox, webkit = 33
npx playwright test --project=chromium
npx playwright test --ui          # mode interactif
npx playwright show-report        # rapport HTML
```

En CI (`.github/workflows/playwright.yml`) : `retries: 2`, `workers: 1`, rapport HTML en artefact.

