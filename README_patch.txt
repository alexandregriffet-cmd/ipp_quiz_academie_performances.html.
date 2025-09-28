CORRECTIF IPP — Rapports & Visuels
====================================

Ce correctif ne touche NI la page d’accueil NI le moteur du quiz.
Il améliore uniquement :
  • les VISUELS (étoile lisible avec couleurs + %, boussole claire, pyramide annotée),
  • le NARRATIF (36 rapports « 12–25 ans », phrases courtes, simples, humaines).

CONTENU DU ZIP
--------------
reports.json        ← narratifs complets (36 combinaisons)
visuals_patch.js    ← fonctions de rendu des visuels (étoile/boussole/pyramide)
README_patch.txt    ← ce fichier

INTÉGRATION (2 minutes)
-----------------------
1) Uploadez 'reports.json' à la racine du repo (il remplace l'ancien).
2) Ajoutez juste avant </body> dans votre index.html :
   <script src="visuals_patch.js"></script>

Rechargez votre page (Ctrl/Cmd+Shift+R).