# Actions par scénario : Sauce Demo

> Site testé : <https://www.saucedemo.com/>
> Scénarios : [scenarios.md](scenarios.md)

## Contexte commun : se connecter

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Saisir `standard_user` dans **Username** | |
| 2 | Saisir `secret_sauce` dans **Password** | |
| 3 | Cliquer sur **Login** | page **Products** : catalogue de 6 produits |

Catalogue : Sauce Labs Backpack (`$29.99`), Sauce Labs Bike Light (`$9.99`),
Sauce Labs Bolt T-Shirt (`$15.99`), Sauce Labs Fleece Jacket (`$49.99`),
Sauce Labs Onesie (`$7.99`), Test.allTheThings() T-Shirt (Red) (`$15.99`).

---

## S1. Ajouter un produit au panier

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Repérer « Sauce Labs Fleece Jacket » dans le catalogue | carte du produit, prix `$49.99`, bouton **Add to cart**, aucun badge sur le panier |
| 2 | Cliquer sur **Add to cart** de ce produit | le bouton devient **Remove**, le badge du panier affiche **1** |
| 3 | Cliquer sur l'icône du panier | page **Your Cart** : l'article « Sauce Labs Fleece Jacket », QTY 1, `$49.99` |

## S2. Supprimer un produit du panier

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Ajouter Backpack, Bike Light et Onesie (**Add to cart**) | badge **3** |
| 2 | Cliquer sur l'icône du panier | page **Your Cart** : 3 articles |
| 3 | Cliquer sur **Remove** de « Sauce Labs Bike Light » | l'article disparaît, reste Backpack et Onesie, badge **2** |
| 4 | Cliquer sur **Continue Shopping** | page **Products** : « Sauce Labs Bike Light » toujours là à `$9.99` avec **Add to cart** ; Backpack et Onesie affichent **Remove** |

## S3. Afficher les détails d'un produit

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Cliquer sur le nom (ou l'image) de « Sauce Labs Bike Light » | fiche produit : nom, description « A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included. », prix `$9.99`, boutons **Add to cart** et **Back to products** |

## S4. Consulter le panier

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Ajouter Backpack et Bolt T-Shirt (**Add to cart**) | badge **2** |
| 2 | Cliquer sur l'icône du panier | page **Your Cart** : « Sauce Labs Backpack », QTY 1, `$29.99` et « Sauce Labs Bolt T-Shirt », QTY 1, `$15.99`, chacun avec sa description et un bouton **Remove** ; boutons **Continue Shopping** et **Checkout** |

## S5. Saisir ses informations

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Avec « Sauce Labs Backpack » dans le panier, ouvrir le panier puis cliquer sur **Checkout** | page **Checkout: Your Information** : champs **First Name**, **Last Name**, **Zip/Postal Code** ; boutons **Cancel**, **Continue** |
| 2a | *(cas nominal)* Saisir Jean, LECOQ, 75000, cliquer sur **Continue** | page **Checkout: Overview**, aucun message d'erreur |
| 2b | *(cas d'erreur)* Laisser un champ vide, cliquer sur **Continue** | message rouge : `Error: First Name is required`, `Error: Last Name is required` ou `Error: Postal Code is required` ; il reste sur **Checkout: Your Information** |

## S6. Afficher le récapitulatif d'une commande

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Ajouter Backpack, Bike Light et Onesie, **Checkout**, saisir Jean, LECOQ, 75000, **Continue** | page **Checkout: Overview** |
| 2 | Lire le récapitulatif | articles QTY 1 : Backpack `$29.99`, Bike Light `$9.99`, Onesie `$7.99` ; **Payment Information** (SauceCard #31337), **Shipping Information** (Free Pony Express Delivery!) ; **Item total** `$47.97`, **Tax** `$3.84` (8 %), **Total** `$51.81` ; boutons **Cancel**, **Finish** |

## S7. Générer la facture

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Ajouter Backpack et Onesie, **Checkout**, saisir Jean, LECOQ, 75000, **Continue** | récapitulatif : Item total `$37.98`, Tax `$3.04`, Total `$41.02` |
| 2 | Cliquer sur **Finish** | page **Checkout: Complete!** : « Thank you for your order! », badge du panier disparu |
| 3 | Cliquer sur **Generate PDF order** | téléchargement d'un PDF `swag-labs-order-<date>.pdf` |
| 4 | Ouvrir le PDF | facture **Order Receipt** : date de commande, **Ship To** « Jean LECOQ », 75000, Backpack `$29.99`, Onesie `$7.99`, Item total `$37.98`, Tax `$3.04`, Total `$41.02` (identiques au récapitulatif) |

## S8. Vider le panier

| # | Action de l'utilisateur | Ce qu'il perçoit |
|---|---|---|
| 1 | Ajouter Backpack et Bike Light (**Add to cart**) | badge **2** |
| 2 | Cliquer sur l'icône du panier | page **Your Cart** : 2 articles |
| 3 | Cliquer sur **Remove** pour chaque article | plus aucun article, le badge disparaît |

> Il n'y a pas de bouton « Vider le panier » : vider = retirer tous les articles un par un.
