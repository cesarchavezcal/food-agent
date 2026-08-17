import { describe, it, expect, beforeEach } from "vitest";
import { FoodLruCache, type CachedFood } from "../../agent/tools/cache.js";

describe("In-Memory LRU Food Cache", () => {
  let cache: FoodLruCache;

  beforeEach(() => {
    cache = new FoodLruCache(3);
  });

  const sampleFood1: CachedFood = {
    id: "manzana",
    name: "Manzana",
    groupId: "frutas",
    gramsPerEquivalent: 138,
    kcal100g: 52,
    protein100g: 0.3,
    fat100g: 0.2,
    cho100g: 13.8,
  };

  const sampleFood2: CachedFood = {
    id: "pollo",
    name: "Pechuga de pollo",
    groupId: "aoa_muy_bajo_grasa",
    gramsPerEquivalent: 30,
    kcal100g: 120,
    protein100g: 23,
    fat100g: 1.5,
    cho100g: 0,
  };

  it("should store and retrieve normalized food items", () => {
    cache.set("Manzana", sampleFood1);
    const hit = cache.get("manzana ");
    expect(hit).toBeDefined();
    expect(hit?.name).toBe("Manzana");
    expect(hit?.gramsPerEquivalent).toBe(138);
  });

  it("should handle accented characters seamlessly", () => {
    cache.set("Plátano", sampleFood1);
    const hit = cache.get("platano");
    expect(hit).toBeDefined();
  });

  it("should evict oldest items when max capacity is reached", () => {
    cache.set("item1", { ...sampleFood1, id: "1" });
    cache.set("item2", { ...sampleFood1, id: "2" });
    cache.set("item3", { ...sampleFood1, id: "3" });
    expect(cache.size()).toBe(3);

    // Adding 4th item evicts item1
    cache.set("item4", { ...sampleFood1, id: "4" });
    expect(cache.size()).toBe(3);
    expect(cache.get("item1")).toBeUndefined();
    expect(cache.get("item2")).toBeDefined();
    expect(cache.get("item4")).toBeDefined();
  });

  it("should invalidate specific key or clear entirely", () => {
    cache.set("manzana", sampleFood1);
    cache.set("pollo", sampleFood2);
    expect(cache.size()).toBe(2);

    cache.invalidate("manzana");
    expect(cache.get("manzana")).toBeUndefined();
    expect(cache.get("pollo")).toBeDefined();

    cache.invalidate();
    expect(cache.size()).toBe(0);
  });
});
