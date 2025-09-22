/* IPP App JS (ROOT paths) */

const COLORS = {
  Garant: "#1f77b4",       // bleu
  Conquérant: "#d62728",   // rouge
  Bienveillant: "#2ca02c", // vert
  Fiable: "#800080",       // violet
  Visionnaire: "#87CEEB",  // bleu ciel
  Spontané: "#FFA500"      // orange
};

let MODE = "ados";
let QUESTIONS = [];
let answers = [];
let current = 0;
let COVER_IMG = null;

const el = (sel) => document.querySelector(sel);
const intro = el("#intro");
const qSection = el("#questionnaire");
const rapport = el("#rapport");
const qContainer = el("#q-container");
const progress = el("#progress");

document.querySelectorAll(".modes button").forEach(b=>{
  b.addEventListener("click", async e => {
    MODE = e.target.dataset.mode;
    await loadQuestions();
    start();
  });
});

async function loadQuestions(){
  const map = { ados: "data/questions_ados.json" };
  const res = await fetch(map[MODE]);
  QUESTIONS = await res.json();
  answers = new Array(QUESTIONS.length).fill(null);
}

function start(){
  intro.classList.add("hidden");
  qSection.classList.remove("hidden");
  current = 0;
  renderQuestion();
}

function renderQuestion(){
  const q = QUESTIONS[current];
  qContainer.innerHTML = `
    <div class="question">
      <h3>${current+1}. ${q.prompt}</h3>
      <div class="answers">
        ${q.options.map((opt,i)=>`
          <button data-i="${i}" class="${answers[current]===i?'active':''}">${opt.label}</button>
        `).join('')}
      </div>
    </div>
  `;
  qContainer.querySelectorAll(".answers button").forEach(btn=>{
    btn.addEventListener("click", () => {
      answers[current] = +btn.dataset.i;
      renderQuestion();
    });
  });
  el("#prev").disabled = current===0;
  el("#next").classList.toggle("hidden", current===QUESTIONS.length-1);
  el("#finish").classList.toggle("hidden", current!==QUESTIONS.length-1);
  progress.textContent = `Progression : ${current+1}/${QUESTIONS.length}`;
}

el("#prev").addEventListener("click", ()=>{ if(current>0){ current--; renderQuestion(); } });
el("#next").addEventListener("click", ()=>{ if(current<QUESTIONS.length-1){ current++; renderQuestion(); } });
el("#finish").addEventListener("click", finish);

async function finish(){
  // scoring
  const scores = {Garant:0, Conquérant:0, Bienveillant:0, Fiable:0, Visionnaire:0, Spontané:0};
  QUESTIONS.forEach((q,idx)=>{
    const i = answers[idx];
    if(i==null) return;
    const prof = q.options[i].profil; // profil key
    scores[prof] += q.weight || 1;
  });
  // normalize to percentages
  const total = Object.values(scores).reduce((a,b)=>a+b,0) || 1;
  let perc = {};
  Object.keys(scores).forEach(k=> perc[k] = Math.round((scores[k]/total)*100));

  // ADN & Cap
  const sorted = Object.entries(perc).sort((a,b)=>b[1]-a[1]);
  const ADN = sorted[0][0];
  const CAP = sorted[1][0];
  const capsVecus = sorted.slice(2,4).map(x=>x[0]);

  // Visu ADN à 100 %
  const percVisu = {...perc};
  percVisu[ADN] = 100;

  qSection.classList.add("hidden");
  rapport.classList.remove("hidden");
  renderSummary(ADN, CAP, percVisu, capsVecus);
  await renderEtoile(percVisu, ADN, CAP, capsVecus);
  renderSynthese(percVisu, ADN, CAP, capsVecus);
  await renderBoussole(ADN, CAP);
  await renderPyramide(ADN, CAP);
  await renderRapportTexte(ADN, CAP, capsVecus);
}

function renderSummary(ADN, CAP, perc, capsVecus){
  const dot = (color)=>`<span class="dot" style="background:${color}"></span>`;
  const vecus = (capsVecus||[]).map(v=>`<div class="badge"><span class="dot" style="background:#94a3b8"></span> ${v} ⚪</div>`).join("");
  el("#summary").innerHTML = `
    <div class="badge">${dot(COLORS[ADN])} <strong>ADN</strong> : ${ADN}</div>
    <div class="badge">${dot(COLORS[CAP])} <strong>Cap</strong> : ${CAP}</div>
  `;
}

async function renderEtoile(perc, ADN, CAP, capsVecus){
  const ctx = document.getElementById("etoile").getContext("2d");
  const labels = Object.keys(COLORS);
  const data = labels.map(l=>perc[l]||0);
  if(window._radar) window._radar.destroy();
  window._radar = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Énergie IPP (%)",
        data,
        fill: true,
        borderColor: "#111",
        backgroundColor: "rgba(100,100,100,0.2)",
        pointBackgroundColor: labels.map(l=>COLORS[l]),
        pointRadius: 5
      },{
        label: "Caps vécus",
        data: labels.map(l => (capsVecus||[]).includes(l) ? (perc[l]||0) : 0),
        fill: false,
        borderColor: "rgba(0,0,0,0)",
        pointBackgroundColor: labels.map(l => (capsVecus||[]).includes(l) ? "#94a3b8" : "rgba(0,0,0,0)"),
        pointBorderColor: labels.map(l => (capsVecus||[]).includes(l) ? "#94a3b8" : "rgba(0,0,0,0)"),
        pointRadius: 6
      }]
    },
    options: {
      scales: {
        r: { suggestedMin:0, suggestedMax:100, ticks: { stepSize:20 } }
      },
      plugins:{
        legend:{ display:false },
        title:{ display:true, text:`Étoile IPP – ADN ${ADN} ❤️ / Cap ${CAP} ⭐` }
      }
    }
  });
}

function renderSynthese(perc, ADN, CAP, capsVecus){
  const order = ["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const badge = (p)=> p===ADN?"❤️ ADN":(p===CAP?"⭐ Cap":((capsVecus||[]).includes(p)?"⚪ vécu":""));
  const rows = order.map(p=>`<tr><td>${p}</td><td>${perc[p]||0} %</td><td>${badge(p)}</td></tr>`).join("");
  el("#synthese").innerHTML = `
    <h3>Synthèse chiffrée</h3>
    <table>
      <thead><tr><th>Profil</th><th>Énergie</th><th>Repère</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function renderBoussole(ADN, CAP){
  const c = document.getElementById("boussole");
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const W=c.width, H=c.height, cx=W/2, cy=H/2, m=20;
  ctx.strokeStyle="#111"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(m,cy); ctx.lineTo(W-m,cy); ctx.moveTo(cx,m); ctx.lineTo(cx,H-m); ctx.stroke();
  ctx.font="14px sans-serif"; ctx.fillStyle="#111";
  ctx.fillText("Groupe / Externe", W-180, 24);
  ctx.fillText("Seul / Externe", 20, 24);
  ctx.fillText("Seul / Interne", 20, H-10);
  ctx.fillText("Groupe / Interne", W-190, H-10);

  const pos = {
    "Garant": [W-60, H-40], // Groupe/Interne
    "Conquérant": [W-60, 40], // Groupe/Externe
    "Bienveillant": [W-60, H-40], // Groupe/Interne
    "Fiable": [W-60, H-40], // Groupe/Interne
    "Visionnaire": [60, H-40], // Seul/Interne
    "Spontané": [W-60, H-40] // Groupe/Interne
  };
  const dot=(x,y,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();};

  dot(...pos[ADN], COLORS[ADN]); ctx.fillStyle=COLORS[ADN]; ctx.fillText("❤️ ADN "+ADN, pos[ADN][0]-20, pos[ADN][1]-14);
  ctx.fillStyle=COLORS[CAP]; dot(...pos[CAP], COLORS[CAP]); ctx.fillText("⭐ Cap "+CAP, pos[CAP][0]-20, pos[CAP][1]-14);
}

async function renderPyramide(ADN, CAP){
  const c = document.getElementById("pyramide");
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const W=c.width, H=c.height, left=40, right=W-40, top=30, step=70;

  const levels = [
    {txt:"1er degré : signaux d’alerte", color:"#a6cee3"},
    {txt:"Sous-sol : comportements défensifs", color:"#fb9a99"},
    {txt:"Cave : rupture / épuisement", color:"#e31a1c"}
  ];
  for(let i=0;i<levels.length;i++){
    ctx.fillStyle = levels[i].color;
    ctx.fillRect(left, top+i*step, right-left, step-10);
    ctx.fillStyle = "#111";
    ctx.font="13px sans-serif";
    ctx.fillText(levels[i].txt, left+10, top+i*step+28);
  }
  ctx.font="14px sans-serif";
  ctx.fillText(`Pyramide de stress – ADN ${ADN} / Cap ${CAP}`, left, top+levels.length*step+20);
}


async function buildPremiumPdfDoc(ADN, CAP, perc, reportData){
  const pdfRoot = document.getElementById("pdfDoc");
  pdfRoot.innerHTML = ""; // reset
  // COVER
  const cover = document.createElement("section");
  cover.className = "page cover";
  cover.innerHTML = `
    <div class="wm"><img src="assets/logo.png" alt="wm"></div>
    <img src="assets/logo.png" alt="Logo" style="width:220px;height:auto;margin-bottom:20px" class="brand">
    <h1>Inventaire Psychologique de Performance</h1><div class="youth-badge">Jeunes · 12–25 ans</div>
    <h2>Inventaire Psychologique de Performances Jeunes – Académie de Performances</h2>
    <div class="kpi">
      <div class="chip"><b>ADN</b> : ${ADN} ❤️</div>
      <div class="chip"><b>Cap</b> : ${CAP} ⭐</div>
      <div class="chip"><b>Durée indicative</b> : jusqu’à 45 min</div>
    </div>
    ${COVER_IMG? `<img src="${COVER_IMG}" alt="Photo" class="client-photo">` : ""}<p style="max-width:640px;color:#334155">
      Rapport rédigé selon votre combinaison IPP et enrichi de visuels : étoile, boussole, pyramide, synthèse chiffrée et plans d’action.
    </p>
  `;
  pdfRoot.appendChild(cover);

  // STAR + SYNTHESIS PAGE
  const starPage = document.createElement("section");
  starPage.className = "page";
  starPage.innerHTML = `
    <div class="wm"><img src="assets/logo.png" alt="wm"></div>
    <h3 class="section-title">Votre étoile IPP & synthèse chiffrée</h3>
    <div class="fig">
      <canvas id="pdf_etoile" width="460" height="380"></canvas>
      <div id="pdf_synthese"></div>
    </div>
  `;
  pdfRoot.appendChild(starPage);

  // BOUSSOLE + PYRAMIDE PAGE
  const visusPage = document.createElement("section");
  visusPage.className = "page";
  visusPage.innerHTML = `
    <div class="wm"><img src="assets/logo.png" alt="wm"></div>
    <h3 class="section-title">Repères visuels</h3>
    <div class="fig">
      <canvas id="pdf_boussole" width="420" height="320"></canvas>
      <canvas id="pdf_pyramide" width="420" height="320"></canvas>
    </div>
  `;
  pdfRoot.appendChild(visusPage);

  // TEXT PAGES: bienvenue + each section -> own page
  const p1 = document.createElement("section");
  p1.className = "page";
  p1.innerHTML = `
    <div class="wm"><img src="assets/logo.png" alt="wm"></div>
    <h3 class="section-title">Message de bienvenue</h3>
    <p>${reportData.bienvenue || ""}</p>
  `;
  pdfRoot.appendChild(p1);

  (reportData.sections||[]).forEach(sec => {
    const s = document.createElement("section");
    s.className = "page";
    s.innerHTML = `<div class="wm"><img src="assets/logo.png" alt="wm"></div>
      <h3 class="section-title">${sec.titre || ""}</h3>`;
    if(sec.points && Array.isArray(sec.points)){
      s.innerHTML += `<ul>${sec.points.map(p=>`<li>${p}</li>`).join("")}</ul>`;
    }else if(sec.texte){
      s.innerHTML += `<p>${sec.texte}</p>`;
    }
    pdfRoot.appendChild(s);
  });

  // Draw charts into PDF canvases
  // Etoile
  try{
    const labels = Object.keys(COLORS);
    const data = labels.map(l=>perc[l]||0);
    const ctxStar = document.getElementById("pdf_etoile").getContext("2d");
    new Chart(ctxStar, {
      type:"radar",
      data:{ labels, datasets:[{ data, fill:true, borderColor:"#111",
        backgroundColor:"rgba(100,100,100,0.2)", pointBackgroundColor: labels.map(l=>COLORS[l]), pointRadius:4 }]},
      options:{ scales:{ r:{ suggestedMin:0, suggestedMax:100, ticks:{ stepSize:20 } } }, plugins:{ legend:{display:false} } }
    });
  }catch(e){ console.warn("radar fail", e); }

  // Synthèse table
  const order = ["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const badge = (p)=> p===ADN?"❤️ ADN":(p===CAP?"⭐ Cap":((capsVecus||[]).includes(p)?"⚪ vécu":""));
  document.getElementById("pdf_synthese").innerHTML = `
    <table style="border-collapse:collapse;width:100%">
      <thead><tr>
        <th style="border:1px solid #e2e8f0;padding:6px;text-align:left">Profil</th>
        <th style="border:1px solid #e2e8f0;padding:6px;text-align:left">Énergie</th>
        <th style="border:1px solid #e2e8f0;padding:6px;text-align:left">Repère</th>
      </tr></thead>
      <tbody>
        ${order.map(p=>`<tr>
          <td style="border:1px solid #e2e8f0;padding:6px">${p}</td>
          <td style="border:1px solid #e2e8f0;padding:6px">${perc[p]||0} %</td>
          <td style="border:1px solid #e2e8f0;padding:6px">${badge(p)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  `;

  // Boussole
  const cb = document.getElementById("pdf_boussole");
  const bctx = cb.getContext("2d");
  const W=cb.width, H=cb.height, cx=W/2, cy=H/2, m=20;
  bctx.strokeStyle="#111"; bctx.lineWidth=1;
  bctx.beginPath(); bctx.moveTo(m,cy); bctx.lineTo(W-m,cy); bctx.moveTo(cx,m); bctx.lineTo(cx,H-m); bctx.stroke();
  bctx.font="14px sans-serif"; bctx.fillStyle="#111";
  bctx.fillText("Groupe / Externe", W-180, 24);
  bctx.fillText("Seul / Externe", 20, 24);
  bctx.fillText("Seul / Interne", 20, H-10);
  bctx.fillText("Groupe / Interne", W-190, H-10);
  const pos = {
    "Garant": [W-60, H-40], "Conquérant": [W-60, 40], "Bienveillant": [W-60, H-40],
    "Fiable": [W-60, H-40], "Visionnaire": [60, H-40], "Spontané": [W-60, H-40]
  };
  const dot=(x,y,color)=>{bctx.fillStyle=color; bctx.beginPath(); bctx.arc(x,y,8,0,Math.PI*2); bctx.fill();};
  dot(...pos[ADN], COLORS[ADN]); bctx.fillStyle=COLORS[ADN]; bctx.fillText("❤️ ADN "+ADN, pos[ADN][0]-20, pos[ADN][1]-14);
  bctx.fillStyle=COLORS[CAP]; dot(...pos[CAP], COLORS[CAP]); bctx.fillText("⭐ Cap "+CAP, pos[CAP][0]-20, pos[CAP][1]-14);

  // Pyramide
  const cp = document.getElementById("pdf_pyramide");
  const pctx = cp.getContext("2d");
  const left=30, right=cp.width-30, top=20, step=70;
  const levels = [
    {txt:"1er degré : signaux d’alerte", color:"#a6cee3"},
    {txt:"Sous-sol : comportements défensifs", color:"#fb9a99"},
    {txt:"Cave : rupture / épuisement", color:"#e31a1c"}
  ];
  for(let i=0;i<levels.length;i++){
    pctx.fillStyle = levels[i].color;
    pctx.fillRect(left, top+i*step, right-left, step-10);
    pctx.fillStyle = "#111";
    pctx.font="13px sans-serif";
    pctx.fillText(levels[i].txt, left+10, top+i*step+28);
  }
}

async function exportPremiumPDF(){
  const {{ jsPDF }} = window.jspdf;
  const doc = new jsPDF({unit:"pt", format:"a4"});
  const pages = Array.from(document.querySelectorAll("#pdfDoc .page"));
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for(let i=0;i<pages.length;i++){
    const page = pages[i];
    const canvas = await html2canvas(page, {scale:2});
    const img = canvas.toDataURL("image/png");
    const ratio = Math.min(pageWidth/canvas.width, pageHeight/canvas.height);
    const w = canvas.width*ratio, h = canvas.height*ratio;
    doc.addImage(img, "PNG", (pageWidth-w)/2, (pageHeight-h)/2, w, h);
    if(i < pages.length-1) doc.addPage();
  }
  doc.save("Rapport_IPP_premium.pdf");
}

async function renderRapportTexte(ADN, CAP){
  const res = await fetch("data/rapports_ipp.json");
  const all = await res.json();
  const key = `${ADN}|${CAP}`;
  const R = all[key] || {bienvenue:"Rapport en cours de rédaction.", sections:[]};
  const container = el("#rapport-texte");
  let html = `<h3>Message de bienvenue</h3><p>${R.bienvenue}</p>`;
  R.sections.forEach(s=>{
    html += `<h3>${s.titre}</h3>`;
    if(Array.isArray(s.points)){
      html += "<ul>" + s.points.map(p=>`<li>${p}</li>`).join("") + "</ul>";
    }else if(s.texte){
      html += `<p>${s.texte}</p>`;
    }
  });
  container.innerHTML = html;

  // PDF
  await buildPremiumPdfDoc(ADN, CAP, perc, R); PREMIUM BUILD
  await buildPremiumPdfDoc(ADN, CAP, perc, R);
  el("#pdfDoc").style.display = 'block';
  el("#downloadPdf").onclick = async () => {
    const {{ jsPDF }} = window.jspdf;
    const doc = new jsPDF({unit:"pt", format:"a4"});
    const page = document.querySelector("#rapport");
    const canvas = await html2canvas(page, {scale:2});
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 0;
    let sY = 0;
    while(true){
      const part = document.createElement("canvas");
      const maxH = Math.floor(pageHeight*2); // roughly scaled segment height
      part.width = canvas.width;
      part.height = Math.min(canvas.height - sY, maxH);
      const pctx = part.getContext("2d");
      pctx.drawImage(canvas, 0, sY, part.width, part.height, 0, 0, part.width, part.height);
      const imgPart = part.toDataURL("image/png");
      const ratio = Math.min(pageWidth/part.width, pageHeight/part.height);
      const w = part.width*ratio, h = part.height*ratio;
      doc.addImage(imgPart, "PNG", (pageWidth-w)/2, 20, w, h);
      sY += part.height;
      if(sY >= canvas.height) break;
      doc.addPage();
    }
    doc.save("Rapport_IPP.pdf");
  };

  el("#restart").onclick = ()=> location.reload();
}


document.addEventListener("change", (e)=>{
  if(e.target && e.target.id==="coverPhoto"){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { COVER_IMG = reader.result; };
    reader.readAsDataURL(file);
  }
});
