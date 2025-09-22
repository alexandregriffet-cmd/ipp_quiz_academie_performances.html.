# IPP – Kit GitHub (Test + Rapports + Visuels + Export PDF)

Ce kit contient tout le nécessaire pour publier le test **IPP** sur GitHub Pages, 
afficher les **visuels dynamiques** (étoile IPP, boussole, pyramide), et proposer le **téléchargement du rapport en PDF** (comme PMP).

## ✨ Fonctionnalités
- Questionnaire en ligne (adulte/ados/HP) — structure prête.
- Scoring → pourcentages par profil (ADN à 100 %, Cap dominant, autres pondérations).
- Rendu visuel : **Étoile IPP** (radar), **Boussole**, **Pyramide de stress**.
- **Rapport HTML** généré côté client + **Export PDF** via jsPDF + html2canvas.
- Thème couleurs IPP (Bleu, Rouge, Vert, Violet, Bleu ciel, Orange).
- **Logo** en en-tête et filigrane (placer votre logo dans `web/assets/logo.png`).

## 🚀 Mise en ligne (GitHub Pages)
1. Créez un repo GitHub (public).
2. Copiez les dossiers `web`, `data`, `templates` à la racine du repo.
3. Dans GitHub → *Settings* → *Pages* → *Branch: main / root* → *Save*.
4. Ouvrez l’URL `https://<votre_user>.github.io/<votre_repo>/web/`

## 🧪 Démonstration locale
Ouvrez `web/index.html` dans votre navigateur.

## 🧩 Où modifier le contenu
- **Questions** : `data/questions_ados.json`, `data/questions_adultes.json`, `data/questions_hp.json`
- **Textes de rapports** (36 combinaisons) : `data/rapports_ipp.json`
- **Styles** : `web/styles.css`
- **Logo** : `web/assets/logo.png`

## 🖼 Visuels
- Étoile IPP (Chart.js Radar)
- Boussole (Canvas 2D)
- Pyramide (Canvas 2D)

## 🧾 Export PDF
- jsPDF + html2canvas (CDN) — bouton **Télécharger en PDF** dans le rapport.

## 🔧 Build / Dév
Aucun build requis. HTML/JS/CSS vanilla + CDN.

## 📄 Licence
Libre d’usage pour votre IPP.
