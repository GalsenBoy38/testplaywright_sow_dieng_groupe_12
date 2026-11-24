/** "$29.99", "Item total: $47.97", "Tax: $3.84" → 29.99, 47.97, 3.84 */
export function parseAmount(text: string): number {
  const match = text.match(/\$\s*(\d+(?:\.\d+)?)/) ?? text.match(/(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Montant illisible : "${text}"`);
  return Number(match[1]);
}

/** Échappe un texte pour l'utiliser dans une expression régulière. */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Expression régulière qui reconnaît exactement ce texte (espaces autour tolérés). */
export function exactly(text: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`);
}
