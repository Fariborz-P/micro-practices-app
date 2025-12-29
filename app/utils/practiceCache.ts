type Practice = any;

const practiceCache: Record<string, Practice[]> = {};

export function getCachedPractices(category: string): Practice[] | null {
  return practiceCache[category] ?? null;
}

export function setCachedPractices(category: string, practices: Practice[]) {
  practiceCache[category] = practices;
}

export function clearPracticeCache() {
  Object.keys(practiceCache).forEach((k) => delete practiceCache[k]);
}
