import { test, expect } from '../dsl/fixtures';

// Scénario S3 : docs/dsl-actions-perceptions.md §3

test("S3 - afficher les détails d'un produit", async ({ user }) => {
  const product = 'Sauce Labs Bike Light';
  // GIVEN
  expect(await user.getPerceivedProducts()).toContainEqual({ label: product, price: 9.99 });
  // WHEN
  await user.openProductDetails(product);
  // THEN
  const details = await user.getPerceivedProductDetails();
  expect(details.label).toBe(product);
  expect(details.description).toBe(
    "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  );
  expect(details.price).toBe(9.99);
  expect(await user.getPerceivedButtons()).toEqual(
    expect.arrayContaining(['Add to cart', 'Back to products']),
  );
});
