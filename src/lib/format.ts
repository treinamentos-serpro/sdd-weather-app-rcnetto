const numberFormat = new Intl.NumberFormat('pt-BR');
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatMetric(value: number | null, suffix: string): string {
  return value === null || !Number.isFinite(value)
    ? 'Indisponível'
    : `${numberFormat.format(value)}${suffix}`;
}

/** Data civil da cidade: UTC é somente uma âncora, não uma conversão de fuso. */
export function formatForecastDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return 'Data inválida';
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  if (
    year < 1 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return 'Data inválida';
  return dateFormat
    .formatToParts(date)
    .map((part) => (part.type === 'year' ? part.value.padStart(4, '0') : part.value))
    .join('');
}
