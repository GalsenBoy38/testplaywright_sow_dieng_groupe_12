# Tests IHM de Sauce Demo avec Playwright et un DSL

## Binôme (groupe 12)

| Nom | Prénom |
|---|---|
| SOW | Fatimatou |
| DIENG | Ahmadou |



## 📋 Contexte

Ce projet contient des tests **End-to-End** de la boutique en ligne de démonstration **[https://www.saucedemo.com/](https://www.saucedemo.com/)**, écrits avec **Playwright Test** (TypeScript).

Les tests sont en **boîte noire** : ils simulent ce que fait un utilisateur et vérifient **ce qu'il perçoit** à l'écran, sans connaître le code du site.

Ils sont écrits en **cas d'usage** (GIVEN / WHEN / THEN), avec le vocabulaire de l'utilisateur, et passent par un **DSL** (Domain Specific Language) : un test ne contient jamais `page`, `locator` ou `click`, seulement des actions et des perceptions de l'utilisateur.

```ts
test('S2 - supprimer un produit du panier', async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie');
  await user.openCart();
  expect(await user.getPerceivedCartCount()).toBe(3);
  // WHEN
  await user.removeFromCart('Sauce Labs Bike Light');
  // THEN
  const items = await user.getPerceivedCartItems();
  expect(items.map(i => i.label)).toEqual(['Sauce Labs Backpack', 'Sauce Labs Onesie']);
  expect(await user.getPerceivedCartCount()).toBe(2);
});
```

## 🎯 Stratégie

Stratégie complète : **[docs/strategie-tests.md](docs/strategie-tests.md)**.

### Production des cas de test

1.  **Identifier les tâches utilisateur** sur le site → 8 scénarios, validés par l'enseignant, écrits en **GIVEN / WHEN / THEN** en langage naturel ([docs/scenarios.md](docs/scenarios.md)).
2.  **Relever sur le site** les actions de l'utilisateur ([docs/actions.md](docs/actions.md)) et ce qu'il perçoit ([docs/perceptions.md](docs/perceptions.md)), connecté avec `standard_user`.
3.  **Fixer le vocabulaire** dans un glossaire : un mot = un concept, en particulier **produit ≠ article** ([docs/dsl-glossaire.md](docs/dsl-glossaire.md)).
4.  **Écrire chaque scénario en GIVEN / WHEN / THEN** et associer chaque étape à une méthode du DSL ([docs/dsl-actions-perceptions.md](docs/dsl-actions-perceptions.md)).
5.  **Couvrir** le cas nominal, les cas limites (panier vidé, badge absent) et les cas d'erreur (champ manquant).
6.  **Traduire** chaque scénario en test TypeScript qui se lit comme le scénario.

### Raison d'être des tests

-   **Le panier reflète les choix** de l'utilisateur : badge, boutons *Add to cart* / *Remove* et page *Your Cart* disent la même chose (S1, S2, S4, S8).
-   **L'information produit est fidèle** : la fiche reprend le nom et le prix du catalogue (S3).
-   **Le parcours de commande guide l'utilisateur** : il est bloqué tant qu'une information manque, avec un message qui dit laquelle (S5).
-   **Les montants sont justes** : sous-total = somme des prix, taxe = 8 %, total = sous-total + taxe (S6).
-   **La commande laisse une trace exacte** : la facture PDF reprend le destinataire, les articles et les montants (S7).

Non couverts : les autres comptes (`locked_out_user`, `problem_user`…)


## 🏗️ Le site testé

| Page (titre affiché) | Ce que l'utilisateur y fait |
|---|---|
| Connexion | se connecte (`standard_user` / `secret_sauce`) |
| **Products** | voit les 6 produits, en ajoute au panier, ouvre une fiche produit |
| Fiche produit | voit nom, description, prix ; *Add to cart*, *Back to products* |
| **Your Cart** | voit ses articles ; *Remove*, *Continue Shopping*, *Checkout* |
| **Checkout: Your Information** | saisit prénom, nom, code postal ; *Continue* |
| **Checkout: Overview** | voit le récapitulatif : articles, paiement, livraison, sous-total, taxe, total ; *Finish* |
| **Checkout: Complete!** | voit « Thank you for your order! » ; *Generate PDF order* (facture), *Back Home* |


## 📝 Liste des scénarios

L'utilisateur est toujours connecté au départ (fixture `user`).

| # | Scénario | Fichier | Ce qui est vérifié |
|---|---|---|---|
| S1 | Ajouter un produit au panier | [`tests/cart.spec.ts`](tests/cart.spec.ts) | bouton → *Remove*, badge 1, l'article est dans le panier |
| S2 | Supprimer un produit du panier | [`tests/cart.spec.ts`](tests/cart.spec.ts) | il reste 2 articles, badge 2, le produit reste au catalogue |
| S3 | Afficher les détails d'un produit | [`tests/product.spec.ts`](tests/product.spec.ts) | nom, description, prix 9.99, boutons *Add to cart* et *Back to products* |
| S4 | Consulter le panier | [`tests/cart.spec.ts`](tests/cart.spec.ts) | page *Your Cart*, 2 articles avec quantité, nom, prix, boutons |
| S5 | Saisir ses informations | [`tests/checkout.spec.ts`](tests/checkout.spec.ts) | cas nominal → *Overview* ; 3 cas d'erreur → message selon le champ manquant |
| S6 | Afficher le récapitulatif d'une commande | [`tests/checkout.spec.ts`](tests/checkout.spec.ts) | articles, paiement, livraison, 47.97 / 3.84 / 51.81, invariants de calcul |
| S7 | Générer la facture | [`tests/checkout.spec.ts`](tests/checkout.spec.ts) | confirmation, panier vide, PDF *Order Receipt* : destinataire, lignes, 37.98 / 3.04 / 41.02 |
| S8 | Vider le panier | [`tests/cart.spec.ts`](tests/cart.spec.ts) | plus aucun article, badge disparu |

Chaque scénario est écrit en GIVEN / WHEN / THEN, en langage naturel, dans [docs/scenarios.md](docs/scenarios.md).
Sa traduction étape par étape en méthodes du DSL est dans [docs/dsl-actions-perceptions.md](docs/dsl-actions-perceptions.md) , avec un lien vers le test TypeScript correspondant.

### Cas limites et cas d'erreur

| Cas | Scénario |
|---|---|
| Panier vide : le badge **n'existe pas** (perçu comme 0) | S1 (GIVEN), S7, S8 |
| Retirer un article ne retire pas le produit du catalogue | S2 |
| Prénom, nom ou code postal manquant → 3 messages différents | S5 |
| Taxe arrondie au centime, total = sous-total + taxe | S6 |
| Panier vidé automatiquement après la commande | S7 |
| Pas de bouton « Vider » : vider = retirer chaque article | S8 |


## 🧩 Le DSL de test

### Glossaire (extrait)

| Terme | Type | Définition |
|---|---|---|
| **Produit** | `Product` | une référence du catalogue (nom, prix) |
| **Article** | `CartItem` | une ligne du panier qui référence un produit (quantité, nom, description, prix) |
| **Nombre d'articles** | `number` | valeur du badge du panier, 0 s'il est absent |
| **Récapitulatif** | `OrderSummary` | la commande **avant** validation (page *Overview*) |
| **Confirmation** | `string` | le message **après** *Finish* |
| **Facture** | `Invoice` | le PDF *Order Receipt* téléchargé |

Glossaire complet : [docs/dsl-glossaire.md](docs/dsl-glossaire.md).

### Correspondance tâches / concepts / DSL

| Tâche utilisateur | Concepts | Actions | Perceptions |
|---|---|---|---|
| ajouter un produit au panier | Produit, Article | `addToCart` | `getPerceivedProductButton`, `getPerceivedCartCount` |
| supprimer un produit du panier | Article ≠ Produit | `removeFromCart` | `getPerceivedCartItems`, `getPerceivedProducts` |
| afficher les détails d'un produit | Fiche produit | `openProductDetails` | `getPerceivedProductDetails` |
| consulter le panier | Panier, Article | `openCart` | `getPerceivedCartItems`, `getPerceivedButtons` |
| saisir ses informations | Informations client | `startCheckout`, `submitCustomerInfo` | `getPerceivedFormFields`, `getPerceivedErrorMessage` |
| afficher le récapitulatif | Récapitulatif | `submitCustomerInfo` | `getPerceivedOrderSummary` |
| générer la facture | Confirmation, Facture | `finishOrder`, `generateInvoice` | `getPerceivedConfirmation`, `getPerceivedInvoice` |
| vider le panier | Panier vide | `emptyCart` | `getPerceivedCartItems`, `getPerceivedCartCount` |

### Interface TypeScript ([`dsl/types.ts`](dsl/types.ts))

```ts
export interface UserDSL {
  // Actions : ce que l'utilisateur fait (Promise<void>, attendent que l'écran soit stable)
  loginAsStandardUser(): Promise<void>;
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

  // Perceptions : ce que l'utilisateur perçoit (données métier, jamais de Locator)
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

### Stratégie d'implémentation

```
tests/*.spec.ts      scénarios GIVEN/WHEN/THEN : n'utilisent que le DSL (fixture `user`)
      │
dsl/User.ts          implémente UserDSL au niveau des tâches, compose les Page Objects
      │
dsl/pages/*.ts       Page Objects : seuls fichiers qui contiennent des sélecteurs
      │
Playwright           page, locator, click…
```

-   **Sélecteurs `data-test`** du site, via `getByTestId` (`testIdAttribute: 'data-test'` dans [`playwright.config.ts`](playwright.config.ts)).
-   **Un produit est désigné par son nom affiché**, comme le ferait un humain : on cherche le bouton dans la carte du produit.
-   **Les actions attendent l'état final** (bouton devenu *Remove*, titre de la page suivante…) : pas de `waitForTimeout`.
-   **Les perceptions renvoient des données** (`Product[]`, `number`…) : les prix `"$29.99"` deviennent `29.99`.
-   **La facture PDF** est téléchargée par `generateInvoice()`, enregistrée dans le dossier du test, puis lue avec `pdf-parse` par `InvoiceReader`.
-   **Fixture `user`** : chaque test part d'un navigateur neuf, connecté, panier vide ; les tests sont indépendants et parallèles.


## 📁 Structure du projet

**Le DSL** : [`dsl/`](dsl/)

| Fichier | Rôle |
|---|---|
| [`types.ts`](dsl/types.ts) | types métier + interface UserDSL |
| [`User.ts`](dsl/User.ts) | implémentation du DSL |
| [`fixtures.ts`](dsl/fixtures.ts) | fixture Playwright `user` (+ test / expect) |
| [`pages/`](dsl/pages/) | Page Objects : [`LoginPage.ts`](dsl/pages/LoginPage.ts), [`Header.ts`](dsl/pages/Header.ts), [`InventoryPage.ts`](dsl/pages/InventoryPage.ts), [`ProductDetailsPage.ts`](dsl/pages/ProductDetailsPage.ts), [`CartPage.ts`](dsl/pages/CartPage.ts), [`CheckoutPage.ts`](dsl/pages/CheckoutPage.ts), [`InvoiceReader.ts`](dsl/pages/InvoiceReader.ts), [`amount.ts`](dsl/pages/amount.ts) |

**Les tests** : [`tests/`](tests/)

| Fichier | Scénarios |
|---|---|
| [`cart.spec.ts`](tests/cart.spec.ts) | S1, S2, S4, S8 |
| [`product.spec.ts`](tests/product.spec.ts) | S3 |
| [`checkout.spec.ts`](tests/checkout.spec.ts) | S5, S6, S7 |

**La documentation** : [`docs/`](docs/)

| Fichier | Contenu |
|---|---|
| [`scenarios.md`](docs/scenarios.md) | les 8 scénarios d'usage en GIVEN / WHEN / THEN |
| [`actions.md`](docs/actions.md) | actions de l'utilisateur sur le site, par scénario |
| [`perceptions.md`](docs/perceptions.md) | ce que l'utilisateur perçoit, par scénario |
| [`dsl-glossaire.md`](docs/dsl-glossaire.md) | glossaire et types |
| [`dsl-actions-perceptions.md`](docs/dsl-actions-perceptions.md) | DSL (actions, perceptions), GIVEN/WHEN/THEN → DSL, lien vers chaque test |
| [`strategie-tests.md`](docs/strategie-tests.md) | stratégie de test et d'implémentation |
| [`prompts.md`](docs/prompts.md) | prompts utilisés et corrections apportées |


## 🚀 Installation et exécution

Prérequis : Node.js (LTS) et npm.

```bash
npm install
npx playwright install                    # navigateurs, la première fois
npx playwright test                       # 11 tests × chromium, firefox, webkit (33 tests)
npx playwright test --project=chromium    # un seul navigateur
npx playwright test tests/cart.spec.ts    # un seul fichier
npx playwright test --ui                  # mode interactif
npx playwright test --debug               # pas à pas
npx playwright show-report                # rapport HTML
npm run typecheck                         # vérification des types (tsc)
```

Les tests tournent aussi à chaque push via GitHub Actions (`.github/workflows/playwright.yml`).


## 🛠️ Outillage

| Outil | Utilisation |
|---|---|
| **Cours VA** | méthode : tests en boîte noire, scénarios GIVEN / WHEN / THEN, glossaire pour éviter les termes flous (produit ≠ article), DSL en actions / perceptions |
| **Stratégie** | [docs/strategie-tests.md](docs/strategie-tests.md) |
| **LLM : Claude (chat claude.ai)** | rédaction du glossaire, du DSL et de la stratégie à partir de nos scénarios, puis première implémentation. Prompts essentiels : [docs/prompts.md](docs/prompts.md) |
