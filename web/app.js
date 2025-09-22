/* IPP App JS */

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
  const map = {
    ados: "../data/questions_ados.json",
    adultes: "../data/questions_adultes.json",
    hp: "../data/questions_hp.json"
  };
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

  // Determine ADN & Cap (simple: ADN=max% ; Cap=2nd max)
  const sorted = Object.entries(perc).sort((a,b)=>b[1]-a[1]);
  const ADN = sorted[0][0];
  const CAP = sorted[1][0];

  // Force ADN à 100 % visuellement si besoin (option)
  const percVisu = {...perc};
  percVisu[ADN] = 100;

  qSection.classList.add("hidden");
  rapport.classList.remove("hidden");
  renderSummary(ADN, CAP, percVisu);
  await renderEtoile(percVisu, ADN, CAP);
  renderSynthese(percVisu, ADN, CAP);
  await renderBoussole(ADN, CAP);
  await renderPyramide(ADN, CAP);
  await renderRapportTexte(ADN, CAP);
}

function renderSummary(ADN, CAP, perc){
  const dot = (color)=>`<span class="dot" style="background:${color}"></span>`;
  el("#summary").innerHTML = `
    <div class="badge">${dot(COLORS[ADN])} <strong>ADN</strong> : ${ADN}</div>
    <div class="badge">${dot(COLORS[CAP])} <strong>Cap</strong> : ${CAP}</div>
  `;
}

async function renderEtoile(perc, ADN, CAP){
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

function renderSynthese(perc, ADN, CAP){
  const order = ["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const badge = (p)=> p===ADN?"❤️ ADN":(p===CAP?"⭐ Cap":"");
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
    "Fiable": [W-60, H-40], // Groupe/Interne (valeurs partagées)
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
    {txt:"Sous-sol : comportements toxiques", color:"#fb9a99"},
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

async function renderRapportTexte(ADN, CAP){
  const res = await fetch("../data/rapports_ipp.json");
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
  el("#downloadPdf").onclick = async () => {
    const {{ jsPDF }} = window.jspdf;
    const doc = new jsPDF({unit:"pt", format:"a4"});
    const page = document.querySelector("#rapport");
    const canvas = await html2canvas(page, {scale:2});
    const img = canvas.toDataURL("image/png");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth/canvas.width, pageHeight/canvas.height);
    const w = canvas.width*ratio, h = canvas.height*ratio;
    let y = 20;
    // split across pages if needed
    let sY = 0;
    while(sY < canvas.height){
      const part = document.createElement("canvas");
      part.width = canvas.width;
      part.height = Math.min(canvas.height - sY, Math.floor(pageHeight/ratio));
      const pctx = part.getContext("2d");
      pctx.drawImage(canvas, 0, sY, part.width, part.height, 0, 0, part.width, part.height);
      const imgPart = part.toDataURL("image/png");
      doc.addImage(imgPart, "PNG", (pageWidth-w)/2, 20, w, part.height*ratio);
      sY += part.height;
      if(sY < canvas.height) doc.addPage();
    }
    doc.save("Rapport_IPP.pdf");
  };

  el("#restart").onclick = ()=> location.reload();
}
