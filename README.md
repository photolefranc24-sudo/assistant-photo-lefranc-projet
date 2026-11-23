# Assistant AI PHOTO LEFRANC

Page unique (`public/index.html`) + petit serveur Node (`server.js`, sans dépendance).
Le serveur sert la page et expose `POST /api/chat`, qui appelle OpenAI. La clé API reste côté serveur.

## Variables d’environnement (obligatoires)
- `OPENAI_API_KEY` : votre clé OpenAI (jamais dans le code ni dans le dépôt).
- `OPENAI_MODEL` : le nom du modèle OpenAI à utiliser (voir la documentation OpenAI).

Facultatives : `REQUEST_TIMEOUT_MS` (25000 par défaut), `OPENAI_BASE_URL`.

## Déploiement sur Render
1. Mettre ce dossier dans un dépôt GitHub (le fichier `.env` n’y est pas).
2. Render → New → Blueprint (ou Web Service), choisir le dépôt. `render.yaml` configure tout.
3. Renseigner `OPENAI_API_KEY` et `OPENAI_MODEL` dans Environment.
4. Ouvrir l’adresse fournie par Render, puis tester le chat. `/health` doit répondre `{"ok":true}`.

## Test local
`OPENAI_API_KEY=... OPENAI_MODEL=... npm start` puis http://localhost:3000

## Codes d’erreur de /api/chat
400 message invalide · 429 trop de messages · 503 non configuré · 502 fournisseur IA en erreur · 504 délai dépassé.

## Limites actuelles
Chat texte seulement : les photos ne sont pas envoyées à l’IA. Aucun transfert vers PHOTO LEFRANC (mécanisme à confirmer).
