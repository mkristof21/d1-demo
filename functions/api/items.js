function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // D1 binding name is "DB" -> env.DB :contentReference[oaicite:3]{index=3}
  const db = env.DB;

  if (request.method === "GET") {
    // Return items newest-first
    const { results } = await db
      .prepare("SELECT id, text, created_at FROM items ORDER BY id DESC LIMIT 200")
      .all();

    return json({ ok: true, items: results });
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON body" }, 400);
    }

    const text = (body?.text ?? "").toString().trim();

    if (text.length === 0) return json({ ok: false, error: "Text is required" }, 400);
    if (text.length > 200) return json({ ok: false, error: "Text too long (max 200)" }, 400);

    const info = await db
      .prepare("INSERT INTO items (text) VALUES (?)")
      .bind(text)
      .run();

    // D1 returns a meta object; we’ll fetch the inserted row for display
    const insertedId = info?.meta?.last_row_id;
    const row = insertedId
      ? await db.prepare("SELECT id, text, created_at FROM items WHERE id = ?").bind(insertedId).first()
      : null;

    return json({ ok: true, item: row });
  }

  return json({ ok: false, error: "Method not allowed" }, 405);
}
