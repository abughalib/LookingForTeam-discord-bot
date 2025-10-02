import {
  getSystemInfoFromCache,
  cacheSystemInfo,
  clearSystemInfoCache,
  getSystemInfoCacheStats,
} from "../utils/database";
import { SystemInfo } from "../utils/models";

describe("System Info Cache", () => {
  const mockSystemInfo: SystemInfo = {
    name: "Sol",
    coords: {
      x: 0,
      y: 0,
      z: 0,
    },
    coordsLocked: true,
  };

  beforeEach(async () => {
    // Clear cache before each test
    await clearSystemInfoCache();
  });

  afterAll(async () => {
    // Clear cache after all tests
    await clearSystemInfoCache();
  });

  test("should cache and retrieve system info", async () => {
    // Initially should not be in cache
    const initialResult = await getSystemInfoFromCache("Sol");
    expect(initialResult).toBeNull();

    // Cache the system info
    await cacheSystemInfo(mockSystemInfo);

    // Now should be in cache
    const cachedResult = await getSystemInfoFromCache("Sol");
    expect(cachedResult).not.toBeNull();
    expect(cachedResult?.name).toBe("sol"); // Should be lowercase in cache
    expect(cachedResult?.coords.x).toBe(0);
    expect(cachedResult?.coords.y).toBe(0);
    expect(cachedResult?.coords.z).toBe(0);
    expect(cachedResult?.coordsLocked).toBe(true);
  });

  test("should be case insensitive", async () => {
    await cacheSystemInfo(mockSystemInfo);

    // Should find with different cases
    const result1 = await getSystemInfoFromCache("SOL");
    const result2 = await getSystemInfoFromCache("sol");
    const result3 = await getSystemInfoFromCache("Sol");

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result3).not.toBeNull();
    expect(result1?.name).toBe(result2?.name);
    expect(result2?.name).toBe(result3?.name);
  });

  test("should update existing cache entry", async () => {
    await cacheSystemInfo(mockSystemInfo);

    // Update with different coordinates
    const updatedSystemInfo: SystemInfo = {
      name: "Sol",
      coords: {
        x: 1,
        y: 2,
        z: 3,
      },
      coordsLocked: false,
    };

    await cacheSystemInfo(updatedSystemInfo);

    const result = await getSystemInfoFromCache("Sol");
    expect(result?.coords.x).toBe(1);
    expect(result?.coords.y).toBe(2);
    expect(result?.coords.z).toBe(3);
    expect(result?.coordsLocked).toBe(false);
  });

  test("should provide accurate cache statistics", async () => {
    let stats = await getSystemInfoCacheStats();
    expect(stats.totalEntries).toBe(0);

    await cacheSystemInfo(mockSystemInfo);

    stats = await getSystemInfoCacheStats();
    expect(stats.totalEntries).toBe(1);
    expect(stats.oldestEntry).not.toBeNull();
    expect(stats.newestEntry).not.toBeNull();
  });

  test("should clear cache completely", async () => {
    await cacheSystemInfo(mockSystemInfo);

    let stats = await getSystemInfoCacheStats();
    expect(stats.totalEntries).toBe(1);

    await clearSystemInfoCache();

    stats = await getSystemInfoCacheStats();
    expect(stats.totalEntries).toBe(0);

    const result = await getSystemInfoFromCache("Sol");
    expect(result).toBeNull();
  });
});
