
// IPP – Final: questionnaire 36Q, scoring, long narrative report (20–30 pages) via print-to-PDF

const DIMENSIONS = [
  { key: "objectifs", label: "Capacité à fixer des objectifs" },
  { key: "planif", label: "Planification & organisation" },
  { key: "confiance", label: "Confiance en soi" },
  { key: "emotions", label: "Gestion des émotions" },
  { key: "energie", label: "Énergie & activation" },
  { key: "concentration", label: "Concentration & focus présent" }
];

const QUESTIONS = [
  // Objectifs
  { d:0, t:"Je définis clairement des objectifs à court terme." },
  { d:0, t:"Mes objectifs sont mesurables et datés." },
  { d:0, t:"Je sais prioriser ce qui compte vraiment." },
  { d:0, t:"Je transforme une grande ambition en étapes simples." },
  { d:0, t:"Je revois mes objectifs quand la situation change." },
  { d:0, t:"Je sais dire non à ce qui n'aide pas mes objectifs." },
  // Planif
  { d:1, t:"Je planifie mes tâches à l'avance." },
  { d:1, t:"Je respecte les échéances que je me fixe." },
  { d:1, t:"Je découpe mon travail en blocs de temps." },
  { d:1, t:"J'anticipe les obstacles et prévois des alternatives." },
  { d:1, t:"J'organise mon environnement pour rester efficace." },
  { d:1, t:"J'utilise des rituels pour rester régulier." },
  // Confiance
  { d:2, t:"Je crois en ma capacité à réussir ce que j'entreprends." },
  { d:2, t:"Je me remets vite d'un échec." },
  { d:2, t:"Je me parle de manière constructive." },
  { d:2, t:"Je reste confiant même sous pression." },
  { d:2, t:"Je me compare surtout à mon progrès, pas aux autres." },
  { d:2, t:"Je prends des initiatives sans crainte excessive." },
  // Émotions
  { d:3, t:"Je reconnais rapidement ce que je ressens." },
  { d:3, t:"Je sais apaiser le stress quand il monte." },
  { d:3, t:"Je gère bien la frustration et l'imprévu." },
  { d:3, t:"Je reste calme avant un moment important." },
  { d:3, t:"Je transforme le trac en énergie utile." },
  { d:3, t:"Je dors et récupère suffisamment." },
  // Énergie
  { d:4, t:"Je sais m'activer quand il faut passer à l'action." },
  { d:4, t:"Je sais aussi me relâcher pour éviter la surcharge." },
  { d:4, t:"Je gère mon alimentation et mon hydratation." },
  { d:4, t:"Je sais utiliser la respiration pour ajuster mon énergie." },
  { d:4, t:"Je maintiens un rythme de travail soutenable." },
  { d:4, t:"Je respecte des pauses qui me rechargent vraiment." },
  // Concentration
  { d:5, t:"Je me concentre sur une seule tâche à la fois." },
  { d:5, t:"Je reviens vite quand je suis distrait." },
  { d:5, t:"Je me prépare mentalement avant d'agir." },
  { d:5, t:"Je sais entrer dans une 'bulle' de focus." },
  { d:5, t:"Je reste présent, sans ruminer le passé ni craindre l'avenir." },
  { d:5, t:"Je termine ce que je commence." }
];

const intro = document.getElementById('intro');
const quiz = document.getElementById('quiz');
const results = document.getElementById('results');

const startBtn = document.getElementById('startBtn');
const finishBtn = document.getElementById('finishBtn');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const pdfBtn = document.getElementById('pdfBtn');

const questionsEl = document.getElementById('questions');
const fullNameEl = document.getElementById('fullName');
const contextEl = document.getElementById('context');

const rName = document.getElementById('rName');
const rMeta = document.getElementById('rMeta');
const rSummary = document.getElementById('rSummary');
const rDetails = document.getElementById('rDetails');

function scrollTop(){ window.scrollTo({top:0,behavior:'smooth'}) }

function renderQuestions(){
  questionsEl.innerHTML = '';
  QUESTIONS.forEach((q, i) => {
    const idx = i+1;
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `
      <div class="q-title">${idx}. ${q.t}</div>
      <div class="scale" role="radiogroup" aria-label="Question ${idx}">
        ${["1","2","3","4","5"].map((lab, v) => {
          const id = \`q\${idx}_\${v+1}\`;
          return \`
            <input type="radio" id="\${id}" name="q\${idx}" value="\${v+1}">
            <label for="\${id}">\${lab}</label>
          \`;
        }).join('')}
      </div>
    `;
    questionsEl.appendChild(div);
  });
}

function getResponses(){
  const vals = [];
  for(let i=1;i<=QUESTIONS.length;i++){
    const checked = document.querySelector(\`input[name="q\${i}"]:checked\`);
    if(!checked) return null;
    vals.push(parseInt(checked.value,10));
  }
  return vals;
}

function computeScores(values){
  const dimSums = Array(DIMENSIONS.length).fill(0);
  const dimCounts = Array(DIMENSIONS.length).fill(0);
  values.forEach((v, i) => {
    const d = QUESTIONS[i].d;
    dimSums[d] += v;
    dimCounts[d] += 1;
  });
  const scores = dimSums.map((sum, d) => Math.round((sum / (dimCounts[d]*5))*100));
  const overall = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  return { scores, overall };
}

function narrativeFor(dimKey, pct){
  const base = {
    'objectifs': {
      high: "Objectifs clairs, mesurables et pilotés. Tu priorises et recalibres avec maturité.",
      mid: "Des intentions utiles mais parfois trop générales : renforce la précision et la priorisation.",
      low: "Clarté et priorisation à structurer : concentre-toi sur 1–2 priorités non négociables."
    },
    'planif': {
      high: "Planification robuste : rituels efficaces, anticipation des risques, fiabilité élevée.",
      mid: "Planifier oui, exécuter régulièrement encore mieux : installe des blocs dédiés.",
      low: "Organisation trop réactive : implémente un planning minimal quotidien + rituel hebdomadaire."
    },
    'confiance': {
      high: "Confiance stable, assertivité, capitale sur les progrès.",
      mid: "Confiance contextuelle : travaille l'auto-parole et les preuves régulières.",
      low: "Doute freinant : accumule des petites victoires et recadre les pensées."
    },
    'emotions': {
      high: "Bonne conscience émotionnelle, régulation efficace sous pression.",
      mid: "Gestion correcte mais surprenable : prépare 2–3 techniques rapides.",
      low: "Surmenage émotionnel : routines de base (sommeil, respiration, journal)."
    },
    'energie': {
      high: "Modulation d'activation maîtrisée : tu sais t'activer et te relâcher.",
      mid: "Énergie correcte, irrégulière : ajoute pauses qualitatives et respiration.",
      low: "Fluctuations fortes : calibre sommeil, pauses, alimentation et respiration."
    },
    'concentration': {
      high: "Entrée rapide en focus, présence soutenue jusqu'au bout.",
      mid: "Re-focalisation possible mais coûteuse : élimine les distractions majeures.",
      low: "Dispersion : monotâche court, rituel d'entrée en focus et environnement protégé."
    }
  };
  const b = base[dimKey];
  if (pct >= 70) return b.high;
  if (pct >= 40) return b.mid;
  return b.low;
}

function badge(pct){
  if (pct>=70) return `Solide • ${pct}%`;
  if (pct>=40) return `En progression • ${pct}%`;
  return `À renforcer • ${pct}%`;
}

function renderBars(scores, overall){
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="section-title">Synthèse</div>
    <div class="small">Score global</div>
    <div class="bar" aria-hidden="true"><i style="width:${overall}%"></i></div>
    ${DIMENSIONS.map((d, i)=>`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
        <div>${d.label}</div>
        <div class="small">${scores[i]}%</div>
      </div>
      <div class="bar" aria-hidden="true"><i style="width:${scores[i]}%"></i></div>
    `).join('')}
  `;
  return wrap;
}

function polarToXY(cx, cy, r, angleRad){
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function radarSVG(scores){
  const size = 420, cx=210, cy=210, radius=160;
  const axes = DIMENSIONS.length;
  const angleStep = (Math.PI*2)/axes;
  const points = [];
  for(let i=0;i<axes;i++){
    const pct = Math.max(0, Math.min(100, scores[i]));
    const r = radius * (pct/100);
    const angle = -Math.PI/2 + i*angleStep;
    const {x,y} = polarToXY(cx, cy, r, angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const gridRings = [0.25,0.5,0.75,1];
  const spokes = Array.from({length:axes}).map((_,i)=>{
    const angle = -Math.PI/2 + i*angleStep;
    const {x,y} = polarToXY(cx, cy, radius, angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#cbd5e1" stroke-opacity="0.35" />`;
  }).join('');
  const rings = gridRings.map(frac=>`
    <circle cx="${cx}" cy="${cy}" r="${(radius*frac).toFixed(1)}" fill="none" stroke="#cbd5e1" stroke-opacity="0.3"/>
  `).join('');
  const labels = DIMENSIONS.map((d,i)=>{
    const angle = -Math.PI/2 + i*angleStep;
    const {x,y} = polarToXY(cx, cy, radius+20, angle);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="12" text-anchor="middle" fill="#0f172a">${d.label}</text>`;
  }).join('');
  return `
  <div class="radar">
  <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${size}" height="${size}" fill="#ffffff"/>
    ${rings}
    ${spokes}
    <polygon points="${points.join(' ')}" fill="#60a5fa" fill-opacity="0.35" stroke="#2563eb" stroke-width="2"/>
    ${labels}
  </svg>
  </div>`;
}

function actionWeek(key, pct){
  const pick = (arr)=>arr.slice(0,4);
  const low = {
    objectifs: [
      "Écris 2 objectifs SMART-ER.",
      "Découpe 1 objectif en 3 étapes.",
      "1 priorité/jour.",
      "Revue soir 2′."
    ],
    planif: [
      "Plan hebdo 15′ + 3 tâches/jour.",
      "Blocs 25′ + 5′.",
      "Plan B pour l'obstacle clé.",
      "Rituel fin de journée 5′."
    ],
    confiance: [
      "3 victoires/jour.",
      "Réécris 3 pensées.",
      "1 action courage/jour.",
      "Visualisation 2′ avant effort."
    ],
    emotions: [
      "Respiration cohérente 5′ ×2.",
      "Nommer 3 émotions/jour.",
      "Routine sommeil régulière.",
      "Plan anti-rumination 2′."
    ],
    energie: [
      "Hydratation systématique.",
      "Pause 60–90′.",
      "Repas ancré avant effort.",
      "Respiration 4-6 avant effort."
    ],
    concentration: [
      "Rituel entrée focus 2′.",
      "Coupe 2 distractions 25′.",
      "Checklist démarrage.",
      "Clôture écrite 30s."
    ],
  };
  const mid = {
    objectifs: ["Ajoute 1 métrique de résultat.","Fais relire tes objectifs.","Revue J+7.","Automatise via template."],
    planif: ["Batching de tâches.","Prépare l'environnement.","Mesure temps utile.","Anticipe 2 risques (plan C)."],
    confiance: ["Partage un retour d'expérience.","Affûte l'auto-talk pour les pics.","Graphique de progrès.","Défi courage hebdo."],
    emotions: ["Ancrage mot-clé avant moment clé.","Score stress 3×/jour.","Scan corporel 5′.","Débrief émotionnel."],
    energie: ["Cycle 90′ : 60′/30′.","2 micro-siestes/semaine.","Routine de sortie.","Optimise nutrition pré-perf."],
    concentration: ["Deux blocs 'Deep work'.","Test focus contexte difficile.","Récap 30s fin de cycle.","Préparation 2′ (objectif, étapes, timer)."],
  };
  const high = mid;
  let plan;
  if (pct>=70) plan = high[key];
  else if (pct>=40) plan = mid[key];
  else plan = low[key];
  return pick(plan);
}

// ============== Rendering short results ==============
function renderReport(values){
  const { scores, overall } = computeScores(values);
  const name = (fullNameEl.value || "Participant").trim();
  const ctx = contextEl.value;
  rName.textContent = name;
  rMeta.textContent = `Contexte : ${ctx} • Date : ${new Date().toLocaleDateString('fr-FR')} • Score global : ${overall}%`;

  rSummary.innerHTML = '';
  rDetails.innerHTML = '';

  rSummary.appendChild(renderBars(scores, overall));
  DIMENSIONS.forEach((d, i) => {
    const pct = scores[i];
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <h3 style="margin:4px 0 6px">${d.label} – ${badge(pct)}</h3>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <p class="small">${narrativeFor(d.key, pct)}</p>
      <hr class="sep">
    `;
    rDetails.appendChild(wrap);
  });

  // Long report for print
  const longDoc = renderLongReport(name, ctx, scores, overall);
  const exist = document.getElementById('reportDoc');
  if (exist) exist.remove();
  results.appendChild(longDoc);
}

function renderLongReport(name, ctx, scores, overall){
  const container = document.createElement('div');
  container.id = "reportDoc";

  const cover = `
    <div class="cover">
      <img src="assets/img/logo.png" alt="Logo" style="width:140px;height:auto;border-radius:24px"/>
      <h1>Rapport IPP – ${name}</h1>
      <p class="meta">Contexte : ${ctx} • Score global : ${overall}% • Date : ${new Date().toLocaleDateString('fr-FR')}</p>
    </div>
    <div class="page-break"></div>
  `;

  const toc = `
  <h2>Table des matières</h2>
  <ol>
    <li>Introduction</li>
    <li>Méthodologie & lecture des scores</li>
    <li>Profil global (ADN CAP)</li>
    ${DIMENSIONS.map((d,i)=>`<li>${i+4}. ${d.label}</li>`).join('')}
    <li>Plans d'action 7 jours</li>
    <li>Annexes & fiches outils</li>
  </ol>
  <div class="page-break"></div>
  `;

  const intro = `
  <h2>Introduction</h2>
  <p>Ce rapport présente une analyse narrative détaillée de votre profil de préparation mentale selon 6 dimensions clés.
  Il propose des repères concrets pour progresser sur deux horizons : immédiat (7 jours) et court terme (2 à 4 semaines).</p>
  <div class="page-break"></div>
  `;

  const method = `
  <h2>Méthodologie & lecture des scores</h2>
  <p>Les scores sont exprimés en pourcentage (0–100%). Ils synthétisent vos réponses à 36 items sur une échelle de 1 à 5.
  Un score ≥ 70% indique une force solide ; 40–69% une compétence en progression ; &lt; 40% un chantier prioritaire.</p>
  <div class="page-break"></div>
  `;

  const globalPart = `
  <h2>Profil global (ADN CAP)</h2>
  ${radarSVG(scores)}
  ${renderBars(scores, overall).outerHTML}
  <div class="page-break"></div>
  `;

  const perDim = DIMENSIONS.map((d,i)=>{
    const pct = scores[i];
    const text = narrativeFor(d.key, pct);
    const actions = actionWeek(d.key, pct).map(x=>`<li>${x}</li>`).join('');
    const deepDive = Array.from({length:6}).map(()=>`
      <p>Analyse complémentaire – ${d.label} : situations fréquentes, signaux faibles,
      stratégies d'ajustement (avant/pendant/après), et indicateurs de progression.</p>
    `).join('');
    return `
      <h2>${d.label} – ${badge(pct)}</h2>
      <p>${text}</p>
      <div class="bar"><i style="width:${pct}%"></i></div>
      ${deepDive}
      <h3>Plan d'action 7 jours</h3>
      <ul>${actions}</ul>
      <div class="page-break"></div>
    `;
  }).join('');

  const planGlobal = `
  <h2>Plans d'action consolidés (7 jours)</h2>
  <p>Priorités transverses :</p>
  <ol>
    <li>Intention matin (1′) + bilan soir (2′).</li>
    <li>2 blocs de focus (25–50′) sans distraction / jour.</li>
    <li>Respiration cohérente 5′ + hydratation.</li>
  </ol>
  <div class="page-break"></div>
  `;

  const annexes = `
  <h2>Annexes & fiches outils</h2>
  <h3>Routine pré-performance (1 minute)</h3>
  <ul><li>Respire (4–6) 6 cycles</li><li>Visualise l'action clé</li><li>Formule l'intention spécifique</li></ul>
  <h3>Grille d'auto-évaluation (hebdo)</h3>
  <table border="1" cellspacing="0" cellpadding="6">
    <tr><th>Jour</th><th>Objectifs</th><th>Planif</th><th>Confiance</th><th>Émotions</th><th>Énergie</th><th>Focus</th></tr>
    ${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j=>`<tr><td>${j}</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
  </table>
  <div class="page-break"></div>
  `;

  container.innerHTML = cover + toc + intro + method + globalPart + perDim + planGlobal + annexes;
  return container;
}

function show(section){
  [intro, quiz, results].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
  scrollTop();
}

startBtn.addEventListener('click', () => {
  if(!fullNameEl.value.trim()){
    if(!confirm("Tu n'as pas indiqué de nom. Continuer ?")) return;
  }
  renderQuestions();
  show(quiz);
});

resetBtn.addEventListener('click', () => {
  if(confirm("Tout recommencer ?")){
    document.querySelectorAll('input[type=radio]:checked').forEach(i => i.checked=false);
    show(intro);
  }
});

finishBtn.addEventListener('click', () => {
  const vals = getResponses();
  if(!vals){
    alert("Merci de répondre à toutes les questions (1 à 5).");
    return;
  }
  renderReport(vals);
  show(results);
});

backBtn.addEventListener('click', () => show(quiz));

pdfBtn.addEventListener('click', () => { window.print(); });
