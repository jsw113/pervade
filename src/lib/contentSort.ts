/**
 * Utility functions for checking 1st-priority pin status and sorting contents.
 */

export interface PinnableContent {
  id: string;
  order?: number | null;
  isPinned?: boolean | null;
  pinUntil?: Date | string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

/**
 * Checks if a content item is currently pinned (isPinned === true and not expired).
 */
export function isContentPinned(item: PinnableContent, referenceDate: Date = new Date()): boolean {
  if (!item.isPinned) return false;
  if (!item.pinUntil) return true; // Permanent pin

  const expiry = new Date(item.pinUntil);
  return expiry.getTime() > referenceDate.getTime();
}

/**
 * Returns a human-friendly description of the pin status.
 * e.g., "상시 1순위 고정", "1순위 고정 (~2026.09.30)", "고정 만료됨 (2026.09.30)", "일반"
 */
export function getPinStatusText(item: PinnableContent): {
  isPinned: boolean;
  label: string;
  isExpired: boolean;
  expiryFormatted: string | null;
} {
  if (!item.isPinned) {
    return { isPinned: false, label: "일반", isExpired: false, expiryFormatted: null };
  }

  if (!item.pinUntil) {
    return { isPinned: true, label: "상시 1순위 고정", isExpired: false, expiryFormatted: null };
  }

  const expiry = new Date(item.pinUntil);
  const now = new Date();
  const isExpired = expiry.getTime() <= now.getTime();
  
  const yyyy = expiry.getFullYear();
  const mm = String(expiry.getMonth() + 1).padStart(2, "0");
  const dd = String(expiry.getDate()).padStart(2, "0");
  const expiryFormatted = `${yyyy}.${mm}.${dd}`;

  if (isExpired) {
    return {
      isPinned: false,
      label: `고정 만료됨 (${expiryFormatted})`,
      isExpired: true,
      expiryFormatted,
    };
  }

  return {
    isPinned: true,
    label: `1순위 고정 (~${expiryFormatted})`,
    isExpired: false,
    expiryFormatted,
  };
}

/**
 * Sorts an array of items by:
 * 1. Active 1st-priority pin (isPinned && !expired) -> Top
 * 2. Custom Order (ascending: 0, 1, 2...)
 * 3. Created date (descending: newest first)
 */
export function sortPinnableContents<T extends PinnableContent>(items: T[]): T[] {
  const now = new Date();
  return [...items].sort((a, b) => {
    const aPinned = isContentPinned(a, now);
    const bPinned = isContentPinned(b, now);

    // 1. Pinned status (pinned comes first)
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // 2. Order number (ascending: 0, 1, 2...)
    const aOrder = a.order ?? 0;
    const bOrder = b.order ?? 0;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // 3. Created At (descending: newest first)
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
