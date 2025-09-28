
// Quiz IPP — cores on/questions.json (clé 'questions')
const PROFILES = ['Garant','Conquérant','Bienveillant','Fiable','Visionnaire','Spontané'];
const POINTS   = [6,5,4,3,2,1];
const MIN_PICK = 3;

let QUESTIONS = [];
let current = 0;
let ranking = {}; // { qIndex: ['Garant','Fiable',... ] }
let scores  = Object.fromEntries(PROFILES.map(k=>[k,0]));

async function loadQuestions(){
  const res = await fetch('questions.json', {cache:'no-store'});
  if(!res.ok) throw new Error('questions.json introuvable');
  const raw = await res.json();
  if(!raw || !Array.isArray(raw.questions)) throw new Error("Format invalide : clé racine 'questions' (array) requise.");
  raw.questions.forEach((q,idx)=>{
    if(typeof q.id!=='number' || typeof q.text!=='string' || !Array.isArray(q.options))
      throw new Error(`Q${idx+1}: structure invalide (id:number, text:string, options:array).`);
    if(q.options.length!==6) throw new Error(`Q${idx+1}: il faut 6 options, trouvé ${q.options.length}.`);
    const keys = q.options.map(o=>o.k);
    q.options.forEach((o,i)=>{
      if(!PROFILES.includes(o.k)) throw new Error(`Q${idx+1}/option${i+1}: clé 'k' inconnue: ${o.k}`);
      if(typeof o.label!=='string' || !o.label.trim()) throw new Error(`Q${idx+1}/option${i+1}: 'label' manquant.`);
    });
    const dup = keys.find((k,i)=>keys.indexOf(k)!==i);
    if(dup) throw new Error(`Q${idx+1}: doublon de profil '${dup}' dans options.`);
  });
  QUESTIONS = raw.questions;
}

const $ = s=>document.querySelector(s);
function el(tag, attrs={}, html=''){ const d=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>d.setAttribute(k,v)); d.innerHTML=html; return d; }

function renderQuestion(){
  const host = $('#quiz'); host.innerHTML='';
  const q = QUESTIONS[current];
  if(!q){ return showResults(); }
  const head = el('div',{}, `<h2>${q.text}</h2><p class="prog">Progression : ${current+1}/${QUESTIONS.length}</p>`);
  const grid = el('div',{class:'grid'});
  const selected = ranking[current] ? [...ranking[current]] : [];
  q.options.forEach(opt=>{
    const item = el('div',{class:'opt','data-k':opt.k}, opt.label);
    if(selected.includes(opt.k)) { item.classList.add('selected'); item.appendChild(el('span',{class:'pill'}, String(selected.indexOf(opt.k)+1))); }
    item.addEventListener('click',()=>{
      const idx = selected.indexOf(opt.k);
      if(idx>=0){ selected.splice(idx,1); }
      else { selected.push(opt.k); }
      ranking[current] = selected;
      [...grid.children].forEach(n=>{ n.classList.remove('selected'); n.querySelectorAll('.pill').forEach(p=>p.remove()); });
      selected.forEach((k,i)=>{
        const n = grid.querySelector(`.opt[data-k="${k.replaceAll('"','\\"')}"]`);
        if(n){ n.classList.add('selected'); n.appendChild(el('span',{class:'pill'}, String(i+1))); }
      });
      nextBtn.disabled = (selected.length < MIN_PICK);
    });
    grid.appendChild(item);
  });
  head.appendChild(grid);

  const actions = el('div',{class:'actions'});
  const prevBtn = el('button',{class:'btn'},'Précédent');
  prevBtn.disabled = (current===0);
  prevBtn.onclick = ()=>{ current=Math.max(0,current-1); renderQuestion(); };

  window.nextBtn = el('button',{class:'btn'}, (current===QUESTIONS.length-1 ? 'Terminer' : 'Suivant'));
  nextBtn.disabled = (selected.length < MIN_PICK);
  nextBtn.onclick = ()=>{ current++; renderQuestion(); };

  actions.appendChild(prevBtn); actions.appendChild(nextBtn);
  host.appendChild(head); host.appendChild(actions);
  host.style.display='block';
  $('#welcome').style.display='none';
}

function tally(){
  PROFILES.forEach(k=>scores[k]=0);
  Object.values(ranking).forEach(arr=>{ arr.forEach((k,rankIdx)=>{ scores[k] += (POINTS[rankIdx]||0); }); });
  const max = Math.max(...Object.values(scores),1);
  return Object.fromEntries(PROFILES.map(k=>[k, Math.round((scores[k]/max)*100)]));
}

function showResults(){
  $('#quiz').style.display='none';
  const res = $('#results'); res.style.display='block';
  const perc = tally();
  const ordre = ['Garant','Conquérant','Bienveillant','Fiable','Visionnaire','Spontané'];
  const values = ordre.map(k=>perc[k]||0);
  const ctx = $('#etoile').getContext('2d');
  drawRadarStar(ctx, ordre, values);
  $('#summary').innerHTML = `<p><strong>Tableau des pourcentages</strong></p><ul>${ordre.map(k=>`<li>${k} : ${perc[k]}%</li>`).join('')}</ul>`;
  $('#pdfBtn').onclick = async ()=>{
    const { jsPDF } = window.jspdf;
    const node = document.querySelector('#results');
    const canvas = await html2canvas(node, {scale:2, useCORS:true});
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({unit:'pt', format:'a4'});
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = canvas.height / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageWidth*ratio);
    pdf.save('IPP_Rapport.pdf');
  };
}

document.getElementById('startBtn').addEventListener('click', async ()=>{
  try{ await loadQuestions(); current=0; ranking={}; renderQuestion(); }
  catch(e){ alert('Erreur de chargement des questions : '+e.message); console.error(e); }
});
