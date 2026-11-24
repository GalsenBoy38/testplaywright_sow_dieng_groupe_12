# DSL : actions et perceptions Sauce Demo

> Site testé : <https://www.saucedemo.com/>
> Entrées : [scenarios.md](scenarios.md) · [actions.md](actions.md) · [perceptions.md](perceptions.md)
> Vocabulaire : [dsl-glossaire.md](dsl-glossaire.md) · Stratégie : [strategie-tests.md](strategie-tests.md)

## 1. Actions

| Action | Signature | Effet perçu ensuite |
|---|---|---|
| ajouter des produits au panier | `addToCart(...labels: ProductLabel[])` | bouton → *Remove*, badge +1 par produit |
| retirer des articles du panier | `removeFromCart(...labels: ProductLabel[])` | articles disparus, badge −1 par article |
| vider le panier | `emptyCart()` | plus aucun article, badge absent |
| ouvrir la fiche d'un produit | `openProductDetails(label: ProductLabel)` | fiche du produit |
| revenir au catalogue | `backToProducts()` | page *Products* |
| consulter le panier | `openCart()` | page *Your Cart* |
| commencer la commande | `startCheckout()` | page *Checkout: Your Information* |
| saisir ses informations | `submitCustomerInfo(info: Partial<CustomerInfo>)` | page *Checkout: Overview* ou message d'erreur |
| valider la commande | `finishOrder()` | page *Checkout: Complete!*, badge absent |
| générer la facture | `generateInvoice()` | PDF téléchargé et mémorisé par le DSL |

Les actions sont **au niveau de la tâche** : `removeFromCart` ouvre le panier si besoin,
`emptyCart` retire chaque article, `submitCustomerInfo` remplit les champs fournis puis clique *Continue*.

## 2. Perceptions

| Perception | Signature | Renvoie |
|---|---|---|
| page courante | `getPerceivedPageTitle(): Promise<PageTitle>` | `'Products'`, `'Your Cart'`… |
| catalogue | `getPerceivedProducts(): Promise<Product[]>` | les produits affichés |
| bouton d'un produit | `getPerceivedProductButton(label): Promise<ProductButton>` | `'Add to cart'` ou `'Remove'` |
| nombre d'articles | `getPerceivedCartCount(): Promise<number>` | valeur du badge, `0` si absent |
| articles du panier | `getPerceivedCartItems(): Promise<CartItem[]>` | lignes de *Your Cart* |
| fiche produit | `getPerceivedProductDetails(): Promise<ProductDetails>` | nom, description, prix |
| boutons de la page | `getPerceivedButtons(): Promise<string[]>` | libellés distincts, dans l'ordre d'affichage |
| champs du formulaire | `getPerceivedFormFields(): Promise<string[]>` | `['First Name', 'Last Name', 'Zip/Postal Code']` |
| message d'erreur | `getPerceivedErrorMessage(): Promise<string \| null>` | texte rouge ou `null` |
| récapitulatif | `getPerceivedOrderSummary(): Promise<OrderSummary>` | articles, paiement, livraison, montants |
| confirmation | `getPerceivedConfirmation(): Promise<string>` | `'Thank you for your order!'` |
| facture | `getPerceivedInvoice(): Promise<Invoice>` | contenu du PDF généré |

Une perception lit **la page courante** et ne navigue pas
(exception : `getPerceivedInvoice` lit le fichier téléchargé par `generateInvoice`).

## 3. Scénarios : GIVEN / WHEN / THEN → DSL → valeur attendue

Chaque ligne d'un tableau correspond à une ligne du test : l'énoncé du scénario, la méthode du DSL qui le traduit, la valeur que le test attend. Le code des tests est dans [`tests/`](../tests/).

### S1. Ajouter un produit au panier

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | il voit *Fleece Jacket* à `$49.99` | `getPerceivedProducts()` | contient `{ label: 'Sauce Labs Fleece Jacket', price: 49.99 }` |
| GIVEN | avec le bouton *Add to cart* | `getPerceivedProductButton('Sauce Labs Fleece Jacket')` | `'Add to cart'` |
| GIVEN | panier vide | `getPerceivedCartCount()` | `0` |
| WHEN | il ajoute le produit au panier | `addToCart('Sauce Labs Fleece Jacket')` | — |
| THEN | le bouton devient *Remove* | `getPerceivedProductButton('Sauce Labs Fleece Jacket')` | `'Remove'` |
| THEN | le badge affiche 1 | `getPerceivedCartCount()` | `1` |
| THEN | le panier contient l'article, QTY 1, `$49.99` | `openCart()` puis `getPerceivedCartItems()` | 1 article `{ quantity: 1, label: 'Sauce Labs Fleece Jacket', price: 49.99 }` |

Test : [`tests/cart.spec.ts`](../tests/cart.spec.ts)

### S2. Supprimer un produit du panier

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | le panier contient Backpack, Bike Light, Onesie | `addToCart(…3)` puis `openCart()`, `getPerceivedCartItems()` | 3 libellés dans cet ordre |
| GIVEN | badge 3 | `getPerceivedCartCount()` | `3` |
| WHEN | il retire l'article *Bike Light* | `removeFromCart('Sauce Labs Bike Light')` | — |
| THEN | reste Backpack et Onesie | `getPerceivedCartItems()` → libellés | `['Sauce Labs Backpack', 'Sauce Labs Onesie']` |
| THEN | badge 2 | `getPerceivedCartCount()` | `2` |
| THEN | le produit est toujours au catalogue | `backToProducts()` (*Continue Shopping*) puis `getPerceivedProducts()` | contient `{ label: 'Sauce Labs Bike Light', price: 9.99 }` |
| THEN | son bouton redevient *Add to cart*, les autres restent *Remove* | `getPerceivedProductButton(…)` | Bike Light `'Add to cart'`, Backpack et Onesie `'Remove'` |

`backToProducts()` ramène à la page *Products* depuis le panier (*Continue Shopping*) ou depuis la fiche produit (*Back to products*).

Test : [`tests/cart.spec.ts`](../tests/cart.spec.ts)

### S3. Afficher les détails d'un produit

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | il voit *Bike Light* à `$9.99` au catalogue | `getPerceivedProducts()` | contient `{ label: 'Sauce Labs Bike Light', price: 9.99 }` |
| WHEN | il ouvre la fiche du produit | `openProductDetails('Sauce Labs Bike Light')` | — |
| THEN | nom, description, prix `$9.99` | `getPerceivedProductDetails()` | `label` = *Bike Light*, `description` = « A red light isn't the desired state… 1 AAA battery included. », `price` = `9.99` |
| THEN | boutons *Add to cart* et *Back to products* | `getPerceivedButtons()` | contient les deux libellés |

Test : [`tests/product.spec.ts`](../tests/product.spec.ts)

### S4. Consulter le panier

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | Backpack et Bolt T-Shirt ajoutés, badge 2 | `addToCart(…2)`, `getPerceivedCartCount()` | `2` |
| WHEN | il consulte le panier | `openCart()` | — |
| THEN | page *Your Cart* | `getPerceivedPageTitle()` | `'Your Cart'` |
| THEN | 2 articles avec QTY, nom, description, prix | `getPerceivedCartItems()` | `[{1, Backpack, …, 29.99}, {1, Bolt T-Shirt, …, 15.99}]`, descriptions non vides |
| THEN | un bouton *Remove* par article, boutons *Continue Shopping* et *Checkout* | `getPerceivedButtons()` | `['Remove', 'Continue Shopping', 'Checkout']` (libellés distincts : le nombre de *Remove* n'est pas compté) |

Test : [`tests/cart.spec.ts`](../tests/cart.spec.ts)

### S5. Saisir ses informations

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | « Sauce Labs Backpack » au panier, commande commencée | `addToCart('Sauce Labs Backpack')`, `startCheckout()` | — |
| GIVEN | page *Your Information* et ses 3 champs | `getPerceivedPageTitle()`, `getPerceivedFormFields()` | `'Checkout: Your Information'`, `['First Name', 'Last Name', 'Zip/Postal Code']` |
| WHEN (nominal) | il saisit les 3 informations | `submitCustomerInfo({ firstName, lastName, postalCode })` | — |
| THEN (nominal) | page *Overview* | `getPerceivedPageTitle()` | `'Checkout: Overview'` |
| THEN (nominal) | aucun message d'erreur | `getPerceivedErrorMessage()` | `null` |
| WHEN (erreur) | il laisse un champ vide | `submitCustomerInfo(info sans ce champ)` | — |
| THEN (erreur) | message rouge selon le champ | `getPerceivedErrorMessage()` | `'Error: First Name is required'` / `'Error: Last Name is required'` / `'Error: Postal Code is required'` |
| THEN (erreur) | il reste sur *Your Information* | `getPerceivedPageTitle()` | `'Checkout: Your Information'` |

`startCheckout()` ouvre le panier si besoin puis clique *Checkout*.

Test : [`tests/checkout.spec.ts`](../tests/checkout.spec.ts)

### S6. Afficher le récapitulatif d'une commande

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | Backpack, Bike Light, Onesie au panier | `addToCart(…3)` | — |
| WHEN | il valide le panier (*Checkout*) | `startCheckout()` | — |
| WHEN | puis saisit ses informations et continue | `submitCustomerInfo(Jean, LECOQ, 75000)` | — |
| THEN | page *Overview* | `getPerceivedPageTitle()` | `'Checkout: Overview'` |
| THEN | articles (QTY, nom, prix) | `getPerceivedOrderSummary().items` | 3 articles, QTY 1, 29.99 / 9.99 / 7.99 |
| THEN | paiement et livraison | `.paymentInformation`, `.shippingInformation` | `'SauceCard #31337'`, `'Free Pony Express Delivery!'` |
| THEN | sous-total, taxe 8 %, total | `.itemTotal`, `.tax`, `.total` | `47.97`, `3.84`, `51.81` |
| THEN | règles de calcul | — | `tax ≈ round(itemTotal × 0.08)`, `total ≈ itemTotal + tax`, `itemTotal = Σ prix` |
| THEN | boutons *Cancel*, *Finish* | `getPerceivedButtons()` | `['Cancel', 'Finish']` |

Test : [`tests/checkout.spec.ts`](../tests/checkout.spec.ts)

### S7. Générer la facture

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | Backpack + Onesie, informations de Jean LECOQ 75000, récapitulatif affiché | `addToCart(…2)`, `startCheckout()`, `submitCustomerInfo(Jean, LECOQ, 75000)`, `getPerceivedOrderSummary()` | récapitulatif mémorisé |
| WHEN | il valide la commande | `finishOrder()` | — |
| THEN | page *Complete!* et remerciement | `getPerceivedPageTitle()`, `getPerceivedConfirmation()` | `'Checkout: Complete!'`, `'Thank you for your order!'` |
| THEN | panier vide | `getPerceivedCartCount()` | `0` |
| WHEN | il génère la facture | `generateInvoice()` | — |
| THEN | PDF téléchargé | `getPerceivedInvoice().fileName` | correspond à `/^swag-labs-order-.+\.pdf$/` |
| THEN | contenu de la facture | `getPerceivedInvoice()` | `orderDate` non vide, `shipTo` = `{ 'Jean LECOQ', '75000' }`, lignes Backpack 29.99 + Onesie 7.99, `37.98` / `3.04` / `41.02` |
| THEN | la facture reprend le récapitulatif | `getPerceivedInvoice()` vs récapitulatif | mêmes lignes, même sous-total, taxe et total |

Test : [`tests/checkout.spec.ts`](../tests/checkout.spec.ts)

### S8. Vider le panier

| Étape | Énoncé | Méthode DSL | Valeur attendue |
|---|---|---|---|
| GIVEN | Backpack et Bike Light au panier, badge 2 | `addToCart(…2)`, `openCart()`, `getPerceivedCartItems()`, `getPerceivedCartCount()` | 2 articles, `2` |
| WHEN | il vide le panier | `emptyCart()` | — |
| THEN | plus aucun article | `getPerceivedCartItems()` | `[]` |
| THEN | badge disparu | `getPerceivedCartCount()` | `0` |

Test : [`tests/cart.spec.ts`](../tests/cart.spec.ts)
