const input = document.getElementById("textInput");
const btn = document.getElementById("saveBtn");
const list = document.getElementById("list");
const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function renderItems(items) {
  list.innerHTML = "";
  for (const it of items) {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = it.text;

    const metaSpan = document.createElement("span");
    metaSpan.className = "small";
    metaSpan.textContent = `#${it.id} • ${it.created_at}`;

    li.appendChild(textSpan);
    li.appendChild(metaSpan);
    list.appendChild(li);
  }
}

async function loadItems() {
  setStatus("Loading...");
  const res = await fetch("/api/items", { method: "GET" });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Load failed");
  renderItems(data.items || []);
  setStatus("");
}

async function saveItem() {
  const text = input.value.trim();
  if (!text) {
    setStatus("Please enter text.");
    return;
  }

  btn.disabled = true;
  setStatus("Saving...");

  try {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Save failed");

    input.value = "";
    await loadItems();
    setStatus("Saved.");
    setTimeout(() => setStatus(""), 1200);
  } catch (e) {
    setStatus(String(e.message || e));
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener("click", saveItem);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveItem();
});

loadItems().catch((e) => setStatus(String(e.message || e)));
