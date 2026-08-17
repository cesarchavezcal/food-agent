export interface CachedFood {
  id: string;
  name: string;
  groupId: string;
  groupName?: string;
  gramsPerEquivalent: number;
  kcal100g: number;
  protein100g: number;
  fat100g: number;
  cho100g: number;
}

export class FoodLruCache {
  private cache: Map<string, CachedFood> = new Map();
  private readonly maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  private normalizeKey(key: string): string {
    return key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  public get(foodName: string): CachedFood | undefined {
    const key = this.normalizeKey(foodName);
    const item = this.cache.get(key);
    if (item) {
      // Refresh LRU order (delete & re-insert)
      this.cache.delete(key);
      this.cache.set(key, item);
      return item;
    }
    return undefined;
  }

  public set(foodName: string, food: CachedFood): void {
    const key = this.normalizeKey(foodName);
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest item (first key in iteration)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, food);
  }

  public invalidate(foodName?: string): void {
    if (foodName) {
      const key = this.normalizeKey(foodName);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global in-memory cache singleton
export const foodCache = new FoodLruCache();
