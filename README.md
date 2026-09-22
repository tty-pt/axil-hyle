# axil-hyle — Axil to Hyle HTTP Connector

Bridge library connecting Axil HTTP request handling with Hyle dataset queries and schema endpoints.

## Overview

`libaxil-hyle` mounts standard RESTful endpoint:
- `GET /api/dataset/:id` — Execute Hyle queries over HTTP, returning JSON results

## Usage

```c
#include <ttypt/axil-hyle.h>

void xy_install(void)
{
    // Mount dataset query endpoints
    axil_hyle_install_routes();
}
```

## Dependencies

- `external/axil` — HTTP request and route registration
- `external/libhyle` — Core query parser and search engine
- `external/libhyle-source` — Dataset persistence
