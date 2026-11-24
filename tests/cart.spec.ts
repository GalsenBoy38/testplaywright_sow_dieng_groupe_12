import { test, expect } from '../dsl/fixtures';

// Scénarios S1, S2, S4, S8 : docs/dsl-actions-perceptions.md §3

/** Utilitaire de test : les noms des articles, dans l'ordre. */
const labels = (items: { label: string }[]) => items.map(i => i.label);

test('S1 - ajouter un produit au panier', async ({ user }) => {
  const product = 'Sauce Labs Fleece Jacket';
  // GIVEN
  expect(await user.getPerceivedProducts()).toContainEqual({ label: product, price: 49.99 });
  expect(await user.getPerceivedProductButton(product)).toBe('Add to cart');
  expect(await user.getPerceivedCartCount()).toBe(0);
  // WHEN
  await user.addToCart(product);
  // THEN
  expect(await user.getPerceivedProductButton(product)).toBe('Remove');
  expect(await user.getPerceivedCartCount()).toBe(1);
  await user.openCart();
  expect(await user.getPerceivedCartItems()).toEqual([
    expect.objectContaining({ quantity: 1, label: product, price: 49.99 }),
  ]);
});

test('S2 - supprimer un produit du panier', async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie');
  await user.openCart();
  expect(labels(await user.getPerceivedCartItems())).toEqual([
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Onesie',
  ]);
  expect(await user.getPerceivedCartCount()).toBe(3);
  // WHEN
  await user.removeFromCart('Sauce Labs Bike Light');
  // THEN
  expect(labels(await user.getPerceivedCartItems())).toEqual(['Sauce Labs Backpack', 'Sauce Labs Onesie']);
  expect(await user.getPerceivedCartCount()).toBe(2);
  await user.backToProducts();
  expect(await user.getPerceivedProducts()).toContainEqual({ label: 'Sauce Labs Bike Light', price: 9.99 });
  // invariant : « Remove » si et seulement si l'article est dans le panier
  expect(await user.getPerceivedProductButton('Sauce Labs Bike Light')).toBe('Add to cart');
  expect(await user.getPerceivedProductButton('Sauce Labs Backpack')).toBe('Remove');
  expect(await user.getPerceivedProductButton('Sauce Labs Onesie')).toBe('Remove');
});

test('S4 - consulter le panier', async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt');
  expect(await user.getPerceivedCartCount()).toBe(2);
  // WHEN
  await user.openCart();
  // THEN
  expect(await user.getPerceivedPageTitle()).toBe('Your Cart');
  const items = await user.getPerceivedCartItems();
  expect(items).toEqual([
    expect.objectContaining({ quantity: 1, label: 'Sauce Labs Backpack', price: 29.99 }),
    expect.objectContaining({ quantity: 1, label: 'Sauce Labs Bolt T-Shirt', price: 15.99 }),
  ]);
  for (const item of items) expect(item.description).not.toBe('');
  expect(await user.getPerceivedButtons()).toEqual(['Remove', 'Continue Shopping', 'Checkout']);
});

test('S8 - vider le panier', async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Bike Light');
  await user.openCart();
  expect(await user.getPerceivedCartItems()).toHaveLength(2);
  expect(await user.getPerceivedCartCount()).toBe(2);
  // WHEN
  await user.emptyCart();
  // THEN
  expect(await user.getPerceivedCartItems()).toEqual([]);
  expect(await user.getPerceivedCartCount()).toBe(0);
});
