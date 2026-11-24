# Prompts essentiels

## Prompt 1 : du scénario au DSL (Claude)

Fichiers joints : [scenarios.md](scenarios.md), [actions.md](actions.md), [perceptions.md](perceptions.md)

```text
Voici mes 8 scénarios validés (scenarios.md), les actions de l'utilisateur sur le site
(actions.md) et ce qu'il perçoit (perceptions.md) pour https://www.saucedemo.com/ : 

Produis :
1. dsl-glossaire.md : termes flous → un seul concept (produit ≠ article, panier, facture…) + types TypeScript
2. dsl-actions-perceptions.md : le DSL en deux familles
   - Actions (ce que l'utilisateur fait) : addToCart(productLabel), removeFromCart(...)…
   - Perceptions (ce qu'il perçoit) : getPerceivedProducts(): Promise<Product[]>…, renvoient des données
3. strategie-tests.md : raison d'être des tests, correspondance tâches/concepts/DSL,
   interface TypeScript du DSL, stratégie d'implémentation
```

## Prompt 2 : implémentation (Claude)

Fichiers joints : les 3 documents produits par le prompt 1.

```text
Implémente ce DSL avec Playwright Test (TypeScript), en suivant exactement ces 3 docs :
- dsl/types.ts, dsl/User.ts, dsl/fixtures.ts, dsl/pages/*.ts (sélecteurs data-test uniquement ici)
- tests/cart.spec.ts (S1, S2, S4, S8), tests/product.spec.ts (S3), tests/checkout.spec.ts (S5, S6, S7)
- playwright.config.ts : baseURL et testIdAttribute 'data-test'
Les tests n'utilisent jamais page/locator/click. Commence par S7 (facture PDF).
```
## Prompt 3 : exécution et correction (Claude)

```text
Regarde si le code produit est correct et si les tests vont marché.
sur chromium, firefox et webkit, puis corrige les échecs.
```