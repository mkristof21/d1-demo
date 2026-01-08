CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Helpful index for ordering
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
