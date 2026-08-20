/**
 * Statuses are configurable rows, so the workflow is derived from their order
 * rather than a hardcoded map: the main chain is the active statuses sorted by
 * sortOrder, and statuses flagged `allowFromAny` (returned, cancelled) sit
 * outside that chain and stay reachable from anywhere.
 */
export type StatusDefLike = {
  id: string;
  code: string;
  label: string;
  color: string;
  sortOrder: number;
  isInitial: boolean;
  isFinal: boolean;
  allowFromAny: boolean;
  isActive: boolean;
};

/** Tailwind needs literal class names, so colors come from a fixed palette. */
export const STATUS_COLOR_STYLES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const STATUS_COLORS = Object.keys(STATUS_COLOR_STYLES);

export function statusColorClass(color: string): string {
  return STATUS_COLOR_STYLES[color] ?? STATUS_COLOR_STYLES.slate;
}

function byOrder<T extends StatusDefLike>(defs: T[]): T[] {
  return [...defs].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The linear part of the workflow — what a shipment walks through in order. */
export function statusChain<T extends StatusDefLike>(defs: T[]): T[] {
  return byOrder(defs.filter((d) => d.isActive && !d.allowFromAny));
}

/** Statuses reachable at any point, e.g. Returned. */
export function exceptionStatuses<T extends StatusDefLike>(defs: T[]): T[] {
  return byOrder(defs.filter((d) => d.isActive && d.allowFromAny));
}

export function initialStatus<T extends StatusDefLike>(defs: T[]): T | undefined {
  const active = statusChain(defs);
  return active.find((d) => d.isInitial) ?? active[0];
}

export function allowedNextStatuses<T extends StatusDefLike>(
  currentId: string,
  defs: T[],
): T[] {
  const current = defs.find((d) => d.id === currentId);
  if (!current || current.isFinal) return [];

  const chain = statusChain(defs);
  const next = chain.find((d) => d.sortOrder > current.sortOrder);
  const exceptions = exceptionStatuses(defs).filter((d) => d.id !== currentId);

  return next ? [next, ...exceptions] : exceptions;
}

export function canTransitionStatus<T extends StatusDefLike>(
  fromId: string,
  toId: string,
  defs: T[],
): boolean {
  if (fromId === toId) return true;
  return allowedNextStatuses(fromId, defs).some((d) => d.id === toId);
}

/** Rough completion for the public progress bar. */
export function statusProgress<T extends StatusDefLike>(
  statusId: string,
  defs: T[],
): number {
  const current = defs.find((d) => d.id === statusId);
  if (!current) return 0;
  if (current.isFinal || current.allowFromAny) return 100;

  const chain = statusChain(defs);
  const index = chain.findIndex((d) => d.id === statusId);
  if (index < 0 || chain.length === 0) return 0;
  return Math.round(((index + 1) / chain.length) * 100);
}

/** Derives a stable code from a human label typed in the settings page. */
export function toStatusCode(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}
