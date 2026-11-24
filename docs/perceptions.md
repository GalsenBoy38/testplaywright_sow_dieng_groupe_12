# Perceptions par scénario : Sauce Demo

> Site : https://www.saucedemo.com/
> Perception = ce que l'utilisateur voit à l'écran (avant l'action : GIVEN, après l'action : THEN).
> Ce qui relie un GIVEN et un THEN, c'est l'action du scénario (le WHEN, voir [actions.md](actions.md)) : le GIVEN est ce qu'il perçoit avant d'agir, le THEN ce qu'il perçoit après, et l'écart entre les deux est l'effet de l'action que le test vérifie.

## Contexte commun : après la connexion
- la page « Products » est affichée
- le catalogue contient 6 produits :
  - Sauce Labs Backpack : `$29.99`
  - Sauce Labs Bike Light : `$9.99`
  - Sauce Labs Bolt T-Shirt : `$15.99`
  - Sauce Labs Fleece Jacket : `$49.99`
  - Sauce Labs Onesie : `$7.99`
  - Test.allTheThings() T-Shirt (Red) : `$15.99`
- le panier est vide : pas de badge sur l'icône du panier

## S1. Ajouter un produit au panier
- GIVEN : il voit « Sauce Labs Fleece Jacket » à `$49.99` avec le bouton « Add to cart »
- THEN : le bouton devient « Remove »
- THEN : le badge du panier affiche 1
- THEN : le panier contient l'article « Sauce Labs Fleece Jacket », quantité 1, `$49.99`

## S2. Supprimer un produit du panier
- GIVEN : le panier contient 3 articles (Backpack, Bike Light, Onesie), badge 3
- THEN : le panier ne contient plus que Backpack et Onesie
- THEN : le badge du panier affiche 2
- THEN : le produit « Sauce Labs Bike Light » est toujours dans le catalogue, à `$9.99` (article ≠ produit)
- THEN : Bike Light affiche de nouveau « Add to cart », alors que Backpack et Onesie affichent toujours « Remove »

## S3. Afficher les détails d'un produit
- GIVEN : il voit « Sauce Labs Bike Light » à `$9.99` dans le catalogue
- THEN : il voit la fiche du produit : nom « Sauce Labs Bike Light », la description « A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included. », le prix `$9.99`
- THEN : il voit les boutons « Add to cart » et « Back to products »

## S4. Consulter le panier
- GIVEN : il a ajouté « Sauce Labs Backpack » et « Sauce Labs Bolt T-Shirt », le badge affiche 2
- THEN : la page « Your Cart » est affichée
- THEN : il voit 2 articles, chacun avec quantité (QTY), nom, description et prix :
  - Sauce Labs Backpack, 1, `$29.99`
  - Sauce Labs Bolt T-Shirt, 1, `$15.99`
- THEN : il voit un bouton « Remove » sur chaque article, ainsi que les boutons « Continue Shopping » et « Checkout »

## S5. Saisir ses informations
- GIVEN : le panier contient l'article « Sauce Labs Backpack », la commande est commencée
- GIVEN : la page « Checkout: Your Information » avec les champs First Name, Last Name, Zip/Postal Code
- THEN (cas nominal) : la page « Checkout: Overview » est affichée, sans message d'erreur
- THEN (cas d'erreur) : un message rouge selon le champ manquant :
  - « Error: First Name is required »
  - « Error: Last Name is required »
  - « Error: Postal Code is required »
- THEN (cas d'erreur) : il reste sur la page « Checkout: Your Information »

## S6. Afficher le récapitulatif d'une commande
- GIVEN : le panier contient Backpack, Bike Light et Onesie
  (WHEN : il clique sur « Checkout », saisit Jean, LECOQ, 75000 et continue)
- THEN : la page « Checkout: Overview » est affichée
- THEN : il voit la liste des articles commandés, quantité 1 : Backpack `$29.99`, Bike Light `$9.99`, Onesie `$7.99`
- THEN : il voit « Payment Information » (SauceCard #31337) et « Shipping Information » (Free Pony Express Delivery!)
- THEN : il voit Item total (somme des prix), Tax (8 % du sous-total) et Total (Item total + Tax)
  - exemple : Backpack + Bike Light + Onesie → Item total `$47.97`, Tax `$3.84`, Total `$51.81`
- THEN : il voit les boutons « Cancel » et « Finish »

## S7. Générer la facture
- GIVEN : le récapitulatif de Backpack + Onesie (Jean, LECOQ, 75000) affiche Item total `$37.98`, Tax `$3.04`, Total `$41.02`
- THEN (après « Finish ») : la page « Checkout: Complete! » affiche « Thank you for your order! »
- THEN : le badge du panier a disparu (panier vide)
- THEN (après « Generate PDF order ») : un PDF « swag-labs-order-<date>.pdf » est téléchargé
- THEN : la facture « Order Receipt » contient la date, le nom et le code postal de livraison, les articles et leurs prix, Item total, Tax, Total
  - exemple : Backpack + Onesie, Jean LECOQ 75000 → Item total `$37.98`, Tax `$3.04`, Total `$41.02`
- THEN : les articles et les montants de la facture sont identiques au récapitulatif

## S8. Vider le panier
- GIVEN : le panier contient 2 articles (Backpack, Bike Light), badge 2
- THEN : la page « Your Cart » ne contient plus aucun article
- THEN : le badge du panier a disparu
