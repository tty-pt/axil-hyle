<p align="center">
  <img src="logo.png" alt="axil-hyle logo" width="220" />
</p>

# axil-hyle

[![C99](https://img.shields.io/badge/C-C99-555?logo=c)](#)
[![BSD-2-Clause](https://img.shields.io/badge/License-BSD--2--Clause-blue)](#)
[![REST Engine](https://img.shields.io/badge/API-REST%20CRUD-16A34A)](#)
[![axil—hyle bridge](https://img.shields.io/badge/bridge-axil%E2%80%94hyle-8B5CF6)](#)

> High-performance REST and query connector exposing Hyle datasets and schemas over HTTP in plain C.

`axil-hyle` bridges [axil](https://github.com/tty-pt/axil) HTTP request routing with [libhyle](https://github.com/tty-pt/hyle) relational schemas and [libhyle-source](https://github.com/tty-pt/libhyle-source) persistence drivers. It turns any registered C dataset schema into a fully-featured, paginated REST API with full-text search, filtering, and schema validation—without SQL or server-side scripting frameworks.

---

## Contents

- [Architecture & Ecosystem Context](#architecture--ecosystem-context)
- [Features](#features)
- [Quickstart: Run the REST Service](#quickstart-run-the-rest-service)
- [REST API Reference](#rest-api-reference)
- [Query Parameter Grammar](#query-parameter-grammar)
- [JSON Payloads & Schemas](#json-payloads--schemas)
- [C API Integration](#c-api-integration)
- [Installation & Build](#installation--build)
- [License](#license)

---

## Architecture & Ecosystem Context

`axil-hyle` operates as a native [libxylem](https://github.com/tty-pt/libxylem) plugin loaded into the Axil server:

- **HTTP Routing**: Hooks into `axil` request dispatch via `axil_register_handler()` mounted during `xy_install()`.
- **Query & Schema Engine**: Delegates queries to `libhyle`, leveraging [liblemma](https://github.com/tty-pt/liblemma) for accent-preserving full-text search (`pão ≠ pao`).
- **Persistence Layer**: Backed by `libhyle-source` storage drivers (`store_fs` filesystem stores or in-memory volatile tables).
- **Authentication & CSRF**: Integrates seamlessly with [axil-auth](https://github.com/tty-pt/axil-auth) for session cookie verification (`QSESSION`) and CSRF token protection on mutative endpoints.

---

## Features

- **Standard RESTful Endpoints**: Full CRUD pipeline over `/api/dataset/:id` with uniform JSON serialization.
- **Rich Query Pipeline**: Composable lexical full-text search (`q=`), exact/prefix field filters (`filter_<field>=`), sorting, and 1-based pagination.
- **Strict Schema Enforcement**: Automatically validates incoming fields against `hyle_schema_desc_t` (type checks, string length, regex constraints, and required fields) before executing writes.
- **Schema Introspection**: Exposes `/api/schema/:id` so frontend clients (including [libbud](https://github.com/tty-pt/libbud) WASM forms) can dynamically generate UI controls and validation rules.
- **Session & CSRF Protection**: Enforces authentication policies and CSRF header/token matching for `POST`, `PUT`, and `DELETE` requests under authenticated Axil configurations.

---

## Quickstart: Run the REST Service

Start the Axil daemon with the `axil-hyle` module loaded:

```bash
axil -d -p 8080 -m libaxil-hyle
```

*(If running from a source checkout, specify the module path: `axil -d -p 8080 -m ./lib/libaxil-hyle.so`).*

### Verified `curl` Testing

#### 1. Query a Dataset with Filters and Pagination
```bash
# Search for items matching "love", filtered by year, sorted descending:
curl -s "http://localhost:8080/api/dataset/song?q=love&filter_year=1978&sort=year&order=desc&limit=10"
```

**Response**:
```json
{
  "total": 1,
  "page": 1,
  "limit": 10,
  "items": [
    {
      "id": "song_1",
      "title": "Ain't Talkin' 'Bout Love",
      "year": 1978
    }
  ]
}
```

#### 2. Fetch a Single Record
```bash
curl -s "http://localhost:8080/api/dataset/song/song_1"
```

#### 3. Create a New Record (with CSRF Protection)
When authenticated via `axil-auth`, include the session cookie and CSRF token:
```bash
curl -s -X POST "http://localhost:8080/api/dataset/song" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -b "QSESSION=<session_id>" \
  -d '{
    "title": "Runnin'\'' with the Devil",
    "year": 1978
  }'
```

#### 4. Introspect Dataset Schema
```bash
curl -s "http://localhost:8080/api/schema/song"
```

---

## REST API Reference

| Method | Endpoint | Auth / CSRF | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dataset/:id` | Public / Session | Execute query over dataset `:id` (filter, sort, search, page) |
| `GET` | `/api/dataset/:id/:item_id` | Public / Session | Retrieve single record by primary key |
| `POST` | `/api/dataset/:id` | Required | Create new record with schema validation |
| `PUT` | `/api/dataset/:id/:item_id` | Required | Update existing record fields |
| `DELETE` | `/api/dataset/:id/:item_id` | Required | Delete record by primary key |
| `GET` | `/api/schema/:id` | Public | Introspect field schemas, types, and constraints |

---

## Query Parameter Grammar

The `GET /api/dataset/:id` endpoint accepts standard URL query parameters:

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | `?q=acoustic` | Full-text substring and phrase search across all searchable string fields |
| `filter_<field>`| `string` / `int` | `?filter_status=active` | Exact-match filter on specific schema field |
| `sort` | `string` | `?sort=created_at` | Field name to sort results by |
| `order` | `string` | `?order=desc` | Sort direction: `asc` (default) or `desc` |
| `page` | `integer` | `?page=2` | 1-based page number (default: `1`) |
| `limit` | `integer` | `?limit=25` | Maximum items per page (default: `20`, maximum: `100`) |

---

## JSON Payloads & Schemas

### Dataset Query Response
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": "item_101",
      "title": "First Entry",
      "status": "active"
    }
  ]
}
```

### Schema Introspection Response (`GET /api/schema/:id`)
```json
{
  "dataset": "song",
  "key_field": "id",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true,
      "searchable": true,
      "max_length": 255
    },
    {
      "name": "year",
      "type": "int",
      "required": false,
      "searchable": true
    }
  ]
}
```

---

## C API Integration

Mount routes inside an Axil application or composite XY module:

```c
#include <ttypt/axil-hyle.h>

void xy_install(void)
{
    // Register standard dataset and schema REST route handlers
    axil_hyle_install_routes();
}
```

Compile and link:
```sh
cc my_service.c $(pkg-config --cflags --libs axil-hyle)
```

---

## Installation & Build

### Prebuilt Packages
Prebuilt packages are distributed on tty.pt for Linux (APT / Alpine / Arch / Fedora-RHEL), macOS (Homebrew), Windows (winget / MSYS2), and OpenBSD. Follow the [installation instructions](https://github.com/tty-pt/ci/blob/main/docs/install.md) and use **axil-hyle** as the package name.

### Build from Source
The library builds with standard `make` using the shared [`mk`](https://github.com/tty-pt/mk) system:

```sh
make                  # builds lib/libaxil-hyle.so
make test             # exercised by integration test suites
sudo make install     # installs lib, headers, and axil-hyle.pc to $(PREFIX)
```

**Dependencies:** `axil`, `axil-auth`, `libcorm`, `libxylem`, `libhyle`, `libhyle-source`, and `json-c`.

---

## License

BSD 2-Clause License. Copyright (c) 2026, tty-pt. See `LICENSE`.
