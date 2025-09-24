const COLORS={Garant:"#1f77b4",Conquérant:"#d62728",Bienveillant:"#2ca02c",Fiable:"#6b21a8",Visionnaire:"#0284c7",Spontané:"#f59e0b"};
let QUESTIONS=[],answers=[],current=0,REPORTS={};
const $=s=>document.querySelector(s);

async function boot(){
  // load data
  const q = await fetch('data/questions_ados.json',{cache:'no-store'}); QUESTIONS = await q.json();
  answers = new Array(QUESTIONS.length).fill(null);
  const files=[1,2,3,4,5,6].map(i=>`data/rapports_ipp_bloc${i}.json`);
  REPORTS={};
  for(const f of files){ try{ const r=await fetch(f,{cache:'no-store'}); if(r.ok){ Object.assign(REPORTS, await r.json()); } }catch(e){} }
}

document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.getElementById('startBtn');
  btn.addEventListener('click', async ()=>{ await boot(); document.getElementById('app').classList.remove('hidden'); renderQ(); });
  document.addEventListener('click',(ev)=>{
    if(ev.target && ev.target.id==='pdf'){ exportPdf(); }
  });
});

function renderQ(){
  const q=QUESTIONS[current]; if(!answers[current]) answers[current]=[];
  const ranked=answers[current];
  const rankOf=i=>{const p=ranked.indexOf(i);return p===-1?null:p+1;}
  const optsHtml=q.options.map((o,i)=>`<div class="option ${rankOf(i)?'selected':''}" data-i="${i}">${o.label}${rankOf(i)?`<span class='rank-badge'>${rankOf(i)}</span>`:''}</div>`).join('');
  const nav=`<div class="nav"><button id="prev" ${current===0?'disabled':''}>Précédent</button>
             <button id="next" ${(ranked.length<3 || current===QUESTIONS.length-1)?'disabled':''}>Suivant</button>
             <button id="finish" class="primary" ${(ranked.length<3 || current!==QUESTIONS.length-1)?'disabled':''}>Terminer</button></div>`;
  $("#quiz").innerHTML=`<h3>${q.prompt}</h3><div class="answers">${optsHtml}</div><p>Classez 3 à 6 réponses (clic pour sélectionner / désélectionner).</p>${nav}<div>Progression : ${current+1}/${QUESTIONS.length} • Choix : ${ranked.length}</div>`;
  $("#quiz").querySelectorAll(".option").forEach(op=>op.addEventListener("click",()=>{
    const i=+op.dataset.i; const p=ranked.indexOf(i);
    if(p===-1){ if(ranked.length<6) ranked.push(i);} else { ranked.splice(p,1); }
    renderQ();
  }));
  $('#prev').onclick=()=>{ if(current>0){current--; renderQ();} };
  $('#next').onclick=()=>{ if(current<QUESTIONS.length-1 && ranked.length>=3){current++; renderQ();} };
  $('#finish').onclick=()=>{ if(ranked.length>=3){ const r=compute(); renderReport(r);} };
}

function compute(){
  const weights=[6,5,4,3,2,1];
  const P=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const score=Object.fromEntries(P.map(p=>[p,0]));
  const rank1=Object.fromEntries(P.map(p=>[p,0])); const top2=Object.fromEntries(P.map(p=>[p,0]));
  const Q=QUESTIONS.length;
  QUESTIONS.forEach((q,qi)=>{
    const ranked=answers[qi]||[];
    ranked.forEach((opt,idx)=>{
      const p=q.options[opt].profil;
      score[p]+=(q.weight||1)*(weights[idx]||0);
      if(idx===0) rank1[p]+=1; if(idx<=1) top2[p]+=1;
    });
  });
  const ADN = Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0];
  const startIdx = Math.max(0, Q - Math.max(20, Math.floor(Q/3)));
  const winScore=Object.fromEntries(P.map(p=>[p,0])); const winTop2=Object.fromEntries(P.map(p=>[p,0])); const winLen=Q-startIdx;
  for(let qi=startIdx; qi<Q; qi++){
    const ranked=answers[qi]||[];
    ranked.forEach((opt,idx)=>{
      const p=QUESTIONS[qi].options[opt].profil;
      winScore[p]+= (QUESTIONS[qi].weight||1)*(weights[idx]||0);
      if(idx<=1) winTop2[p]+=1;
    });
  }
  let capCandidates=P.filter(p=>p!==ADN).map(p=>[p,winScore[p]]).sort((a,b)=>b[1]-a[1]);
  let CAP=null;
  if(capCandidates.length){
    const [p1,v1]=capCandidates[0]; const v2=capCandidates[1]?.[1]??0;
    const condTop2=(winTop2[p1]/Math.max(1,winLen))>=0.30;
    const condDelta=(v2===0)?true:((v1-v2)/Math.max(1,v2)>=0.05);
    if(condTop2 && v1>0) CAP=p1;
  }
  const lived=P.filter(p=>p!==ADN && p!==CAP).map(p=>{
    const s=top2[p]/Q; const e=rank1[p]/Q;
    const meanProxy=(Q-top2[p])/(Q||1)*3;
    const stable=meanProxy<=2.8;
    const ok=(s>=0.35 || e>=0.15)&&stable;
    return {p,ok,raw:score[p]};
  }).filter(x=>x.ok).sort((a,b)=>b.raw-a.raw).map(x=>x.p).slice(0,2);
  const ADNraw=Math.max(score[ADN],1);
  const perc=Object.fromEntries(P.map(p=>[p,Math.round((score[p]/ADNraw)*80)]));
  perc[ADN]=100; lived.forEach(p=>perc[p]=100); if(CAP){ perc[CAP]=Math.max(60, Math.min(95, perc[CAP])); }
  P.forEach(p=>{ if(p!==ADN && p!==CAP && !lived.includes(p)){ perc[p]=Math.min((CAP?perc[CAP]-1:95), perc[p]); } perc[p]=Math.max(0,Math.min(100,perc[p])); });
  return {ADN,CAP,lived,perc,score};
}

function star(id, perc){
  const labels=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
  const data=labels.map(l=>perc[l]||0);
  const ctx=document.querySelector(id).getContext('2d');
  return new Chart(ctx,{type:'radar',data:{labels,datasets:[{label:'Énergie',data,borderWidth:2,pointRadius:3}]},
    options:{plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{stepSize:20}}}}});
}
function boussole(id, perc){
  const ctx=document.querySelector(id).getContext('2d');
  const labels=["Structuré","Action","Relation","Valeurs","Introspection","Spontanéité"];
  const map={"Structuré":"Garant","Action":"Conquérant","Relation":"Bienveillant","Valeurs":"Fiable","Introspection":"Visionnaire","Spontanéité":"Spontané"};
  const data=labels.map(l=>perc[map[l]]||0);
  return new Chart(ctx,{type:'radar',data:{labels,datasets:[{data,borderWidth:2}]},
    options:{plugins:{legend:{display:false}},scales:{r:{min:0,max:100}}}});
}
function pyramide(id){
  const ctx=document.querySelector(id).getContext('2d');
  const labels=["Niv 1","Niv 2","Niv 3"]; const vals=[30,60,100];
  return new Chart(ctx,{type:'bar',data:{labels,datasets:[{data:vals}]},options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:100}}}});
}

function renderReport(r){
  document.getElementById('report').classList.remove('hidden');
  const tbody=document.querySelector("#resultTable tbody"); tbody.innerHTML="";
  ["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"].forEach(p=>{
    const tr=document.createElement('tr');
    const rep=(p===r.ADN?"❤️":(p===r.CAP?"⭐":(r.lived.includes(p)?"⚪":"")));
    tr.innerHTML=`<td>${p}</td><td>${r.perc[p]}%</td><td>${rep}</td>`; tbody.appendChild(tr);
  });
  star("#etoile",r.perc); boussole("#boussole",r.perc); pyramide("#pyramide");
  const key=`${r.ADN}|${r.CAP||r.ADN}`; const rep=REPORTS[key]||REPORTS[`${r.ADN}|${r.ADN}`];
  document.getElementById('welcome').innerHTML = `<h3>Bienvenue</h3><p>${rep?.bienvenue||"Votre rapport personnalisé."}</p>`;
  const box=document.getElementById('sections'); box.innerHTML="";
  (rep?.sections||[]).forEach(sec=>{
    const s=document.createElement('section');
    s.innerHTML=`<h3>${sec.titre||""}</h3>` + (sec.texte?`<p>${sec.texte}</p>`:"") + (sec.points?("<ul>"+sec.points.map(x=>`<li>${x}</li>`).join("")+"</ul>"):"");
    box.appendChild(s);
  });
}

async function exportPdf(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt',format:'a4'});
  const pages=[document.getElementById('pg1'), document.getElementById('pg1').nextElementSibling, document.getElementById('pgNarratif')];
  for(let i=0;i<pages.length;i++){
    const el=pages[i]; const cv=await html2canvas(el,{scale:2}); const img=cv.toDataURL('image/png');
    const w=doc.internal.pageSize.getWidth(); const h=w*cv.height/cv.width;
    if(i>0) doc.addPage(); doc.addImage(img,'PNG',20,20,w-40,h-40);
  }
  doc.save('IPP_rapport.pdf');
}