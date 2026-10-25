## [1.0.2] - 2026-10-25

<p align="center">
  <img src="https://raw.githubusercontent.com/tty-pt/axil-hyle/main/logo.png" alt="axil-hyle logo" width="220" />
</p>

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