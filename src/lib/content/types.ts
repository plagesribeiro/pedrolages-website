export type Folder = 'md' | 'html' | 'pdf';
export type Visibility = 'public' | 'private';

export interface ContentItem {
  /** slug relative to public/ or private/ root, no extension. e.g. "notas/dia-1" */
  slug: string;
  /** site URL, e.g. "/md/notas/dia-1" */
  url: string;
  visibility: Visibility;
  /** parent folder relative to public/ or private/ root. "" for top-level. */
  folder: string;
  /** filename without extension */
  name: string;
  /** Drive file ID — used to fetch the actual content / proxy the PDF */
  driveId: string;
}

export interface Manifest {
  md: ContentItem[];
  html: ContentItem[];
  pdf: ContentItem[];
  /** ISO timestamp of when this manifest was built (for debugging) */
  builtAt: string;
}

export const EMPTY_MANIFEST: Manifest = {
  md: [],
  html: [],
  pdf: [],
  builtAt: new Date(0).toISOString()
};
