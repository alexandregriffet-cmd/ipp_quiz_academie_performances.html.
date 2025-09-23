/* IPP – Jeunes (12–25) minimal start binding + ranking min 3 */
const COLORS = {Garant:"#1f77b4",Conquérant:"#d62728",Bienveillant:"#2ca02c",Fiable:"#800080",Visionnaire:"#87CEEB",Spontané:"#FFA500"};
let QUESTIONS=[], answers=[], current=0;

async function loadQuestions(){
  try{
    const res = await fetch("data/questions_ados.json", {cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    QUESTIONS = await res.json();
  }catch(e){
    // fallback embedded minimal (first 6 contexts) if fetch fails
    QUESTIONS = [
      {"prompt":"Dans un devoir maison à rendre demain, vous faites quoi en premier ?","weight":1,"options":[
        {"label":"Je fais un plan clair et j’organise par étapes.","profil":"Garant"},
        {"label":"Je me lance tout de suite pour créer de l’élan.","profil":"Conquérant"},
        {"label":"Je demande un avis pour avancer sereinement.","profil":"Bienveillant"},
        {"label":"Je relis les consignes et je m’aligne dessus.","profil":"Fiable"},
        {"label":"Je réfléchis 5 min pour trouver une idée maligne.","profil":"Visionnaire"},
        {"label":"Je rends ça plus fun pour démarrer.","profil":"Spontané"}]}
    ];
  }
  answers = new Array(QUESTIONS.length).fill(null);
}

function startQuiz(){
  document.querySelector(".rules").classList.add("hidden");
  document.querySelector("#questionnaire").classList.remove("hidden");
  current=0; renderQuestion();
}

const el = s=>document.querySelector(s);
const qContainer = el("#q-container");
el("#prev").addEventListener("click",()=>{ if(current>0){current--;renderQuestion();}});
el("#next").addEventListener("click",()=>{ if(current<QUESTIONS.length-1){current++;renderQuestion();}});
el("#finish").addEventListener("click",finish);

function renderQuestion(){
  const q = QUESTIONS[current];
  if(!Array.isArray(answers[current])) answers[current]=[];
  const ranked = answers[current];
  const rankOf = idx => { const pos=ranked.indexOf(idx); return pos===-1?null:(pos+1); };
  qContainer.innerHTML = `
    <div class="question">
      <h3>${current+1}. ${q.prompt}</h3>
      <div class="answers">
        ${q.options.map((opt,i)=>{
          const r = rankOf(i);
          return `<div class="option ${r? 'selected':''}" data-i="${i}">
              ${opt.label}
              ${r? `<span class="rank-badge">${r}</span>`:''}
            </div>`;
        }).join('')}
      </div>
      <div class="rank-legend">Classez vos réponses par priorité (1 à 6). Navigation possible quand vous en avez choisi au moins <b>3</b>.</div>
      <button class="reset-q">Réinitialiser cette question</button>
    </div>
  `;
  qContainer.querySelectorAll(".answers .option").forEach(optEl=>{
    optEl.addEventListener("click",()=>{
      const idx = +optEl.dataset.i;
      const pos = ranked.indexOf(idx);
      if(pos===-1){ if(ranked.length<6){ ranked.push(idx); } }
      else{ ranked.splice(pos,1); }
      renderQuestion();
    });
  });
  qContainer.querySelector(".reset-q").addEventListener("click", ()=>{ answers[current]=[]; renderQuestion(); });
  el("#prev").disabled = current===0;
  el("#next").classList.toggle("hidden", current===QUESTIONS.length-1);
  el("#finish").classList.toggle("hidden", current!==QUESTIONS.length-1);
  const ok = ranked.length>=3;
  el("#next").disabled = !ok;
  el("#finish").disabled = !ok;
  el("#progress").textContent = `Progression : ${current+1}/${QUESTIONS.length} — choix : ${ranked.length}`;
}

async function finish(){
  const scores={Garant:0,Conquérant:0,Bienveillant:0,Fiable:0,Visionnaire:0,Spontané:0};
  const RANK_WEIGHTS=[6,5,4,3,2,1];
  QUESTIONS.forEach((q,i)=>{
    const ranked = Array.isArray(answers[i]) ? answers[i] : [];
    ranked.forEach((optIndex, rpos)=>{
      const prof = q.options[optIndex].profil;
      const w = RANK_WEIGHTS[rpos]||0;
      scores[prof] += (q.weight||1)*w;
    });
  });
  const total = Object.values(scores).reduce((a,b)=>a+b,0)||1;
  const perc={}; Object.keys(scores).forEach(k=>perc[k]=Math.round(scores[k]/total*100));
  const sorted = Object.entries(perc).sort((a,b)=>b[1]-a[1]);
  const ADN=sorted[0][0], CAP=sorted[1][0], capsVecus=sorted.slice(2,4).map(x=>x[0]);
  const percVisu={...perc}; percVisu[ADN]=100;

  document.querySelector("#questionnaire").classList.add("hidden");
  document.querySelector("#rapport").classList.remove("hidden");
  renderSummary(ADN,CAP,percVisu,capsVecus);
  await renderEtoile(percVisu,ADN,CAP,capsVecus);
  renderSynthese(percVisu,ADN,CAP,capsVecus);
  await renderBoussole(ADN,CAP);
  await renderPyramide(ADN,CAP);
  await renderRapportTexte(ADN,CAP,capsVecus);
}

function renderSummary(ADN,CAP,perc,capsVecus){
  const dot=c=>`<span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c}"></span>`;
  const vecus=(capsVecus||[]).map(v=>`<div class="badge"><span class="dot" style="background:#94a3b8"></span> ${v} ⚪</div>`).join("");
  document.querySelector("#summary").innerHTML=`<div class="badge">${dot(COLORS[ADN])} <strong>ADN</strong> : ${ADN} ❤️</div>
  <div class="badge">${dot(COLORS[CAP])} <strong>Cap</strong> : ${CAP} ⭐</div>${vecus}`;
}

async function renderEtoile(perc,ADN,CAP,capsVecus){
  const labels=Object.keys(COLORS), data=labels.map(l=>perc[l]||0);
  const ctx=document.getElementById("etoile").getContext("2d");
  if(window._radar) window._radar.destroy();
  window._radar=new Chart(ctx,{type:"radar",data:{labels,datasets:[
    {label:"Énergie IPP (%)",data,fill:true,borderColor:"#111",backgroundColor:"rgba(100,100,100,0.2)",pointBackgroundColor:labels.map(l=>COLORS[l]),pointRadius:5},
    {label:"Caps vécus",data:labels.map(l=>(capsVecus||[]).includes(l)?(perc[l]||0):0),fill:false,borderColor:"rgba(0,0,0,0)",
     pointBackgroundColor:labels.map(l=>(capsVecus||[]).includes(l)?"#94a3b8":"rgba(0,0,0,0)"),
     pointBorderColor:labels.map(l=>(capsVecus||[]).includes(l)?"#94a3b8":"rgba(0,0,0,0)"),pointRadius:6}
  ]},options:{scales:{r:{suggestedMin:0,suggestedMax:100,ticks:{stepSize:20}}},plugins:{legend:{display:false},
  title:{display:true,text:`Étoile IPP – ADN ${ADN} ❤️ / Cap ${CAP} ⭐ (⚪ vécus)`}}}});
}

function renderSynthese(perc,ADN,CAP,capsVecus){
  const order=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const badge=p=>p===ADN?"❤️ ADN":(p===CAP?"⭐ Cap":((capsVecus||[]).includes(p)?"⚪ vécu":""));
  const rows=order.map(p=>`<tr><td>${p}</td><td>${perc[p]||0} %</td><td>${badge(p)}</td></tr>`).join("");
  document.querySelector("#synthese").innerHTML=`<h3>Synthèse chiffrée</h3><table><thead><tr><th>Profil</th><th>Énergie</th><th>Repère</th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function renderBoussole(ADN,CAP){
  const c=document.getElementById("boussole"), ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const W=c.width,H=c.height,cx=W/2,cy=H/2,m=20;
  ctx.strokeStyle="#111";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(m,cy);ctx.lineTo(W-m,cy);ctx.moveTo(cx,m);ctx.lineTo(cx,H-m);ctx.stroke();
  ctx.font="14px sans-serif";ctx.fillStyle="#111";
  ctx.fillText("Groupe / Externe", W-180, 24);
  ctx.fillText("Seul / Externe", 20, 24);
  ctx.fillText("Seul / Interne", 20, H-10);
  ctx.fillText("Groupe / Interne", W-190, H-10);
  const pos={"Garant":[W-60,H-40],"Conquérant":[W-60,40],"Bienveillant":[W-60,H-40],"Fiable":[W-60,H-40],"Visionnaire":[60,H-40],"Spontané":[W-60,H-40]};
  const dot=(x,y,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();};
  dot(...(pos[ADN]),COLORS[ADN]); ctx.fillStyle=COLORS[ADN]; ctx.fillText("❤️ ADN "+ADN, pos[ADN][0]-20, pos[ADN][1]-14);
  dot(...(pos[CAP]),COLORS[CAP]); ctx.fillStyle=COLORS[CAP]; ctx.fillText("⭐ Cap "+CAP, pos[CAP][0]-20, pos[CAP][1]-14);
}

async function renderPyramide(ADN,CAP){
  const c=document.getElementById("pyramide"), ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const W=c.width,H=c.height,left=30,right=W-30,top=20,step=70;
  const levels=[{txt:"1er degré : signaux d’alerte",color:"#a6cee3"},{txt:"Sous-sol : comportements défensifs",color:"#fb9a99"},{txt:"Cave : rupture / épuisement",color:"#e31a1c"}];
  for(let i=0;i<levels.length;i++){ctx.fillStyle=levels[i].color;ctx.fillRect(left, top+i*step, right-left, step-10);
    ctx.fillStyle="#111";ctx.font="13px sans-serif";ctx.fillText(levels[i].txt, left+10, top+i*step+28);}
}

async function renderRapportTexte(ADN,CAP,capsVecus){
  const res=await fetch("data/rapports_ipp.json"); const all=await res.json();
  const key=`${ADN}|${CAP}`; const R=all[key]||{bienvenue:"Rapport en cours de rédaction.",sections:[]};
  const container=document.querySelector("#rapport-texte");
  let html=`<h3>Message de bienvenue</h3><p>${R.bienvenue}</p>`;
  R.sections.forEach(s=>{ html+=`<h3>${s.titre}</h3>`; if(Array.isArray(s.points)){html+="<ul>"+s.points.map(p=>`<li>${p}</li>`).join("")+"</ul>";} else if(s.texte){html+=`<p>${s.texte}</p>`;} });
  container.innerHTML=html;

  await buildPremiumPdfDoc(ADN,CAP,{},R);
  document.querySelector("#downloadPdf").onclick = exportPremiumPDF;
  document.querySelector("#restart").onclick = ()=>location.reload();
}

async function buildPremiumPdfDoc(ADN,CAP,perc,R){
  const root=document.getElementById("pdfDoc"); root.innerHTML="";
  const cover=document.createElement("section"); cover.className="page cover";
  cover.innerHTML=`<div class="wm"><img src="assets/logo.png" alt="wm"></div>
    <img src="assets/logo.png" alt="Logo" class="brand">
    <h1>Inventaire Psychologique de Performance</h1>
    <div class="youth-badge">Jeunes · 12–25 ans</div>
    <h2 style="color:#475569">Inventaire Psychologique de Performances Jeunes – Académie de Performances</h2>
    <div class="kpi">
      <div class="chip"><b>ADN</b> : ${ADN} ❤️</div>
      <div class="chip"><b>Cap</b> : ${CAP} ⭐</div>
      <div class="chip"><b>Durée</b> : jusqu’à 45 min</div>
    </div>
    <p style="max-width:640px;color:#334155">Rapport rédigé selon votre combinaison IPP Jeunes.</p>`;
  root.appendChild(cover);

  const rep=document.getElementById("rapport-texte");
  const s=document.createElement("section"); s.className="page"; s.innerHTML=rep.innerHTML; root.appendChild(s);
}

async function exportPremiumPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const pages = Array.from(document.querySelectorAll("#pdfDoc .page"));
  const pageWidth = doc.internal.pageSize.getWidth(), pageHeight = doc.internal.pageSize.getHeight();
  for(let i=0;i<pages.length;i++){
    const canvas = await html2canvas(pages[i], {scale:2});
    const img = canvas.toDataURL("image/png");
    const ratio = Math.min(pageWidth/canvas.width, pageHeight/canvas.height);
    const w = canvas.width*ratio, h = canvas.height*ratio;
    doc.addImage(img,"PNG",(pageWidth-w)/2, (pageHeight-h)/2, w, h);
    if(i<pages.length-1) doc.addPage();
  }
  doc.save("Rapport_IPP_Jeunes.pdf");
}
