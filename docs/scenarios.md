# Scénarios d'usage : Sauce Demo

> Site testé : [https://www.saucedemo.com/](https://www.saucedemo.com/) Format de chaque scénario : **GIVEN** (le contexte perçu) / **WHEN** (l'action) / **THEN** (les propriétés à observer) Dans chacun, l'utilisateur est déjà connecté avec `standard_user` / `secret_sauce`. Vocabulaire : [dsl-glossaire.md](dsl-glossaire.md) (un **produit** est au catalogue, un **article** est dans le panier). Traduction de ces scénarios en DSL et en tests : [dsl-actions-perceptions.md](dsl-actions-perceptions.md).

Scénario

**S1**

Ajouter un produit au panier

**S2**

Supprimer un produit du panier

**S3**

Afficher les détails d'un produit

**S4**

Consulter le panier

**S5**

Saisir ses informations

**S6**

Afficher le récapitulatif d'une commande

**S7**

Générer la facture

**S8**

Vider le panier

---

## S1. Ajouter un produit au panier

**GIVEN** l'utilisateur est connecté

-   il voit la liste des produits, parmi lesquels « Sauce Labs Fleece Jacket » à `$49.99`
-   ce produit affiche le bouton « Add to cart »
-   son panier est vide : aucun badge sur l'icône du panier

**WHEN** il ajoute le produit « Sauce Labs Fleece Jacket » au panier

**THEN** il perçoit que

-   le bouton du produit est devenu « Remove »
-   le badge du panier affiche 1
-   le panier contient l'article « Sauce Labs Fleece Jacket », quantité 1, `$49.99`

## S2. Supprimer un produit du panier

**GIVEN** l'utilisateur voit le contenu de son panier

-   3 articles :
-   A = « Sauce Labs Backpack »
-   B = « Sauce Labs Bike Light »
-   C = « Sauce Labs Onesie »
-   le badge du panier affiche 3

**WHEN** il retire l'article B (« Sauce Labs Bike Light ») du panier

**THEN** il perçoit que

-   le panier contient les produits A « Sauce Labs Backpack » et C « Sauce Labs Onesie » seulement
-   le badge du panier affiche 2 produits
-   de retour au catalogue, le produit « Sauce Labs Bike Light » est toujours là, à `$9.99` (retirer un article ne retire pas le produit)
-   ce produit affiche de nouveau « Add to cart », alors que A et C affichent toujours « Remove »

## S3. Afficher les détails d'un produit

**GIVEN** l'utilisateur est connecté

-   il perçoit le produit « Sauce Labs Bike Light » à `$9.99` dans le catalogue

**WHEN** il ouvre la fiche du produit « Sauce Labs Bike Light »

**THEN** il perçoit que

-   la fiche affiche le nom « Sauce Labs Bike Light », une description "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included." et le prix `$9.99`
-   la fiche propose les boutons « Add to cart » et « Back to products »

## S4. Consulter le panier

**GIVEN** l'utilisateur a ajouté « Sauce Labs Backpack » et « Sauce Labs Bolt T-Shirt » au panier

-   le badge du panier affiche 2 produits

**WHEN** il consulte son panier

**THEN** il perçoit que

-   la page « Your Cart » est affichée
-   elle contient 2 articles, chacun avec sa quantité, son nom, sa description et son prix :
    -   « Sauce Labs Backpack », quantité 1, `$29.99`
    -   « Sauce Labs Bolt T-Shirt », quantité 1, `$15.99`
-   la page propose sur chaque produit un bouton « Remove » ainsi qu'un bouton « Continue Shopping » et « Checkout »

## S5. Saisir ses informations

**GIVEN** le panier contient l'article « Sauce Labs Backpack » et l'utilisateur a commencé la commande

-   il voit la page « Checkout: Your Information »
-   elle contient 3 champs : « First Name », « Last Name », « Zip/Postal Code »

### Cas nominal

**WHEN** il saisit ses informations complètes (Jean, LECOQ, 75000) et continue

**THEN** il perçoit que

-   la page « Checkout: Overview » est affichée
-   aucun message d'erreur n'apparaît

### Cas d'erreur

**WHEN** il saisit ses informations en laissant un champ vide, puis continue

**THEN** il perçoit que

-   un message d'erreur indique le champ manquant :
    -   prénom vide : « Error: First Name is required »
    -   nom vide : « Error: Last Name is required »
    -   code postal vide : « Error: Postal Code is required »
-   il reste sur la page « Checkout: Your Information »

## S6. Afficher le récapitulatif d'une commande

**GIVEN** le panier contient « Sauce Labs Backpack », « Sauce Labs Bike Light » et « Sauce Labs Onesie »

-   l'utilisateur a des produits dans son panier.

**WHEN** il valide le panier en cliquant sur checkout, ensuite il saisit ses informations (Jean, LECOQ, 75000) et continue

**THEN** il perçoit le récapitulatif de sa commande

-   la page « Checkout: Overview » est affichée
-   les 3 articles, quantité 1 : Backpack `$29.99`, Bike Light `$9.99`, Onesie `$7.99`
-   le paiement « SauceCard #31337 » et la livraison « Free Pony Express Delivery! »
-   le sous-total `$47.97`, la taxe `$3.84` et le total `$51.81`
-   le sous-total est la somme des prix, la taxe vaut 8 % du sous-total, le total est sous-total + taxe
-   les boutons « Cancel » et « Finish »

## S7. Générer la facture

**GIVEN** le panier contient « Sauce Labs Backpack » et « Sauce Labs Onesie »

-   l'utilisateur a saisi ses informations (Jean, LECOQ, 75000)
-   il Voit le récapitulatif de sa commande : sous-total `$37.98`, taxe `$3.04`, total `$41.02`

**WHEN** il valide la commande

**THEN** il perçoit que

-   la page « Checkout: Complete! » affiche « Thank you for your order! »
-   le badge du panier a disparu : le panier est vide

**WHEN** il génère la facture (« Generate PDF order »)

**THEN** il perçoit que

-   un PDF `swag-labs-order-<date>.pdf` est téléchargé
-   la facture « Order Receipt » contient la date de commande et le destinataire « Jean LECOQ », 75000
-   elle liste les articles : Backpack `$29.99`, Onesie `$7.99`
-   elle indique le sous-total `$37.98`, la taxe `$3.04` et le total `$41.02`, identiques au récapitulatif de la commande

## S8. Vider le panier

**GIVEN** l'utilisateur perçoit son panier

-   2 articles : « Sauce Labs Backpack » et « Sauce Labs Bike Light »
-   le badge du panier affiche 2

**WHEN** il vide le panier (il retire chaque article : le site n'a pas de bouton « Vider »)

**THEN** il perçoit que

-   le panier ne contient plus aucun article
-   le badge du panier a disparu