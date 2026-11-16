# @tty-pt/axil-hyle

Isomorphic REST dataset client, C header distribution (`<ttypt/axil-hyle.h>`), and prebuilt Xylem HTTP dataset CRUD module (`libaxil-hyle`) for [`@tty-pt/axil`](https://www.npmjs.com/package/@tty-pt/axil) and [`@tty-pt/hyle`](https://www.npmjs.com/package/@tty-pt/hyle).

## Usage

```js
import { createAxilHyleClient, getModulePath } from "@tty-pt/axil-hyle";

const client = createAxilHyleClient({ baseUrl: "http://127.0.0.1:8080" });
const songs = await client.list("song", { q: "fado" });
```

With the `axil` CLI (`@tty-pt/axil`):

```bash
npx axil -m auth:hyle
```
