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

/** Solid fills for icons and timeline nodes, keyed by the same palette. */
const STATUS_SOLID_STYLES: Record<string, string> = {
  slate: "bg-slate-500 text-white",
  blue: "bg-blue-500 text-white",
  indigo: "bg-indigo-500 text-white",
  violet: "bg-violet-500 text-white",
  sky: "bg-sky-500 text-white",
  amber: "bg-amber-500 text-white",
  orange: "bg-orange-500 text-white",
  emerald: "bg-emerald-500 text-white",
  red: "bg-red-500 text-white",
};

export function statusSolidClass(color: string): string {
  return STATUS_SOLID_STYLES[color] ?? STATUS_SOLID_STYLES.slate;
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

export type JourneyStep<T> = T & { state: "done" | "current" | "problem" };

export type TrackingJourney<T> = {
  /** What actually happened, oldest first. */
  steps: JourneyStep<T>[];
  /** The final status still ahead (e.g. Delivered), if not yet reached. */
  target?: T;
  /** The shipment ended on a problem status (e.g. Returned). */
  halted: boolean;
  /** Estimated 0–100; only a successful final status reads as 100. */
  progress: number;
};

/** Red statuses are problems (returned, cancelled, failed delivery…). */
export function isProblemStatus(def: { color: string }): boolean {
  return def.color === "red";
}

/**
 * The public stepper, built from the shipment's recorded history rather than
 * the configured order: admins often mark most statuses "allowFromAny", so the
 * order a shipment really moved through is the only reliable sequence.
 */
export function trackingJourney<T extends StatusDefLike>(
  statusId: string,
  historyStatusIds: string[],
  defs: T[],
): TrackingJourney<T> {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const ids = historyStatusIds.length > 0 ? historyStatusIds : [statusId];

  // Collapse back-to-back repeats, e.g. a delivery that was retried.
  const visited = ids
    .filter((id, i) => id !== ids[i - 1])
    .map((id) => byId.get(id))
    .filter((d): d is T => d != null);

  const last = visited.at(-1);
  const halted = last != null && isProblemStatus(last);
  const finished = last != null && last.isFinal && !halted;

  const steps = visited.map((d, i) => ({
    ...d,
    state: isProblemStatus(d)
      ? ("problem" as const)
      : i === visited.length - 1 && !finished
        ? ("current" as const)
        : ("done" as const),
  }));

  const ordered = defs
    .filter((d) => d.isActive && !isProblemStatus(d))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const target =
    finished || halted ? undefined : ordered.find((d) => d.isFinal);

  if (finished) return { steps, halted, progress: 100 };

  // Estimate from the furthest healthy step: what's done vs. what the
  // configured order still has ahead of it (ending at the target).
  const reached = [...visited].reverse().find((d) => !isProblemStatus(d));
  const done = steps.filter((s) => s.state !== "problem").length;
  const ahead = reached
    ? ordered.filter((d) => !d.isFinal && d.sortOrder > reached.sortOrder).length + 1
    : ordered.length;
  const progress = Math.round((done / (done + ahead)) * 100);

  return {
    steps,
    target,
    halted,
    progress: Math.min(Math.max(progress, 5), 95),
  };
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
