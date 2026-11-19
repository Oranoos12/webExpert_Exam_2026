// Datum mooi tonen, bv. "za 21/11/2026 20:00"
export function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString('nl-BE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Bevat de tekst het zoekwoord? (hoofdletters maken niet uit)
export function containsText(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.trim().toLowerCase());
}