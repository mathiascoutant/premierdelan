// Helper pour gérer le basePath en production
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/premierdelan' : ''

export function getPath(path: string): string {
  return `${BASE_PATH}${path}`
}

export function navigateTo(path: string): void {
  window.location.href = getPath(path)
}

