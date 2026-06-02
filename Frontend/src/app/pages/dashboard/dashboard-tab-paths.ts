const PANEL_TAB_SLUGS = [
  'feed',
  'postulaciones',
  'publicaciones',
  'postulantes',
  'mensajes',
  'mis-organizaciones',
  'publicar',
] as const;

export function rutaPanelTab(slug: (typeof PANEL_TAB_SLUGS)[number]): string[] {
  return ['/panel', slug];
}
