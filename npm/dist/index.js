/**
 * @file index.js
 * @brief Isomorphic REST client, route builder, and Xylem module locator for @tty-pt/axil-hyle.
 */

let loadNativeAddon = () => null;
let getPlatformPrebuildKeys = () => [];

if (typeof window === "undefined" && typeof process !== "undefined") {
  const candidates = [
    "@tty-pt/stele",
    new URL("../../../libstele/npm/dist/index.js", import.meta.url).href,
    new URL("../../../site/external/libstele/npm/dist/index.js", import.meta.url).href,
  ];
  for (const cand of candidates) {
    try {
      const stele = await import(cand);
      if (stele?.loadNativeAddon) {
        loadNativeAddon = stele.loadNativeAddon;
        if (typeof stele.getPlatformPrebuildKeys === "function") {
          getPlatformPrebuildKeys = stele.getPlatformPrebuildKeys;
        }
        break;
      }
    } catch {}
  }
}

const nativeBinding = loadNativeAddon ? loadNativeAddon(import.meta.url, "axil_hyle") : null;

export function getNativeAxilHyle() {
  return nativeBinding;
}

export function hasNativeModule() {
  if (nativeBinding && typeof nativeBinding.hasNativeModule === "function") {
    return Boolean(nativeBinding.hasNativeModule());
  }
  return getModulePath() !== null;
}

/**
 * Resolve the path to the bundled `libaxil-hyle` Xylem module (without `.so`/`.dylib`/`.dll` suffix)
 * for loading into `axil -m <modulePath>`. Returns null when unavailable (e.g. browser).
 *
 * @returns {string | null}
 */
export function getModulePath() {
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }
  const getModule = globalThis.process?.getBuiltinModule;
  if (!getModule) return null;
  const fs = getModule("fs");
  const path = getModule("path");
  const url = getModule("url");
  const pkgRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
  const keys = getPlatformPrebuildKeys();
  const dirs = [
    ...keys.map((k) => path.join(pkgRoot, "prebuilds", k)),
    path.join(pkgRoot, "build", "Release"),
    path.resolve(pkgRoot, "..", "lib"),
  ];
  for (const d of dirs) {
    const stem = path.join(d, "libaxil-hyle");
    if (
      fs.existsSync(`${stem}.so`) ||
      fs.existsSync(`${stem}.dylib`) ||
      fs.existsSync(`${stem}.dll`)
    ) {
      return stem;
    }
  }
  return null;
}

export function installRoutes() {
  if (nativeBinding && typeof nativeBinding.installRoutes === "function") {
    return Boolean(nativeBinding.installRoutes());
  }
  return false;
}

export function registerPartitionRoutes(spec) {
  if (!spec || typeof spec !== "object" || !spec.module || !spec.partitionSource) {
    return false;
  }
  if (nativeBinding && typeof nativeBinding.registerPartitionRoutes === "function") {
    return Boolean(nativeBinding.registerPartitionRoutes(spec));
  }
  return false;
}

/**
 * Build a canonical `/api/dataset/:dataset_id` URL path with optional item key, ordered partition, and query parameters.
 *
 * @param {string} datasetId
 * @param {object} [options]
 * @returns {string}
 */
export function buildDatasetUrl(datasetId, options = {}) {
  if (!datasetId) {
    throw new Error("datasetId is required");
  }
  let path = `/api/dataset/${encodeURIComponent(String(datasetId))}`;
  if (options.key !== undefined && options.key !== null && String(options.key) !== "") {
    path += `/${encodeURIComponent(String(options.key))}`;
    if (options.ordered) {
      path += "/ordered";
      if (options.index !== undefined && options.index !== null) {
        path += `/${encodeURIComponent(String(options.index))}`;
      }
    }
  }
  if (options.query && typeof options.query === "object") {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null && String(v) !== "") {
        params.set(k, String(v));
      }
    }
    const qs = params.toString();
    if (qs) path += `?${qs}`;
  }
  return path;
}

export class AxilHyleClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || "http://127.0.0.1:8080").replace(/\/+$/, "");
    this.headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };
    this._fetchImpl = options.fetch || globalThis.fetch;
  }

  async _request(path, init = {}) {
    if (typeof this._fetchImpl !== "function") {
      throw new Error("fetch is not available in this environment");
    }
    const headers = { ...this.headers, ...(init.headers || {}) };
    if (init.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const res = await this._fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
    const text = await res.text();
    let data = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {}
    if (!res.ok) {
      const err = new Error(data?.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  list(datasetId, query = {}) {
    return this._request(buildDatasetUrl(datasetId, { query }), { method: "GET" });
  }

  get(datasetId, key) {
    return this._request(buildDatasetUrl(datasetId, { key }), { method: "GET" });
  }

  create(datasetId, payload) {
    return this._request(buildDatasetUrl(datasetId), {
      method: "POST",
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  }

  update(datasetId, key, payload) {
    return this._request(buildDatasetUrl(datasetId, { key }), {
      method: "PUT",
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  }

  delete(datasetId, key) {
    return this._request(buildDatasetUrl(datasetId, { key }), { method: "DELETE" });
  }

  listOrdered(datasetId, key) {
    return this._request(buildDatasetUrl(datasetId, { key, ordered: true }), { method: "GET" });
  }

  appendOrdered(datasetId, key, payload) {
    return this._request(buildDatasetUrl(datasetId, { key, ordered: true }), {
      method: "POST",
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  }

  updateOrdered(datasetId, key, index, payload) {
    return this._request(buildDatasetUrl(datasetId, { key, ordered: true, index }), {
      method: "PUT",
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  }

  removeOrdered(datasetId, key, index) {
    return this._request(buildDatasetUrl(datasetId, { key, ordered: true, index }), {
      method: "DELETE",
    });
  }
}

export function createAxilHyleClient(options) {
  return new AxilHyleClient(options);
}
