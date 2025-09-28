
// Étoile IPP (canvas) + %
const IPP_COLORS = {
  "Garant":"#1f77b4","Conquérant":"#d62728","Bienveillant":"#2ca02c",
  "Fiable":"#6b21a8","Visionnaire":"#0284c7","Spontané":"#f59e0b"
};
function polar(cx,cy,r,a){return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)};}
function drawRadarStar(ctx, labels, values){
  const W=ctx.canvas.width, H=ctx.canvas.height, cx=W/2, cy=H/2, R=Math.min(W,H)*0.36;
  const N=labels.length, rings=5; ctx.clearRect(0,0,W,H);
  ctx.save(); ctx.translate(0.5,0.5);
  ctx.fillStyle="#fff"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#e5e7eb"; ctx.lineWidth=1;
  for(let k=1;k<=rings;k++){
    ctx.beginPath();
    for(let i=0;i<N;i++){ const a=-Math.PI/2+i*2*Math.PI/N; const p=polar(cx,cy,R*k/rings,a); (i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); }
    ctx.closePath(); ctx.stroke();
  }
  for(let i=0;i<N;i++){ const a=-Math.PI/2+i*2*Math.PI/N; const p=polar(cx,cy,R,a); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(p.x,p.y); ctx.stroke(); }
  ctx.beginPath();
  for(let i=0;i<N;i++){ const a=-Math.PI/2+i*2*Math.PI/N; const r=R*(Math.max(0,Math.min(100,values[i]||0))/100); const p=polar(cx,cy,r,a); (i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); }
  ctx.closePath(); ctx.fillStyle="rgba(31,119,180,0.10)"; ctx.fill(); ctx.strokeStyle="#64748b"; ctx.lineWidth=1.2; ctx.stroke();
  ctx.font="12px system-ui,-apple-system,Segoe UI,Roboto,Arial"; ctx.textAlign="center"; ctx.textBaseline="middle";
  for(let i=0;i<N;i++){
    const a=-Math.PI/2 + i*2*Math.PI/N;
    const r=R*(Math.max(0,Math.min(100,values[i]||0))/100);
    const p=polar(cx,cy,r,a);
    ctx.beginPath(); ctx.fillStyle=IPP_COLORS[labels[i]]||"#334155"; ctx.arc(p.x,p.y,4,0,6.28); ctx.fill();
    const off=polar(p.x,p.y,12,a); ctx.fillStyle="#0f172a"; ctx.fillText((values[i]||0)+"%", off.x, off.y);
  }
  ctx.restore();
}
