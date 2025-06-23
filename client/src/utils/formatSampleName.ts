export function formatSampleName(name: string): string {

  const parts = name.split('_');
  if (parts.length > 1) {
    return `${parts[0]} (${parts.slice(1).join(' ')})`;
  }
  return name;
}