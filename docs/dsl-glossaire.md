# Glossaire du DSL : Sauce Demo

> Site testé : <https://www.saucedemo.com/>
> Entrées : [scenarios.md](scenarios.md) · [actions.md](actions.md) · [perceptions.md](perceptions.md)
> Voir aussi : [dsl-actions-perceptions.md](dsl-actions-perceptions.md) · [strategie-tests.md](strategie-tests.md)

## 1. Pourquoi un glossaire

Dans les scénarios, les mêmes choses portent plusieurs noms : « produit », « article »,
« item », « commande », « facture », « récapitulatif »… Un mot qui désigne deux choses,
ou deux mots pour une seule chose, rendent les scénarios ambigus et le DSL incohérent.

## 2. Les trois distinctions essentielles

### 2.1 Produit ≠ Article

| | **Produit** (`Product`) | **Article** (`CartItem`) |
|---|---|---|
| Définition | Une **référence du catalogue** proposée à la vente | Une **ligne du panier** : un produit **choisi** par l'utilisateur |
| Où on le perçoit | page *Products*, fiche produit | page *Your Cart*, page *Checkout: Overview* |
| Existence | existe toujours, choisi ou non | n'existe que **dans le panier** |
| Identifiant | son nom (`ProductLabel`) | le nom du produit qu'il référence |
| Données | nom, description, prix | quantité (toujours 1), nom, description, prix |
| Effet d'un retrait | — (jamais retiré du catalogue) | l'article disparaît du panier, **le produit reste au catalogue** (S2) |

> On **ajoute un produit** au panier, ce qui crée un **article**.
> On **retire un article** du panier ; le **produit** reste dans le catalogue.


> **Note sur le titre de S2.** Le scénario validé s'intitule « Supprimer un produit du panier ».
> On garde ce titre tel quel, mais dans le DSL et dans les GIVEN/WHEN/THEN il se lit
> **« retirer un article du panier »** (`removeFromCart`) : le produit, lui, n'est jamais supprimé.

### 2.2 Récapitulatif ≠ Confirmation ≠ Facture

| | **Récapitulatif** (`OrderSummary`) | **Confirmation** (`string`) | **Facture** (`Invoice`) |
|---|---|---|---|
| Quand | **avant** de valider (S6) | **après** *Finish* (S7) | après *Generate PDF order* (S7) |
| Où | page *Checkout: Overview* | page *Checkout: Complete!* | fichier PDF *Order Receipt* |
| Contenu | articles, paiement, livraison, sous-total, taxe, total | « Thank you for your order! » | date, destinataire (nom + code postal), lignes, sous-total, taxe, total |
| Modifiable | oui (*Cancel*) | non | non |

« Facture » désigne **uniquement le PDF**. La page *Checkout: Complete!* n'est pas une facture.

### 2.3 Panier vide ≠ badge à 0

Sauce Demo **n'affiche pas** de badge quand le panier est vide. Dans le DSL,
le **nombre d'articles** perçu vaut `0` quand le badge est absent : il n'existe pas de badge « 0 ».

## 3. Glossaire complet

| Terme retenu | Type DSL | Définition | Dans le site | Synonymes interdits |
|---|---|---|---|---|
| **Utilisateur** | `UserDSL` | L'acteur des scénarios ; toute action et toute perception passe par lui | la personne devant le navigateur | client, visiteur, acheteur |
| **Connecté** | (contexte du fixture) | L'utilisateur `standard_user` a passé la page de connexion | page *Products* affichée | identifié, loggé |
| **Page** | `PageTitle` | L'écran courant, identifié par son titre | `[data-test="title"]` | vue, écran, URL |
| **Catalogue** | `Product[]` | Les 6 produits proposés | page *Products* | inventaire, boutique, liste |
| **Produit** | `Product` | Une référence du catalogue | carte `inventory-item` | article, item |
| **Nom du produit** | `ProductLabel` | Nom affiché, **identifiant** du produit et de l'article | `inventory-item-name` | titre, libellé |
| **Prix** | `number` | Prix unitaire en dollars, **sans** `$` (`"$9.99"` → `9.99`) | `inventory-item-price` | coût, tarif |
| **Bouton d'un produit** | `ProductButton` | `'Add to cart'` ou `'Remove'`, selon que le produit est dans le panier | `add-to-cart-…` / `remove-…` | état, toggle |
| **Fiche produit** | `ProductDetails` | Détail d'un produit : nom, description, prix | page `inventory-item.html` | page produit, détail |
| **Panier** | `CartItem[]` | Le contenant des articles choisis | page *Your Cart* | caddie, commande |
| **Article** | `CartItem` | Une ligne du panier qui référence un produit | `inventory-item` dans `cart-list` | produit, item, ligne |
| **Quantité** | `number` | QTY d'un article, toujours 1 | `item-quantity` | nombre |
| **Nombre d'articles** | `number` | Valeur du badge du panier, 0 si badge absent | `shopping-cart-badge` | compteur, quantité |
| **Vider le panier** | `emptyCart()` | Retirer tous les articles un par un (pas de bouton dédié) | — | supprimer le panier |
| **Informations client** | `CustomerInfo` | Prénom, nom, code postal | page *Checkout: Your Information* | adresse, coordonnées, formulaire |
| **Message d'erreur** | `string \| null` | Texte rouge affiché quand un champ manque, `null` sinon | `[data-test="error"]` | alerte, warning |
| **Récapitulatif** | `OrderSummary` | Ce qu'on va commander, avant validation | page *Checkout: Overview* | résumé, devis, facture |
| **Sous-total** | `itemTotal: number` | Somme des prix des articles, hors taxe | `Item total: $…` | total HT |
| **Taxe** | `tax: number` | 8 % du sous-total, arrondie au centime | `Tax: $…` | TVA, frais |
| **Total** | `total: number` | Sous-total + taxe | `Total: $…` | montant TTC, prix final |
| **Confirmation** | `string` | Message affiché après validation | `complete-header` | facture, reçu |
| **Facture** | `Invoice` | Le PDF *Order Receipt* téléchargé | `swag-labs-order-<date>.pdf` | reçu, bon, récapitulatif |
| **Destinataire** | `ShipTo` | Nom complet + code postal imprimés sur la facture | rubrique *Ship To* | adresse, client |

## 4. Verbes autorisés

| Verbe des scénarios | Famille | Méthode DSL | Verbes interdits |
|---|---|---|---|
| se connecter (contexte) | Action | `loginAsStandardUser` | s'identifier, se loguer |
| ajouter un produit au panier | Action | `addToCart` | mettre, cliquer sur *Add to cart* |
| retirer un article du panier | Action | `removeFromCart` | supprimer le produit (sauf dans le titre validé de S2), enlever |
| vider le panier | Action | `emptyCart` | supprimer le panier |
| ouvrir la fiche d'un produit | Action | `openProductDetails` | cliquer sur le nom |
| revenir au catalogue | Action | `backToProducts` | cliquer sur *Back to products* |
| consulter le panier | Action | `openCart` | aller sur `/cart.html` |
| commencer la commande | Action | `startCheckout` | cliquer sur *Checkout* |
| saisir ses informations | Action | `submitCustomerInfo` | remplir le formulaire |
| valider la commande | Action | `finishOrder` | payer, cliquer sur *Finish* |
| générer la facture | Action | `generateInvoice` | télécharger le PDF |
| percevoir … | Perception | `getPerceived…()` | vérifier le locator, voir l'élément |

## 5. Types TypeScript

```ts
export type ProductLabel = string;

export type PageTitle =
  | 'Products'
  | 'Your Cart'
  | 'Checkout: Your Information'
  | 'Checkout: Overview'
  | 'Checkout: Complete!';

export interface Product {
  label: ProductLabel;
  price: number;
}

export interface ProductDetails extends Product {
  description: string;
}

export type ProductButton = 'Add to cart' | 'Remove';

export interface CartItem {
  quantity: number;
  label: ProductLabel;
  description: string;
  price: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface OrderSummary {
  items: CartItem[];
  paymentInformation: string;
  shippingInformation: string;
  itemTotal: number;
  tax: number;
  total: number;
}

export interface ShipTo {
  name: string;
  postalCode: string;
}

export interface InvoiceLine {
  label: ProductLabel;
  price: number;
}

export interface Invoice {
  fileName: string;
  orderDate: string;
  shipTo: ShipTo;
  lines: InvoiceLine[];
  itemTotal: number;
  tax: number;
  total: number;
}
```

## 6. Données de référence

| Produit | Prix |
|---|---|
| Sauce Labs Backpack | 29.99 |
| Sauce Labs Bike Light | 9.99 |
| Sauce Labs Bolt T-Shirt | 15.99 |
| Sauce Labs Fleece Jacket | 49.99 |
| Sauce Labs Onesie | 7.99 |
| Test.allTheThings() T-Shirt (Red) | 15.99 |

| Utilisateur | Mot de passe |
|---|---|
| `standard_user` | `secret_sauce` |

| Constante | Valeur |
|---|---|
| Taux de taxe | 8 %, arrondi au centime |
| Paiement | `SauceCard #31337` |
| Livraison | `Free Pony Express Delivery!` |
