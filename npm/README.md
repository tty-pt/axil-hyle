<p align="center">
  <img src="https://raw.githubusercontent.com/tty-pt/axil-hyle/main/assets/logo.png" alt="@tty-pt/axil-hyle logo" width="220" />
</p>

# @tty-pt/axil-hyle

[![npm version](https://img.shields.io/npm/v/@tty-pt/axil-hyle.svg)](https://www.npmjs.com/package/@tty-pt/axil-hyle)
[![License: BSD-2-Clause](https://img.shields.io/badge/License-BSD--2--Clause-blue)](https://github.com/tty-pt/axil-hyle/blob/main/LICENSE)
[![TypeScript Ready](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](#)
[![Node.js Native](https://img.shields.io/badge/Node.js-N--API-339933?logo=node.js)](#)
[![REST Engine](https://img.shields.io/badge/API-REST%20CRUD-16A34A)](#)

> Schema-driven REST CRUD connector, partition route registrar, and isomorphic HTTP dataset client bridging [`@tty-pt/axil`](https://www.npmjs.com/package/@tty-pt/axil), [`@tty-pt/hyle`](https://www.npmjs.com/package/@tty-pt/hyle), and [`@tty-pt/hyle-source`](https://www.npmjs.com/package/@tty-pt/hyle-source). Canonical C header: `<ttypt/axil-hyle.h>`.

📖 **Full C & Systems Documentation**: See the main [**axil-hyle GitHub README**](https://github.com/tty-pt/axil-hyle#readme) for the complete C route wiring, REST endpoint grammar, and `libhyle-source` driver integration.

---

## 1. Overview & Domain Concepts

`axil-hyle` (`libaxil-hyle.so` / `@tty-pt/axil-hyle`) turns registered Hyle dataset schemas into paginated, searchable REST APIs with automatic validation and ordered child-collection management:

1. **Automatic Dataset REST Endpoints**:
   - Mounts `GET /api/dataset/:id` (search, filter, sort, pagination), `GET /api/dataset/:id/:item_id`, `POST /api/dataset/:id`, `PUT /api/dataset/:id/:item_id`, `DELETE /api/dataset/:id/:item_id`, and `GET /api/schema/:id`.
2. **Accent-Sensitive Search & Structured Filtering**:
   - Supports `?q=<search>` (accent-preserving lexical search via [`liblemma`](https://github.com/tty-pt/liblemma), where `pão ≠ pao`), `?filter_<field>=<val>`, `?sort=<field>&order=asc|desc`, and `?limit=<n>&page=<n>`.
3. **Ordered Partition & Child Collection Routes**:
   - Manages ordered child sequences (such as setlists in a gig or repertoire items in a group) via `listOrdered`, `appendOrdered`, `updateOrdered`, and `removeOrdered`.
4. **Isomorphic TypeScript Client (`AxilHyleClient`)**:
   - Zero-dependency client for browsers, Node.js, and Next.js Server Components with customizable `fetch` and header injection.

---

## 2. Installation

```bash
npm install @tty-pt/axil-hyle
```

**Native OS Packages (`tty.pt`)**: Prebuilt native C packages (`axil-hyle`) for Linux (`apt`, `apk`, `pacman`, `dnf`), macOS (`brew`), Windows (`winget`, MSYS2), and OpenBSD (`pkg_add`) are available via the [**tty.pt package repositories**](https://github.com/tty-pt/ci/blob/main/docs/install.md).

---

## 3. Quickstart

### Launch `axil` with `axil-hyle` Loaded

```bash
npx axil -d -p 8080 -m auth:hyle
```

### Query & Mutate Datasets with `createAxilHyleClient`

```typescript
import {
  createAxilHyleClient,
  buildDatasetUrl,
  getModulePath
} from "@tty-pt/axil-hyle";

const client = createAxilHyleClient({ baseUrl: "http://127.0.0.1:8080" });

// 1. Paginated full-text search & filtering
const songs = await client.list("song", {
  q: "fado",
  sort: "title",
  order: "asc",
  limit: 20,
  page: 1
});

// 2. Fetch, create, update, and delete a record
const song = await client.get("song", "song_1");
await client.create("song", { id: "song_2", title: "Canção do Mar" });
await client.update("song", "song_2", { title: "Canção do Mar (Live)" });
await client.delete("song", "song_2");

// 3. Manage ordered child collections (e.g. gig setlist items)
await client.appendOrdered("gig", "gig_2026", { song: "song_1", key: "Am" });
const setlist = await client.listOrdered("gig", "gig_2026");

// 4. Construct canonical dataset URLs directly
const url = buildDatasetUrl("song", { query: { q: "pão", limit: 10 } });
console.log("Dataset URL:", url, "Module path:", getModulePath());
```

---

## 4. JavaScript / TypeScript API Reference

### `createAxilHyleClient(options?: AxilHyleClientOptions): AxilHyleClient`
Creates an isomorphic HTTP client for `axil-hyle` dataset endpoints:
- `.list(datasetId: string, query?: Record<string, any>): Promise<any>`
- `.get(datasetId: string, key: string): Promise<any>`
- `.create(datasetId: string, payload: Record<string, any> | string): Promise<any>`
- `.update(datasetId: string, key: string, payload: Record<string, any> | string): Promise<any>`
- `.delete(datasetId: string, key: string): Promise<any>`
- `.listOrdered(datasetId: string, key: string): Promise<any>`
- `.appendOrdered(datasetId: string, key: string, payload: Record<string, any> | string): Promise<any>`
- `.updateOrdered(datasetId: string, key: string, index: number, payload: Record<string, any> | string): Promise<any>`
- `.removeOrdered(datasetId: string, key: string, index: number): Promise<any>`

### URL & Native Route Registration
- `buildDatasetUrl(datasetId: string, options?: DatasetUrlOptions): string`: Builds canonical `/api/dataset/:id` URLs with key, ordered index, and query parameters.
- `installRoutes(): boolean`: Mounts the generic Hyle REST CRUD handlers into an active native `axil` host process.
- `registerPartitionRoutes(spec: PartitionRoutesSpec): boolean`: Registers partition/ordered child route handlers in a native `axil` host process.
- `getModulePath(): string | null`: Resolves the prebuilt `libaxil-hyle` shared library path for `axil -m`.

---

## 5. C Development Headers & Native Integration

```makefile
CFLAGS += -I./node_modules/@tty-pt/axil-hyle/include
LDLIBS += -laxil-hyle
```

---

## License

BSD-2-Clause — Copyright (c) 2026, Paulo Quirino <quirinpa@gmail.com>. See [LICENSE](https://github.com/tty-pt/axil-hyle/blob/main/LICENSE).
