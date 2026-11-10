const TEXT_FAMILIES = [
  'Noto Sans',
  'Noto Sans Arabic',
  'Noto Sans Hebrew',
  'Noto Sans Devanagari',
  'Noto Sans Bengali',
  'Noto Sans Tamil',
  'Noto Sans Thai',
  'Noto Sans Georgian',
  'Noto Sans Armenian',
  'Noto Sans Ethiopic',
  'Noto Sans JP',
  'Noto Sans KR',
  'Noto Sans SC',
]

export const FONT_STACK = [...TEXT_FAMILIES.map((f) => `'${f}'`), 'sans-serif'].join(', ')
export const DISPLAY_FONT = "'Dancing Script', 'Segoe Script', cursive"

const MAX_WAIT_MS = 3000

/**
 * Charge les polices nécessaires à `sampleText` avant de mesurer les mots.
 * Google Fonts découpe les polices par plages Unicode et ne les télécharge qu'à
 * la demande : `document.fonts.ready` seul ne suffit pas pour du texte en canvas.
 * Ne bloque jamais plus de 3 s (réseau lent → polices de secours).
 */
export function waitForFonts(sampleText: string): Promise<void> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined
  if (!fonts?.load) return Promise.resolve()
  const loads = [
    ...TEXT_FAMILIES.map((f) => fonts.load(`16px '${f}'`, sampleText)),
    fonts.load(`700 16px 'Dancing Script'`, sampleText),
  ].map((p) => p.catch(() => []))
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS))
  return Promise.race([Promise.all(loads).then(() => undefined), timeout])
}
