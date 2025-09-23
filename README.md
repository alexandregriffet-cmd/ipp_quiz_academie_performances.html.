# IPP – Inventaire Psychologique de Performance (Jeunes 12–25 ans)

## Installation sur GitHub Pages
1. **Videz** votre repository (branche `main`) des anciens fichiers.
2. **Déposez tout le contenu** de ce ZIP à la racine du repo.
3. **Activez GitHub Pages** sur la branche `main` (Settings > Pages).
4. Patientez le déploiement (1–2 min).
5. Ouvrez l’URL : `https://<votre-utilisateur>.github.io/<votre-repo>/`

## Utilisation
- Bouton **Commencer** → lance le test (60 vignettes × 6 propositions **uniques**).
- Classement **1 → 6** par ordre de préférence (min **3** choix pour avancer).
- Calcul automatique : **ADN ❤️ = 100 %**, **Caps vécus ⚪ = 0..2 à 100 %**, **Cap actuel ⭐ = % relatif (<100 %)**.
- Rapport exportable en **PDF A4 multipage** (bouton “Télécharger en PDF”).

## Structure
- `index.html` : page d’accueil & conteneur du test/rapport.
- `styles.css` : design + gabarit A4.
- `app.js` : logique du quiz, algorithme IPP, export PDF.
- `data/questions_ados.json` : **60 vignettes** × **6 réponses uniques** (ados 12–25).
- `data/rapports_ipp.json` : **36 rapports** ADN|Cap (narratifs détaillés).
- `assets/logo.png` : logo (modifiable).

## Dépannage (cache)
- Forcer le rafraîchissement : **Ctrl/Cmd + Shift + R**.
- Ajouter un paramètre d’URL : `index.html?v=2`
