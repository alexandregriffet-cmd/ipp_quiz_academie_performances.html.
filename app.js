const COLORS={Garant:"#1f77b4",Conquérant:"#d62728",Bienveillant:"#2ca02c",Fiable:"#800080",Visionnaire:"#87CEEB",Spontané:"#FFA500"};
let QUESTIONS=[],answers=[],current=0,REPORT={};

const $=s=>document.querySelector(s);

document.getElementById('startBtn').addEventListener('click', async ()=>{
  await loadQuestions(); startQuiz();
});

async function loadQuestions(){
  const res = await fetch(`data/questions_ados.json?v=${window.__V__}`,{cache:"no-store"});
  if(!res.ok){ throw new Error("questions_ados.json introuvable"); }
  QUESTIONS = await res.json();
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
  <div class="answers">${q.options.map((o,i)=>`
    <div class="option ${rankOf(i)?'selected':''}" data-i="${i}">${o.label}
      ${rankOf(i)?`<span class='rank-badge'>${rankOf(i)}</span>`:''}
    </div>`).join('')}</div>
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
  const scores={Garant:0,Conquérant:0,Bienveillant:0,Fiable:0,Visionnaire:0,Spontané:0};
  QUESTIONS.forEach((q,qi)=>{
    const ranked = answers[qi]||[];
    ranked.forEach((opt,idx)=>{
      const profil = q.options[opt].profil;
      scores[profil]+= (q.weight||1)*(weights[idx]||0);
    });
  });
  const total = Object.values(scores).reduce((a,b)=>a+b,0)||1;
  const perc={}; Object.keys(scores).forEach(k=>perc[k]=Math.round(scores[k]/total*100));
  const sorted=Object.entries(perc).sort((a,b)=>b[1]-a[1]);
  REPORT={ADN:sorted[0][0], CAP:sorted[1][0], perc, capsVecus:sorted.slice(2,4).map(x=>x[0])};
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
    <span class="badge">${dot(COLORS[CAP])}<b>Cap</b> : ${CAP} ⭐</span>
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
  draw(...pos[CAP], "#111", "⭐ "+CAP);
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
  const R = all[`${ADN}|${CAP}`];
  let html = `<h3>Message de bienvenue</h3><p>${R.bienvenue}</p>`;
  R.sections.forEach(s=>{
    if(s.points){ html += `<h3>${s.titre}</h3><ul>${s.points.map(p=>`<li>${p}</li>`).join('')}</ul>`; }
    else { html += `<h3>${s.titre}</h3><p>${s.texte}</p>`; }
  });
  document.getElementById("rapportTexte").innerHTML = html;
}

async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const blocks = Array.from(document.querySelectorAll(".like-a4"));
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  for(let i=0;i<blocks.length;i++){
    const canvas = await html2canvas(blocks[i], {scale:2, useCORS:true});
    const img = canvas.toDataURL("image/png");
    const ratio = Math.min(W/canvas.width, H/canvas.height);
    const w = canvas.width*ratio, h = canvas.height*ratio;
    doc.addImage(img,"PNG",(W-w)/2,(H-h)/2,w,h);
    if(i<blocks.length-1) doc.addPage();
  }
  doc.save("Rapport_IPP_Jeunes.pdf");
}
