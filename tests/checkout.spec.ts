import { test, expect, type CustomerInfo } from '../dsl/fixtures';

// Scénarios S5, S6, S7 : docs/dsl-actions-perceptions.md §3

const JEAN: CustomerInfo = { firstName: 'Jean', lastName: 'LECOQ', postalCode: '75000' };

test('S7 - générer la facture', async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Onesie');
  await user.startCheckout();
  await user.submitCustomerInfo(JEAN);
  const summary = await user.getPerceivedOrderSummary(); // récapitulatif de cette commande
  // WHEN
  await user.finishOrder();
  // THEN
  expect(await user.getPerceivedPageTitle()).toBe('Checkout: Complete!');
  expect(await user.getPerceivedConfirmation()).toBe('Thank you for your order!');
  expect(await user.getPerceivedCartCount()).toBe(0);
  // WHEN
  await user.generateInvoice();
  // THEN
  const invoice = await user.getPerceivedInvoice();
  expect(invoice.fileName).toMatch(/^swag-labs-order-.+\.pdf$/);
  expect(invoice.orderDate).not.toBe('');
  expect(invoice.shipTo).toEqual({ name: 'Jean LECOQ', postalCode: '75000' });
  expect(invoice.lines).toEqual([
    { label: 'Sauce Labs Backpack', price: 29.99 },
    { label: 'Sauce Labs Onesie', price: 7.99 },
  ]);
  expect(invoice.itemTotal).toBeCloseTo(37.98, 2);
  expect(invoice.tax).toBeCloseTo(3.04, 2);
  expect(invoice.total).toBeCloseTo(41.02, 2);
  // invariant : la facture reprend exactement le récapitulatif de la même commande
  expect(invoice.lines).toEqual(summary.items.map(i => ({ label: i.label, price: i.price })));
  expect(invoice.itemTotal).toBeCloseTo(summary.itemTotal, 2);
  expect(invoice.tax).toBeCloseTo(summary.tax, 2);
  expect(invoice.total).toBeCloseTo(summary.total, 2);
});

test.describe('S5 - saisir ses informations', () => {
  test.beforeEach(async ({ user }) => {
    // GIVEN
    await user.addToCart('Sauce Labs Backpack');
    await user.startCheckout();
    expect(await user.getPerceivedPageTitle()).toBe('Checkout: Your Information');
    expect(await user.getPerceivedFormFields()).toEqual(['First Name', 'Last Name', 'Zip/Postal Code']);
  });

  test('cas nominal', async ({ user }) => {
    // WHEN
    await user.submitCustomerInfo(JEAN);
    // THEN
    expect(await user.getPerceivedPageTitle()).toBe('Checkout: Overview');
    expect(await user.getPerceivedErrorMessage()).toBeNull();
  });

  const cases: [keyof CustomerInfo, string][] = [
    ['firstName', 'Error: First Name is required'],
    ['lastName', 'Error: Last Name is required'],
    ['postalCode', 'Error: Postal Code is required'],
  ];
  for (const [missing, message] of cases) {
    test(`cas d'erreur : ${missing} vide`, async ({ user }) => {
      const partial: Partial<CustomerInfo> = { ...JEAN };
      delete partial[missing];
      // WHEN
      await user.submitCustomerInfo(partial);
      // THEN
      expect(await user.getPerceivedErrorMessage()).toBe(message);
      expect(await user.getPerceivedPageTitle()).toBe('Checkout: Your Information');
    });
  }
});

test("S6 - afficher le récapitulatif d'une commande", async ({ user }) => {
  // GIVEN
  await user.addToCart('Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Onesie');
  // WHEN
  await user.startCheckout();
  await user.submitCustomerInfo(JEAN);
  // THEN
  expect(await user.getPerceivedPageTitle()).toBe('Checkout: Overview');
  const summary = await user.getPerceivedOrderSummary();
  expect(summary.items.map(i => [i.quantity, i.label, i.price])).toEqual([
    [1, 'Sauce Labs Backpack', 29.99],
    [1, 'Sauce Labs Bike Light', 9.99],
    [1, 'Sauce Labs Onesie', 7.99],
  ]);
  expect(summary.paymentInformation).toBe('SauceCard #31337');
  expect(summary.shippingInformation).toBe('Free Pony Express Delivery!');
  expect(summary.itemTotal).toBeCloseTo(47.97, 2);
  expect(summary.tax).toBeCloseTo(3.84, 2);
  expect(summary.total).toBeCloseTo(51.81, 2);
  // invariants
  const sum = summary.items.reduce((s, i) => s + i.price * i.quantity, 0);
  expect(summary.itemTotal).toBeCloseTo(sum, 2);
  expect(summary.tax).toBeCloseTo(Math.round(summary.itemTotal * 8) / 100, 2);
  expect(summary.total).toBeCloseTo(summary.itemTotal + summary.tax, 2);
  expect(await user.getPerceivedButtons()).toEqual(['Cancel', 'Finish']);
});
