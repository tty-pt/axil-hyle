import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import {
  buildDatasetUrl,
  createAxilHyleClient,
  getModulePath,
  hasNativeModule,
  registerPartitionRoutes,
} from "../dist/index.js";

test("buildDatasetUrl and module resolution", () => {
  assert.equal(buildDatasetUrl("song"), "/api/dataset/song");
  assert.equal(
    buildDatasetUrl("song", { query: { q: "blues", page: 2, per_page: 25 } }),
    "/api/dataset/song?q=blues&page=2&per_page=25"
  );
  assert.equal(buildDatasetUrl("song", { key: "my-song" }), "/api/dataset/song/my-song");
  assert.equal(
    buildDatasetUrl("gig.songs", { key: "gig-1", ordered: true }),
    "/api/dataset/gig.songs/gig-1/ordered"
  );
  assert.equal(
    buildDatasetUrl("gig.songs", { key: "gig-1", ordered: true, index: 3 }),
    "/api/dataset/gig.songs/gig-1/ordered/3"
  );

  assert.equal(registerPartitionRoutes(null), false);

  if (process.platform !== "win32") {
    const modPath = getModulePath();
    assert.ok(modPath && modPath.includes("libaxil-hyle"), `expected libaxil-hyle module path, got ${modPath}`);
    assert.equal(hasNativeModule(), true);
  }
});

test("AxilHyleClient CRUD and ordered partition protocol", async () => {
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => { body += c; });
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          method: req.method,
          url: req.url,
          body: body ? JSON.parse(body) : null,
        })
      );
    });
  });

  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const client = createAxilHyleClient({ baseUrl: `http://127.0.0.1:${port}` });

  try {
    const listRes = await client.list("song", { q: "fado", page: 1 });
    assert.equal(listRes.method, "GET");
    assert.equal(listRes.url, "/api/dataset/song?q=fado&page=1");

    const getRes = await client.get("song", "item-1");
    assert.equal(getRes.method, "GET");
    assert.equal(getRes.url, "/api/dataset/song/item-1");

    const postRes = await client.create("song", { title: "New Song" });
    assert.equal(postRes.method, "POST");
    assert.equal(postRes.url, "/api/dataset/song");
    assert.equal(postRes.body.title, "New Song");

    const ordRes = await client.updateOrdered("gig.songs", "gig-1", 0, { transpose: "2" });
    assert.equal(ordRes.method, "PUT");
    assert.equal(ordRes.url, "/api/dataset/gig.songs/gig-1/ordered/0");
    assert.equal(ordRes.body.transpose, "2");
  } finally {
    await new Promise((r) => server.close(r));
  }
});
