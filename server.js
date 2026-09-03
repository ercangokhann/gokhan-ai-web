// Gokhan AI — Basit, ücretsiz, tek dosyalık sunucu
// Manus'a bağımlılık yok. AI motoru: Google Gemini (ücretsiz kota).
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(__dirname));
// ---------- Ayarlar ----------
const APP_PASSWORD = process.env.APP_PASSWORD || "degistir123";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(16).toString("hex");

// ---------- Veritabanı (SQLite - tek dosya, ücretsiz) ----------
const db = new Database(path.join(__dirname, "data.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );
`);

// ---------- Basit oturum (şifre tabanlı, davetsiz-basit) ----------
function sign(value) {
  const h = crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
  return `${value}.${h}`;
}
function verify(signed) {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return false;
  const value = signed.slice(0, idx);
  return sign(value) === signed;
}

function requireAuth(req, res, next) {
  const token = req.cookies.gokhan_session;
  if (verify(token)) return next();
  return res.status(401).json({ error: "Giriş gerekli." });
}

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (password && password === APP_PASSWORD) {
    const token = sign("ok:" + Date.now());
    res.cookie("gokhan_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 gün
    });
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Şifre yanlış." });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("gokhan_session");
  res.json({ success: true });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies.gokhan_session;
  res.json({ authenticated: verify(token) });
});

// ---------- Sohbet geçmişi ----------
app.get("/api/conversations", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM conversations ORDER BY created_at DESC").all();
  res.json(rows);
});

app.get("/api/conversations/:id/messages", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .all(req.params.id);
  res.json(rows);
});

app.delete("/api/conversations/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM messages WHERE conversation_id = ?").run(req.params.id);
  db.prepare("DELETE FROM conversations WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ---------- Gemini ile sohbet ----------
async function askGemini(history) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY tanımlı değil. Sunucu ayarlarına ekleyin.");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [
          {
            text:
              "Sen Gokhan AI adında yardımsever bir Türkçe asistansın. Kısa, net ve doğrudan cevaplar ver.",
          },
        ],
      },
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API hatası (${response.status}): ${errBody.slice(0, 300)}`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ?? "";
  if (!text) throw new Error("Gemini boş yanıt döndürdü.");
  return text;
}

app.post("/api/chat", requireAuth, async (req, res) => {
  try {
    const { conversationId, message } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Mesaj boş olamaz." });
    }

    let convoId = conversationId;
    if (!convoId) {
      const title = message.trim().slice(0, 60);
      const info = db
        .prepare("INSERT INTO conversations (title, created_at) VALUES (?, ?)")
        .run(title, Date.now());
      convoId = info.lastInsertRowid;
    }

    db.prepare(
      "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, 'user', ?, ?)"
    ).run(convoId, message, Date.now());

    const priorMessages = db
      .prepare("SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
      .all(convoId);

    const reply = await askGemini(priorMessages);

    db.prepare(
      "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)"
    ).run(convoId, reply, Date.now());

    res.json({ conversationId: convoId, reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Bilinmeyen hata." });
  }
});

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gokhan AI web sürümü http://localhost:${PORT} üzerinde çalışıyor`));
