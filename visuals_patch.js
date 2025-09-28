
/* visuals_patch.js — IPP (Jeunes/Adultes) — étoile, boussole, pyramide
   Usage: drawRadarStar(ctx, labels[], values[] 0..100)
          drawCompass(ctx, percByProfileObject) // keys: Garant, Conquérant, Bienveillant, Fiable, Visionnaire, Spontané
          drawPyramid(ctx)
*/

const COLORS = {
  "Garant":"#1f77b4",      // bleu
  "Conquérant":"#d62728",  // rouge
  "Bienveillant":"#2ca02c",// vert
  "Fiable":"#6b21a8",      // violet
  "Visionnaire":"#0284c7", // bleu ciel
  "Spontané":"#f59e0b"     // orange
};

function polarToXY(cx, cy, r, angleRad){ return {x: cx + r*Math.cos(angleRad), y: cy + r*Math.sin(angleRad)}; }

function drawRadarStar(ctx, labels, values){
  const W = ctx.canvas.width || 600, H = ctx.canvas.height || 420;
  ctx.clearRect(0,0,W,H);
  const cx = W/2, cy = H/2, R = Math.min(W,H)*0.36;
  const N = labels.length;
  const rings = 5;

  // background
  ctx.save();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,W,H);
  ctx.translate(0.5,0.5);

  // grid rings
  ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
  for(let k=1;k<=rings;k++){
    ctx.beginPath();
    for(let i=0;i<N;i++){
      const a = -Math.PI/2 + i*2*Math.PI/N;
      const p = polarToXY(cx,cy,R*k/rings,a);
      (i===0)?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
    }
    ctx.closePath(); ctx.stroke();
  }
  // axes
  for(let i=0;i<N;i++){
    const a = -Math.PI/2 + i*2*Math.PI/N;
    const p = polarToXY(cx,cy,R,a);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke();
    // tick label
    const lab = labels[i];
    const lp = polarToXY(cx,cy,R+18,a);
    ctx.fillStyle="#0f172a"; ctx.font="12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = (Math.cos(a)>0.3)?"left":(Math.cos(a)<-0.3)?"right":"center";
    ctx.textBaseline = (Math.sin(a)>0.3)?"top":(Math.sin(a)<-0.3)?"bottom":"middle";
    ctx.fillText(lab, lp.x, lp.y);
  }

  // data polygon
  ctx.beginPath();
  for(let i=0;i<N;i++){
    const a = -Math.PI/2 + i*2*Math.PI/N;
    const r = R*(Math.max(0,Math.min(100, values[i]))/100);
    const p = polarToXY(cx,cy,r,a);
    (i===0)?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
  }
  ctx.closePath();
  ctx.fillStyle="rgba(31,119,180,0.10)"; ctx.fill();
  ctx.strokeStyle="#1f2937"; ctx.lineWidth=1.5; ctx.stroke();

  // data points with color per profile index
  for(let i=0;i<N;i++){
    const a = -Math.PI/2 + i*2*Math.PI/N;
    const r = R*(Math.max(0,Math.min(100, values[i]))/100);
    const p = polarToXY(cx,cy,r,a);
    const prof = labels[i];
    const col = COLORS[prof] || "#334155";
    ctx.beginPath(); ctx.fillStyle=col; ctx.arc(p.x,p.y,4,0,2*Math.PI); ctx.fill();

    // value badge
    const off = polarToXY(p.x,p.y,12,a);
    ctx.fillStyle="#0f172a"; ctx.font="11px system-ui, -apple-system"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText((values[i]||0)+"%", off.x, off.y);
  }

  ctx.restore();
}

function drawCompass(ctx, perc){
  const W = ctx.canvas.width || 600, H = ctx.canvas.height || 420;
  ctx.clearRect(0,0,W,H);
  ctx.save(); ctx.fillStyle="#fff"; ctx.fillRect(0,0,W,H);
  const cx=W/2, cy=H/2, R=Math.min(W,H)*0.38;

  // axes & labels
  ctx.strokeStyle="#e2e8f0"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke();
  ctx.fillStyle="#0f172a"; ctx.font="12px system-ui, -apple-system";
  ctx.textAlign="center";
  ctx.fillText("Seul", cx-R-10, cy+4);
  ctx.fillText("Groupe", cx+R+10, cy+4);
  ctx.fillText("Interne", cx, cy-R-10);
  ctx.fillText("Externe", cx, cy+R+18);

  // simple projection: x = (Conquérant + Spontané) - (Garant + Visionnaire)
  //                   y = (Externe ≈ Conquérant + Spontané) vs (Interne ≈ Fiable + Bienveillant + Garant + Visionnaire)
  const get=(k)=>Math.max(0,Math.min(100,(perc[k]||0)));
  const xRaw = (get("Conquérant")+get("Spontané")) - (get("Garant")+get("Visionnaire"));
  const yRaw = (get("Fiable")+get("Bienveillant")+get("Garant")+get("Visionnaire")) - (get("Conquérant")+get("Spontané"));
  const x = Math.max(-100, Math.min(100, xRaw))/100 * (R*0.85);
  const y = Math.max(-100, Math.min(100, yRaw))/100 * (R*0.85);

  // point
  ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx+x, cy-y, 6, 0, 2*Math.PI); ctx.fill();
  ctx.strokeStyle="#2563eb"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx+x, cy-y, 10, 0, 2*Math.PI); ctx.stroke();

  ctx.restore();
}

function drawPyramid(ctx){
  const W = ctx.canvas.width || 600, H = ctx.canvas.height || 420;
  ctx.clearRect(0,0,W,H);
  ctx.save(); ctx.fillStyle="#fff"; ctx.fillRect(0,0,W,H);
  const x=60, y=H-40, w=W-120, h=H-120;
  // three bands
  ctx.fillStyle="#e0f2fe"; ctx.beginPath();
  ctx.moveTo(x+w/2, y-h); ctx.lineTo(x+w*0.75, y-h*0.5); ctx.lineTo(x+w*0.25, y-h*0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#bfdbfe"; ctx.beginPath();
  ctx.moveTo(x+w*0.25, y-h*0.5); ctx.lineTo(x+w*0.75, y-h*0.5); ctx.lineTo(x+w*0.90, y); ctx.lineTo(x+w*0.10, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#93c5fd"; ctx.beginPath();
  ctx.moveTo(x+w*0.10, y); ctx.lineTo(x+w*0.90, y); ctx.lineTo(x+w/2, y+10); ctx.closePath(); ctx.fill();

  // labels
  ctx.fillStyle="#0f172a"; ctx.font="12px system-ui, -apple-system";
  ctx.textAlign="center";
  ctx.fillText("Confort", x+w/2, y-h*0.65);
  ctx.fillText("Défi", x+w/2, y-h*0.20);
  ctx.fillText("Tension", x+w/2, y+20);
  ctx.restore();
}
