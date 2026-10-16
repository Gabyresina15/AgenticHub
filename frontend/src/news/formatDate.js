const formatter = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatNewsDate(isoDate) {
  return formatter.format(new Date(`${isoDate}T00:00:00Z`));
}
