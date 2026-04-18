/**
 * CRDT CONFLICT RESOLUTION (LWW-ELEMENT-SET)
 * Ensures non-destructive merging of offline data from multiple staff.
 */
export interface SyncElement {
  id: string;
  data: any;
  timestamp: number; // Client-side high-res timestamp
}

export class CrdtSyncService {
  /**
   * Merges a local set of changes with the incoming server set.
   * Logic: If two staff edited the same item, the one with the higher timestamp wins.
   */
  static merge(local: SyncElement[], incoming: SyncElement[]): SyncElement[] {
    const registry = new Map<string, SyncElement>();

    // Load incoming changes
    incoming.forEach(el => registry.set(el.id, el));

    // Merge local changes
    local.forEach(localEl => {
      const existing = registry.get(localEl.id);
      if (!existing || localEl.timestamp > existing.timestamp) {
        registry.set(localEl.id, localEl);
      }
    });

    return Array.from(registry.values());
  }
}
