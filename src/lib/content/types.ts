export type Kind = 'md' | 'html' | 'pdf';
export type Visibility = 'public' | 'private';

export interface ContentItem {
  /** slug relative to public/ or private/, WITH extension. e.g. "notas/dia-1.md" */
  slug: string;
  /** site URL, e.g. "/docs/notas/dia-1.md" */
  url: string;
  kind: Kind;
  visibility: Visibility;
  /** parent folder relative to public/ or private/. "" for top-level. */
  folder: string;
  /** filename WITH extension, e.g. "dia-1.md" — used as display name */
  name: string;
  /** Drive file ID — used to fetch the content / proxy the PDF */
  driveId: string;
  /** ISO from Drive — drives the per-file cache key so edits invalidate. */
  modifiedTime: string;
}

export interface Manifest {
  items: ContentItem[];
  /** ISO timestamp of when this manifest was built (for debugging) */
  builtAt: string;
  /** deterministic short hash of items — clients poll this to know if anything moved */
  revisionTag: string;
}

export const EMPTY_MANIFEST: Manifest = {
  items: [],
  builtAt: new Date(0).toISOString(),
  revisionTag: '0'
};
