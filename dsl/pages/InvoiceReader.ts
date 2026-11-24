import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import type { Invoice, InvoiceLine } from '../types';
import { parseAmount } from './amount';

/**
 * Lit la facture PDF "Order Receipt" de Sauce Demo et la transforme en données métier.
 *
 * Texte extrait (les titres de section sont espacés à cause du letter-spacing du PDF) :
 *   Order Date November 24, 2026 at 12:23 AM
 *   S H I P TO
 *   Jean LECOQ
 *   75000
 *   I T E M S
 *   DESCRIPTION PRICE
 *   Sauce Labs Backpack $29.99
 *   Item total $37.98
 *   Tax $3.04
 *   Total $41.02
 */
export async function readInvoice(path: string, fileName: string): Promise<Invoice> {
  const parser = new PDFParse({ data: await readFile(path) });
  try {
    const { text } = await parser.getText();
    return parseInvoiceText(text, fileName);
  } finally {
    await parser.destroy();
  }
}

/** Analyse le texte extrait du PDF (exportée pour pouvoir être testée seule). */
export function parseInvoiceText(text: string, fileName: string): Invoice {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  // "S H I P TO" → "SHIPTO" : on compare les lignes sans espaces, en majuscules
  const compact = (l: string) => l.replace(/\s+/g, '').toUpperCase();
  const indexOf = (title: string) => lines.findIndex(l => compact(l) === title);
  const valueAfter = (label: RegExp) => {
    const line = lines.find(l => label.test(l));
    if (!line) throw new Error(`Facture : rubrique introuvable ${label}\n${text}`);
    return line.replace(label, '').trim();
  };

  // Destinataire : les lignes entre "SHIP TO" et "ITEMS"
  const shipToStart = indexOf('SHIPTO');
  const itemsStart = indexOf('ITEMS');
  const shipToLines = shipToStart >= 0 ? lines.slice(shipToStart + 1, itemsStart) : [];

  // Lignes de la facture : entre l'en-tête "DESCRIPTION PRICE" et "Item total"
  const tableStart = indexOf('DESCRIPTIONPRICE');
  const tableEnd = lines.findIndex(l => /^Item total\b/.test(l));
  const invoiceLines: InvoiceLine[] = lines.slice(tableStart + 1, tableEnd).map(line => {
    const match = line.match(/^(.*\S)\s+\$(\d+\.\d{2})$/);
    if (!match) throw new Error(`Facture : ligne illisible "${line}"`);
    return { label: match[1], price: Number(match[2]) };
  });

  return {
    fileName,
    orderDate: valueAfter(/^Order Date\b/),
    shipTo: { name: shipToLines[0] ?? '', postalCode: shipToLines[1] ?? '' },
    lines: invoiceLines,
    itemTotal: parseAmount(valueAfter(/^Item total\b/)),
    tax: parseAmount(valueAfter(/^Tax\b/)),
    total: parseAmount(valueAfter(/^Total\b/)),
  };
}
