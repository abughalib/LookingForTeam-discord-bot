import { RavenColonialProgress } from "./ravenTypes";
import {
  cacheColonizationProgress,
  getColonizationProgressCache,
} from "./database";
import { AppSettings } from "./settings";

export class RavenColonial {
  async checkProgressFromRevColonial(buildId: string) {
    // Check cache first
    let cachedData = await getColonizationProgressCache(buildId);
    if (cachedData) {
      return cachedData;
    }

    // Fetch from RavenColonial if not in cache

    const url = `${AppSettings.BOT_RAVENCOLONIAL_DETAIL_FETCH_URL}${buildId}`;
    let response = await fetch(url, {
      method: "GET",
      headers: AppSettings.BOT_REAL_BROWSER_HEADERS,
    });

    console.log("Cache miss, fetching from API for buildId:", buildId);

    if (!response.ok) {
      console.error(
        `Error fetching RavenColonial data: ${response.statusText}`,
      );
      return null;
    }

    let data: RavenColonialProgress = await response.json();

    // Cache the fetched data
    await cacheColonizationProgress(buildId, data);

    return data;
  }
}
