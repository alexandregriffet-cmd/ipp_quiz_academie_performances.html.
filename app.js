const COLORS={Garant:"#1f77b4",Conquérant:"#d62728",Bienveillant:"#2ca02c",Fiable:"#800080",Visionnaire:"#87CEEB",Spontané:"#FFA500"};
let QUESTIONS=[],answers=[],current=0,REPORT={};
const $=s=>document.querySelector(s);

document.getElementById('startBtn').addEventListener('click', async ()=>{
  await loadQuestions();
  startQuiz();
});

async function loadQuestions(){
  try{
    const res = await fetch(`data/questions_ados.json?v=${window.__V__}`,{cache:"no-store"});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    QUESTIONS = await res.json();
    if(!Array.isArray(QUESTIONS) || !QUESTIONS.length) throw new Error("JSON vide/mal formé");
    document.getElementById("err").textContent = "";
  }catch(e){
    console.error("Chargement questions échoué:", e);
    document.getElementById("err").textContent = "⚠️ Échec chargement des questions. Fallback activé. Vérifiez data/questions_ados.json";
    // Fallback minimal pour permettre de tester le flux
    QUESTIONS = [{
      prompt:"Exemple de situation : révisions ce soir",
      weight:1,
      options:[
        {label:"Je dresse une check‑list en 3 étapes et j’attaque.",profil:"Garant"},
        {label:"Je choisis le défi utile et j’avance tout de suite.",profil:"Conquérant"},
        {label:"Je crée un climat calme et je m’y mets.",profil:"Bienveillant"},
        {label:"J’annonce un engagement réaliste et je le tiens.",profil:"Fiable"},
        {label:"Je clarifie l’idée clé seul 10 min.",profil:"Visionnaire"},
        {label:"Je lance un sprint ludique de 10 min.",profil:"Spontané"}
      ]
    }];
  }
  answers = new Array(QUESTIONS.length).fill(null);
}

function startQuiz(){
  document.querySelector(".rules").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  current=0; renderQ();
}

$("#prev").addEventListener("click",()=>{ if(current>0){current--;renderQ();}});
$("#next").addEventListener("click",()=>{ if(current<QUESTIONS.length-1){current++;renderQ();}});
$("#finish").addEventListener("click",finish);

function renderQ(){
  const q=QUESTIONS[current];
  if(!Array.isArray(answers[current])) answers[current]=[];
  const ranked=answers[current];
  const rankOf=i=>{const p=ranked.indexOf(i);return p===-1?null:p+1;}
  $("#q").innerHTML = `<h3>${current+1}. ${q.prompt}</h3>
  <div class="answers">
    ${q.options.map((o,i)=>`<div class="option ${rankOf(i)?'selected':''}" data-i="${i}">${o.label}${rankOf(i)?`<span class='rank-badge'>${rankOf(i)}</span>`:''}</div>`).join('')}
  </div>
  <p>Classez vos réponses par priorité (1→6). Minimum 3 choix pour continuer.</p>`;

  $("#q").querySelectorAll(".option").forEach(op=>op.addEventListener("click",()=>{
    const i=+op.dataset.i; const p=ranked.indexOf(i);
    if(p===-1){ if(ranked.length<6) ranked.push(i);} else { ranked.splice(p,1); }
    renderQ();
  }));

  $("#prev").disabled = current===0;
  const ok = ranked.length>=3;
  $("#next").disabled = !ok || current===QUESTIONS.length-1;
  $("#finish").classList.toggle("hidden", current!==QUESTIONS.length-1);
  $("#finish").disabled = !ok;
  $("#progress").textContent = `Progression : ${current+1}/${QUESTIONS.length} • Choix : ${ranked.length}`;
}

async function finish(){
  const weights=[6,5,4,3,2,1];
  const profiles=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const scores=Object.fromEntries(profiles.map(p=>[p,0]));
  const rank1=Object.fromEntries(profiles.map(p=>[p,0]));   // E_k
  const top2=Object.fromEntries(profiles.map(p=>[p,0]));    // S_k
  const Q = QUESTIONS.length;

  // Scores globaux + E_k / S_k
  QUESTIONS.forEach((q,qi)=>{
    const ranked = answers[qi]||[];
    ranked.forEach((opt,idx)=>{
      const p = q.options[opt].profil;
      scores[p]+= (q.weight||1)*(weights[idx]||0);
      if(idx===0) rank1[p]+=1;
      if(idx<=1) top2[p]+=1;
    });
  });

  // ADN
  const ADN = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];

  // Fenêtre CAP actuel = dernier tiers ou 20 dernières questions
  const startIdx = Math.max(0, Q - Math.max(20, Math.floor(Q/3)));
  const winScores=Object.fromEntries(profiles.map(p=>[p,0]));
  const winTop2=Object.fromEntries(profiles.map(p=>[p,0]));
  const winLen = Q - startIdx;

  for(let qi=startIdx; qi<Q; qi++){
    const ranked = answers[qi]||[];
    ranked.forEach((opt,idx)=>{
      const p = QUESTIONS[qi].options[opt].profil;
      winScores[p]+= (QUESTIONS[qi].weight||1)*(weights[idx]||0);
      if(idx<=1) winTop2[p]+=1;
    });
  }

  // CAP actuel candidat (hors ADN) + seuils
  let capCandidates = profiles.filter(p=>p!==ADN).map(p=>[p, winScores[p]]).sort((a,b)=>b[1]-a[1]);
  let CAP = null;
  if(capCandidates.length){
    const [p1,v1] = capCandidates[0]; const v2 = capCandidates[1]?.[1] ?? 0;
    const condTop2 = (winTop2[p1]/winLen) >= 0.30;
    const condDelta = (v2===0) ? true : ((v1 - v2) / Math.max(1, v2) >= 0.05);
    if(condTop2 && v1>0) CAP = p1;
  }

  // Caps vécus (0, 1 ou 2) hors ADN et hors CAP (si CAP existe)
  const lived = profiles.filter(p=>p!==ADN && p!==CAP).map(p=>{
    const sRatio = top2[p]/Q;        // S_k / Q
    const eRatio = rank1[p]/Q;       // E_k / Q
    const meanRankProxy = (Q - top2[p])/(Q||1) * 3;
    const stable = meanRankProxy <= 2.8;
    const ok = (sRatio>=0.35 || eRatio>=0.15) && stable;
    return {p, ok, score: scores[p]};
  }).filter(x=>x.ok).sort((a,b)=>b.score-a.score).map(x=>x.p).slice(0,2);

  // Pourcentages d’affichage
  const P_ADN = scores[ADN] || 1;
  let disp = Object.fromEntries(profiles.map(p=>[p,0]));
  disp[ADN] = 100;
  lived.forEach(p=>disp[p]=100);

  if(CAP){
    let capVal = Math.round(100 * (scores[CAP]/P_ADN));
    capVal = Math.max(20, Math.min(95, capVal));
    disp[CAP] = Math.max(disp[CAP], capVal);
  }

  profiles.forEach(p=>{
    if(disp[p]===0){
      let v = Math.round(100 * (scores[p]/P_ADN));
      if(CAP) v = Math.min((disp[CAP]||100)-1, v);
      disp[p] = Math.max(0, v);
    }
  });

  const capsVecus = lived; // 0..2 éléments
  REPORT = { ADN, CAP, perc: disp, capsVecus };

  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("report").classList.remove("hidden");
  renderSummary(); renderStar(); renderTable(); renderBoussole(); renderPyramide(); await renderNarrative();
  document.getElementById("downloadPdf").onclick = exportPDF;
}

function dot(c){return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:6px"></span>`;}
function renderSummary(){
  const {ADN,CAP,capsVecus}=REPORT;
  $("#summary").innerHTML = `<div class="badges">
    <span class="badge">${dot(COLORS[ADN])}<b>ADN</b> : ${ADN} ❤️</span>
    ${CAP?`<span class="badge">${dot(COLORS[CAP])}<b>Cap</b> : ${CAP} ⭐</span>`:""}
    ${capsVecus.map(c=>`<span class="badge"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#94a3b8;margin-right:6px"></span>${c} ⚪</span>`).join('')}
  </div>`;
}

function renderStar(){
  const labels=Object.keys(COLORS);
  const data=labels.map(l=>REPORT.perc[l]||0);
  const ctx=document.getElementById("etoile").getContext("2d");
  if(window._star) window._star.destroy();
  window._star = new Chart(ctx,{type:"radar",data:{labels,datasets:[
    {label:"Énergie (%)",data,fill:true,borderColor:"#111",backgroundColor:"rgba(16,24,39,0.12)",pointBackgroundColor:labels.map(l=>COLORS[l]),pointRadius:5}
  ]},options:{plugins:{legend:{display:false}},scales:{r:{suggestedMin:0,suggestedMax:100,ticks:{stepSize:20}}}}});
}

function renderTable(){
  const order=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const {ADN,CAP,perc,capsVecus}=REPORT;
  const badge=p=>p===ADN?"❤️ ADN":(p===CAP?"⭐ Cap":(capsVecus.includes(p)?"⚪ vécu":""));
  const tbody = order.map(p=>`<tr><td>${p}</td><td>${perc[p]||0}</td><td>${badge(p)}</td></tr>`).join('');
  document.querySelector("#resultTable tbody").innerHTML = tbody;
}

function renderBoussole(){
  const {ADN,CAP}=REPORT;
  const c=document.getElementById("boussole"), ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const W=c.width,H=c.height,cx=W/2,cy=H/2,m=20;
  ctx.strokeStyle="#111";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(m,cy);ctx.lineTo(W-m,cy);ctx.moveTo(cx,m);ctx.lineTo(cx,H-m);ctx.stroke();
  ctx.font="13px sans-serif";ctx.fillStyle="#111";
  ctx.fillText("Groupe / Externe", W-180, 24);
  ctx.fillText("Seul / Externe", 20, 24);
  ctx.fillText("Seul / Interne", 20, H-10);
  ctx.fillText("Groupe / Interne", W-190, H-10);
  const pos={"Garant":[W-70,H-40],"Conquérant":[W-70,40],"Bienveillant":[W-70,H-40],"Fiable":[W-70,H-40],"Visionnaire":[70,H-40],"Spontané":[W-70,H-40]};
  const draw=(x,y,c,l)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111";ctx.fillText(l,x-18,y-14);}
  draw(...pos[ADN], "#111", "❤️ "+ADN);
  if(CAP) draw(...pos[CAP], "#111", "⭐ "+CAP);
}

function renderPyramide(){
  const c=document.getElementById("pyramide"), ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const left=30,right=c.width-30,top=20,h=90,levels=[
    ["1er degré : signaux d’alerte","#a6cee3"],
    ["Sous-sol : comportements défensifs","#fb9a99"],
    ["Cave : rupture / épuisement","#e31a1c"]
  ];
  levels.forEach((L,i)=>{ctx.fillStyle=L[1];ctx.fillRect(left, top+i*(h+10), right-left, h);
    ctx.fillStyle="#111";ctx.font="13px sans-serif";ctx.fillText(L[0], left+10, top+i*(h+10)+24);});
}

async function renderNarrative(){
  const {ADN,CAP}=REPORT;
  const res = await fetch(`data/rapports_ipp.json?v=${window.__V__}`,{cache:"no-store"});
  const all = await res.json();
  const R = all[`${ADN}|${CAP||ADN}`] || all[`${ADN}|${ADN}`];
  let html = `<h3>Message de bienvenue</h3><p>${R.bienvenue}</p>`;
  R.sections.forEach(s=>{ if(s.points){ html += `<h3>${s.titre}</h3><ul>${s.points.map(p=>`<li>${p}</li>`).join('')}</ul>`; } else { html += `<h3>${s.titre}</h3><p>${s.texte}</p>`; } });
  document.getElementById("rapportTexte").innerHTML = html;
}

async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const pages = Array.from(document.querySelectorAll(".like-a4"));
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  for(let i=0;i<pages.length;i++){
    const canvas = await html2canvas(pages[i], {scale:2, useCORS:true});
    const img = canvas.toDataURL("image/png");
    const ratio = Math.min(W/canvas.width, H/canvas.height);
    const w = canvas.width*ratio, h = canvas.height*ratio;
    doc.addImage(img,"PNG",(W-w)/2,(H-h)/2,w,h);
    if(i<pages.length-1) doc.addPage();
  }
  doc.save("Rapport_IPP_Jeunes.pdf");
}
