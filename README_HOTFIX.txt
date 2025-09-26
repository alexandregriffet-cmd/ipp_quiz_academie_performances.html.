# IPP — HOTFIX rapports narratifs

Ce pack contient deux fichiers pour remettre les rapports sans casser le site :

1) `reports_SANITY.json` — Fichier minimal pour vérifier que le chargement fonctionne.
2) `reports_FINAL_SAFE.json` — Fichier complet, long, compatible (HTML échappé, UTF‑8).

## Procédure sûre (sans rien casser)
- Ouvrez votre dépôt GitHub Pages puis le dossier `assets/`.
- Cliquez **Add file → Upload files** et uploadez d'abord `reports_SANITY.json` en le renommant **reports.json** → Commit.
- Rechargez votre site : si le rapport s'affiche, tout est OK côté chargement.
- Ensuite, remplacez `assets/reports.json` par `reports_FINAL_SAFE.json` (renommez-le **reports.json**) → Commit.
- Rechargez (Ctrl/Cmd+Shift+R).

Si ça ne s'affiche pas : vérifiez que le fichier est bien `assets/reports.json` et qu'il n'y a pas de cache (force refresh).