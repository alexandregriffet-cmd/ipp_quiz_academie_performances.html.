# IPP – Inventaire Psychologique de Performance (Jeunes 12–25 ans)

## Installation GitHub Pages
1. Supprimez les anciens fichiers du repo (branche `main`).
2. Déposez **tout le contenu** de ce ZIP à la racine.
3. Activez GitHub Pages sur `main` (Settings > Pages).
4. Rechargez l’URL publique (Ctrl/Cmd + Shift + R).

## Utilisation
- Bouton **Commencer** → charge `data/questions_ados.json` (60×6) et lance le quiz.
- Classement **1→6** (min 3) par question.
- Résultats : **ADN ❤️ = 100 %**, **Caps vécus ⚪ = 0..2 à 100 %**, **Cap actuel ⭐ = % relatif**.
- Rapport exportable **PDF A4 multipage**.

## Dépannage
- Si les questions ne chargent pas, un message rouge apparaît et un **fallback** démarre pour tester l’UX.
- Vérifiez que `data/questions_ados.json` et `data/rapports_ipp.json` existent sur votre URL publique.
