# axil-hyle

[![C99](https://img.shields.io/badge/C-C99-555?logo=c)](#)
[![BSD-2-Clause](https://img.shields.io/badge/License-BSD--2--Clause-blue)](#)
[![axil—hyle bridge](https://img.shields.io/badge/axil%E2%80%94hyle-bridge-8B5CF6)](#)

> Axil-to-Hyle REST/query connector.

Bridge library connecting Axil HTTP request handling with Hyle dataset queries
and schema endpoints.

## Contents

- [Features](#features)
- [Install](#install)
- [Build from source](#build-from-source)
- [Overview](#overview)
- [Usage](#usage)
- [Documentation](#documentation)
- [Testing](#testing)
- [License](#license)

## Features

- **RESTful dataset endpoint** — `GET /api/dataset/:id` executes Hyle queries
  over HTTP and returns JSON results
- **XY module** — mounts its routes from a single `xy_install()` entry point

## Install

Prebuilt packages are distributed on tty.pt for Linux (APT / Alpine / Arch /
Fedora-RHEL), macOS (Homebrew), Windows (winget / MSYS2), and OpenBSD.
Follow the [installation instructions](
https://github.com/tty-pt/ci/blob/main/docs/install.md) and use
**axil-hyle** as the package name.

## Build from source

The library builds with a plain `make` (the shared [`mk` include.mk](
https://github.com/tty-pt/mk)):

```sh
make                  # builds lib/libaxil-hyle.so
make test             # no standalone suite; exercised by the site
sudo make install     # lib + headers + axil-hyle.pc -> $(PREFIX), default /usr/local
```

Link it from your own C code:

```sh
cc my_app.c $(pkg-config --cflags --libs axil-hyle)
```

**Dependencies:** `axil`, `axil-auth`, `libcorm`, `libxylem`, `libhyle`,
`libhyle-source`, `json-c`.

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

## Documentation

- [CHANGELOG.md](./CHANGELOG.md) — version history
- [include/ttypt/axil-hyle.h](./include/ttypt/axil-hyle.h) — full API

## Testing

No standalone test suite; the connector is exercised end-to-end by the site
suite (`make test` at the repository root).

## License

BSD 2-Clause License. Copyright (c) 2026, tty-pt. See `LICENSE`.