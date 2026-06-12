import * as https from "https";
import { AppSettings } from "./settings";

/**
 * A drop-in https.request wrapper that mimics curl's minimal request format,
 * bypassing Cloudflare TLS/bot fingerprint detection that blocks Node's native fetch (undici).
 *
 * Returns a fetch-like response object with .ok, .status, .statusText, .text(), .json().
 */
export function httpsRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<{
  ok: boolean;
  status: number | undefined;
  statusText: string | undefined;
  text: () => Promise<string>;
  json: () => Promise<any>;
}> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      port: 443,
      method: options.method || "GET",
      headers: options.headers || AppSettings.BOT_HEADER,
    };

    const req = https.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk: any) => (data += chunk));
      res.on("end", () => {
        const ok = res.statusCode
          ? res.statusCode >= 200 && res.statusCode < 300
          : false;
        resolve({
          ok,
          status: res.statusCode,
          statusText: res.statusMessage,
          text: async () => data,
          json: async () => JSON.parse(data),
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}
