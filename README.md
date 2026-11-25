# Assistant IA PHOTO LEFRANC — version avec analyse d’images

Serveur Node 18+ sans dépendance. Il expose `POST /api/chat` pour les messages texte et `POST /api/analyze-image` pour l’analyse d’une image.

## Variables Render
- `OPENAI_API_KEY` : clé API OpenAI (secret, uniquement dans Render).
- `OPENAI_MODEL` : modèle API compatible avec l’analyse d’images. Vérifier la compatibilité du modèle choisi avant le test.
- `PHOTO_LEFRANC_SHARED_SECRET` : secret partagé avec le serveur principal PHOTO LEFRANC. Utiliser exactement la même valeur dans les deux services. Ne jamais l’inscrire dans GitHub ni dans le navigateur.
- Facultatives : `REQUEST_TIMEOUT_MS`, `OPENAI_BASE_URL`.

## Déploiement de test
Déployer cette branche sur un service Render de test distinct. Build : `npm install` (aucune dépendance à installer) ; Start : `npm start`. Définir les trois variables ci-dessus. `/health` doit répondre `{"ok":true}`.

## Sécurité et limites
La route d’analyse d’image exige `Authorization: Bearer <PHOTO_LEFRANC_SHARED_SECRET>`. Images acceptées : JPEG, PNG, WebP, taille limitée. L’image est envoyée au fournisseur IA pour analyse ; prévenir l’utilisateur et éviter les photos non nécessaires. L’assistant ne doit pas identifier la personne ni prétendre qu’une photo est officiellement acceptée. Les paiements, planches et téléchargements restent dans l’application principale.
