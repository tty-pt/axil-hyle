<p align="center">
  <img src="logo.png" alt="axil-hyle logo" width="220" />
</p>

# axil-hyle

[![C99](https://img.shields.io/badge/C-C99-555?logo=c)](#)
[![BSD-2-Clause](https://img.shields.io/badge/License-BSD--2--Clause-blue)](#)
[![REST Engine](https://img.shields.io/badge/API-REST%20CRUD-16A34A)](#)
[![axil—hyle bridge](https://img.shields.io/badge/bridge-axil%E2%80%94hyle-8B5CF6)](#)

> High-performance REST and query connector exposing Hyle datasets and schemas over HTTP in plain C. Canonical header is `<ttypt/axil-hyle.h>`.

`axil-hyle` bridges [axil](https://github.com/tty-pt/axil) HTTP routing with [libhyle](https://github.com/tty-pt/hyle) schemas and [libhyle-source](https://github.com/tty-pt/libhyle-source) storage drivers, turning registered C schemas into paginated REST APIs with full-text search and validation.

---

## 1. Quickstart: Run the REST Service

Start the Axil daemon with the `axil-hyle` module loaded:

```bash
axil -d -p 8080 -m libaxil-hyle
```

### Verified `curl` Queries

```bash
# 1. Full-text search and pagination over dataset:
curl -s "http://localhost:8080/api/dataset/song?q=love&sort=year&order=desc&limit=10"

# 2. Fetch a single record:
curl -s "http://localhost:8080/api/dataset/song/song_1"

# 3. Introspect schema:
curl -s "http://localhost:8080/api/schema/song"
```

---

## 2. REST API Reference

| Method | Endpoint | Auth / CSRF | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dataset/:id` | Public / Session | Execute query over dataset `:id` (filter, sort, search, page) |
| `GET` | `/api/dataset/:id/:item_id` | Public / Session | Retrieve single record by primary key |
| `POST` | `/api/dataset/:id` | Required | Create new record with schema validation |
| `PUT` | `/api/dataset/:id/:item_id` | Required | Update existing record fields |
| `DELETE` | `/api/dataset/:id/:item_id` | Required | Delete record by primary key |
| `GET` | `/api/schema/:id` | Public | Return JSON schema descriptor for dynamic UI generation |

### Query Parameter Grammar
- `q=<search>`: Full-text substring search across all searchable string fields.
- `filter_<field>=<val>`: Exact equality filter on specific field.
- `sort=<field>&order=asc|desc`: Sort results by field.
- `limit=<n>&page=<n>`: 1-based pagination parameters.

---

## 3. Architecture & Ecosystem Context

- **HTTP Routing**: Hooks into `axil` request dispatch via `axil_register_handler()` mounted during `xy_install()`.
- **Query & Schema Engine**: Delegates queries to `libhyle`, leveraging [liblemma](https://github.com/tty-pt/liblemma) for accent-preserving full-text search (`pão ≠ pao`).
- **Persistence Layer**: Backed by `libhyle-source` storage drivers (`store_fs` filesystem stores or in-memory volatile tables).
- **Authentication & CSRF**: Integrates seamlessly with [axil-auth](https://github.com/tty-pt/axil-auth) for session cookie verification (`QSESSION`) and CSRF token protection on mutative endpoints.

---

## 4. Installation & Build

### Prebuilt Packages
Prebuilt packages are distributed on tty.pt for Linux (APT / Alpine / Arch / Fedora-RHEL), macOS (Homebrew), Windows (winget / MSYS2), and OpenBSD. Follow the [installation instructions](https://github.com/tty-pt/ci/blob/main/docs/install.md) and use **axil-hyle** as the package name.

### Build from Source
```sh
make                  # builds lib/libaxil-hyle.so
make test             # run verification tests
sudo make install     # install headers and library to system
```

## License

BSD 2-Clause License. Copyright (c) 2026, tty-pt. See `LICENSE`.
