// Serveur Assistant AI PHOTO LEFRANC — sans dépendance (Node 18+).
// La clé OpenAI reste ici, dans les variables d’environnement. Jamais dans le navigateur.
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const BASE = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const TIMEOUT = Number(process.env.REQUEST_TIMEOUT_MS) || 25000;
const SYSTEM = `Tu es l’Assistant AI PHOTO LEFRANC, conseiller spécialisé en photographie d’identité et de visa. Réponds en français, de façon chaleureuse, patiente, simple et concise, avec des étapes courtes.
Règles : ne juge jamais l’apparence physique. N’invente jamais une dimension, une norme officielle ou une exigence de visa : si tu n’es pas sûr, dis qu’une vérification auprès de l’autorité concernée est nécessaire. Ne prétends jamais qu’une photo est officiellement acceptée. Tu ne peux pas encore analyser les images : si une photo est mentionnée, explique-le et donne des conseils généraux (lumière, netteté, cadrage, fond, position du visage). Ne prétends jamais avoir modifié, sauvegardé ou transféré un fichier. Le traitement final, les planches, les paiements et les téléchargements relèvent de l’application PHOTO LEFRANC.`;
const hits = new Map();
const limited = ip => { const t = Date.now(), a = (hits.get(ip) || []).filter(x => t - x < 60000); a.push(t); hits.set(ip, a); return a.length > 20; };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
function validate(b) {
  const m = b && b.messages;
  if (!Array.isArray(m) || !m.length || m.length > 30) return null;
  const out = [];
  for (const x of m) {
    if (!x || !["user", "assistant"].includes(x.role) || typeof x.content !== "string" || !x.content.trim() || x.content.length > 4000) return null;
    out.push({ role: x.role, content: x.content });
  }
  return out[out.length - 1].role === "user" ? out : null;
}
async function chat(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
  if (limited(ip)) return send(res, 429, { error: "Trop de messages. Patientez une minute." });
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) { console.error("Configuration manquante : OPENAI_API_KEY ou OPENAI_MODEL"); return send(res, 503, { error: "Assistant non configuré." }); }
  let raw = "", big = false;
  for await (const c of req) { raw += c; if (raw.length > 100000) { big = true; break; } }
  let msgs; try { msgs = big ? null : validate(JSON.parse(raw)); } catch { msgs = null; }
  if (!msgs) return send(res, 400, { error: "Message invalide." });
  const ac = new AbortController(), timer = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const r = await fetch(BASE + "/chat/completions", {
      method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL, messages: [{ role: "system", content: SYSTEM }, ...msgs] })
    });
    if (!r.ok) { console.error("OpenAI HTTP", r.status); return send(res, 502, { error: "Le fournisseur IA a refusé la requête." }); }
    const reply = (await r.json())?.choices?.[0]?.message?.content;
    if (!reply) return send(res, 502, { error: "Réponse IA vide." });
    send(res, 200, { reply });
  } catch (e) {
    console.error("Appel IA échoué :", e.name);
    send(res, e.name === "AbortError" ? 504 : 502, { error: e.name === "AbortError" ? "Délai dépassé." : "Fournisseur IA injoignable." });
  } finally { clearTimeout(timer); }
}
const page = path.join(__dirname, "public", "index.html");
http.createServer((req, res) => {
  const u = req.url.split("?")[0];
  if (req.method === "POST" && u === "/api/chat") return chat(req, res).catch(() => send(res, 500, { error: "Erreur serveur." }));
  if (req.method === "GET" && u === "/health") return send(res, 200, { ok: true });
  if (req.method === "GET" && (u === "/" || u === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" });
    return fs.createReadStream(page).pipe(res);
  }
  send(res, 404, { error: "Introuvable." });
}).listen(PORT, () => console.log("Assistant AI PHOTO LEFRANC sur le port " + PORT));
