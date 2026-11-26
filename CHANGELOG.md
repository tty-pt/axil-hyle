## [Unreleased]

### Changed
- **Standardized npm Metadata (`npm/package.json`, `npm/README.md`)**:
  - Standardized author, `BSD-2-Clause` license, and npm `README.md` documentation (`0d8e09c`).

## [1.1.4] - 2026-11-16

### Added
- **Windows (`winget` / `win32-x64`) OS Package & Prebuild Support**:
  - Added `_WIN32` compatibility shims (`strtok_r`, `strndup`, `S_ISDIR`) and `#if __has_include(<ttypt/auth.h>)` header guard in `src/libaxil-hyle.c`.
  - Expanded `.github/workflows/ci.yml` `publish_to` to all 7 OS formats (`deb,apk,rpm,pacman,brew,openbsd,winget`) and added `win32-x64` native N-API prebuild (`libaxil-hyle.dll`) to `@tty-pt/axil-hyle`.

## [1.1.3] - 2026-11-16

### Added
- **Colocated NPM Package `@tty-pt/axil-hyle` (`npm/`)**:
  - Added Node-API native addon (`npm/native/axil_hyle_napi.c`, `npm/native/LIBS`) and isomorphic REST dataset client (`npm/dist/index.js`, `npm/dist/index.d.ts`) exposing `AxilHyleClient`, `createAxilHyleClient()`, `buildDatasetUrl()`, `getModulePath()`, `hasNativeModule()`, `installRoutes()`, and `registerPartitionRoutes()`.
  - Bundled `libaxil-hyle` shared library prebuilds for `axil -m hyle` / `npx axil -m auth:hyle` and C header (`npm/include/ttypt/axil-hyle.h`) for zero-root downstream builds.
- **Direct Xylem Module Entrypoint (`src/libaxil-hyle.c`)**:
  - Added `xy_install(void)` and an idempotency guard in `axil_hyle_install_routes()` so `libaxil-hyle` mounts `/api/dataset/...` automatically when loaded directly via `axil -m hyle` while remaining safe when also invoked by downstream modules.

## [1.1.2] - 2026-11-16

### Fixed
- **Packaging Dependencies**: Explicitly added `libstele` across packaging dependencies (`deps`, `deps_apk`, `deps_rpm`, `deps_brew`, `deps_openbsd`, `deps_winget_tty`) and `axil-hyle.pc`.
- **Arch Linux (`pacman`) Packaging & OpenBSD Rebuild (`.github/workflows/ci.yml`)**:
  - Added `pacman` to `publish_to` (`deb,apk,rpm,pacman,brew,openbsd`), configured `deps_pacman: "axil,libstele,libcorm,libxylem,libhyle,libhyle-source,axil-auth,json-c"`, and switched to `secrets: inherit`.
  - Rebuilt OpenBSD package against `axil` `1.8.3`, `axil-auth` `1.3.3`, `libhyle` `1.7.4`, `libhyle-source` `1.4.1`, `libxylem` `1.8.1`, `libcorm` `2.4.2`, and `libstele` `1.7.1`.

## [1.1.0]

- **Ecosystem Synchronization**: Rebuilt and synchronized with Axil 1.6.0, Hyle 1.5.0, Hyle-Source 1.2.0, and Axil-Auth 1.2.1.
- **Documentation & Asset Parity**: Aligned documentation and standardized README architecture overview.

## [1.0.1] - 2026-10-24

- **Ecosystem Synchronization**: Rebuilt and synchronized with Hyle 1.4.0, Hyle-Source 1.1.0, Axil 1.5.0, and Corm 2.0.0. Cleaned compiler and linker flags.

## [1.0.0] - 2026-09-24

- **First stable release** — bridge library connecting Axil HTTP request handling with Hyle dataset queries and schema endpoints.
- **Dataset REST CRUD**: `axil_hyle_install_routes()` mounts the full endpoint set on Axil — query a dataset (`GET /api/dataset/:id`), get an item by key (`GET /:id/:key`), create (`POST /:id`), update (`PUT /:id/:key`), delete (`DELETE /:id/:key`) — all JSON, framework-neutral.
- **Ordered sub-resource endpoints**: ordered DSV collections get their own routes — `GET/POST /:id/:key/ordered` (read / append) and `PUT/DELETE /:id/:key/ordered/:n` (set / remove at row index `n`).
- **Partition sub-resource subsystem**: `axil_hyle_register_partition_routes(spec)` declaratively mounts child-partition CRUD for a parent module — `POST /api/:module/:id/:children` (add), positional `POST …/:child/:n/remove|replace`, or keyed `POST …/:child/:{child}_id` + `DELETE` (remove-by-id) and `POST …/:{child}_id/:update_action` (update). The spec carries a field-alias table, an optional `pin_field`, a pluggable `check_access` authorization callback, an `on_change` server-side hook, and an optional `redirect_pattern` for No-JS form fallback. `axil_hyle_partition_execute` runs the same actions (add/remove/replace/update) directly against an ordered dataset without mounting any route.
- **Mount**: call `axil_hyle_install_routes()` (or `axil_hyle_register_partition_routes`) from `xy_install()` to register the endpoint sets with Axil.
- **Dependencies**: `axil` (HTTP request + route registration), `libhyle` (core query parser and search engine), `libhyle-source` (dataset persistence).