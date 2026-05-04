import { BASE_PATH } from './config';

export const DEFAULT_PARTY_SLUG = 'main';

export function normalizePartySlug(value: string | null | undefined): string {
  const slug = (value ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug || DEFAULT_PARTY_SLUG;
}

export function currentPartySlug(): string {
  if (typeof window === 'undefined') return DEFAULT_PARTY_SLUG;
  const base = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname;
  const match = /^\/p\/([^/]+)/.exec(base);
  return normalizePartySlug(match?.[1]);
}

export function partyPath(path: string, slug = currentPartySlug()): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizePartySlug(slug) === DEFAULT_PARTY_SLUG
    ? normalizedPath
    : `/p/${normalizePartySlug(slug)}${normalizedPath}`;
}

export function apiUrl(path: string, slug = currentPartySlug()): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const separator = normalizedPath.includes('?') ? '&' : '?';
  return `${BASE_PATH}${normalizedPath}${separator}partySlug=${encodeURIComponent(normalizePartySlug(slug))}`;
}

export function withPartyBody<T extends Record<string, unknown>>(body: T, slug = currentPartySlug()): T & { partySlug: string } {
  return { ...body, partySlug: normalizePartySlug(slug) };
}
