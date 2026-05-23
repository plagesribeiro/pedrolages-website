import type { PageLoad } from './$types';

type BannerKind = 'linkedin' | 'kofi';

const VALID: BannerKind[] = ['linkedin', 'kofi'];

export const load: PageLoad = ({ url }) => {
  const raw = url.searchParams.get('for') ?? 'linkedin';
  const kind: BannerKind = (VALID as string[]).includes(raw) ? (raw as BannerKind) : 'linkedin';
  const sizes: Record<BannerKind, { w: number; h: number; label: string }> = {
    linkedin: { w: 1584, h: 396, label: 'LinkedIn cover' },
    kofi: { w: 1500, h: 500, label: 'Buy Me a Coffee cover' }
  };
  return { kind, ...sizes[kind] };
};
