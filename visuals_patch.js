
/* IPP visuals patch — étoile lisible, boussole claire, pyramide annotée */
(function(){
  const COLORS = {Garant:"#1f77b4", Conquérant:"#d62728", Bienveillant:"#2ca02c", Fiable:"#6b21a8", Visionnaire:"#0284c7", Spontané:"#f59e0b"};
  function drawRadarStar(ctx, labels, values){
    const w=ctx.canvas.width, h=ctx.canvas.height, cx=w/2, cy=h/2, R=Math.min(w,h)/2-18;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle="#e5e7eb"; ctx.fillStyle="#0f172a"; ctx.font="12px system-ui";
    for(let r=1;r<=4;r++){ctx.beginPath();ctx.arc(cx,cy,R*r/4,0,Math.PI*2);ctx.stroke();}
    const n=labels.length, pts=[];
    for(let i=0;i<n;i++){
      const a=-Math.PI/2 + i*(Math.PI*2)/n;
      const x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke();
      ctx.fillStyle="#475569"; ctx.textAlign = x<cx? "right" : "left";
      ctx.fillText(labels[i], x<cx? x-6: x+6, y);
      const v=(values[i]||0)/100;
      const px=cx + R*v*Math.cos(a), py=cy + R*v*Math.sin(a);
      pts.push([px,py]);
    }
    ctx.beginPath(); for(let i=0;i<n;i++){const p=pts[i]; if(i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]);}
    ctx.closePath(); ctx.fillStyle="rgba(37,99,235,0.12)"; ctx.strokeStyle="#1e293b"; ctx.fill(); ctx.stroke();
    for(let i=0;i<n;i++){
      const p=pts[i]; const color = COLORS[labels[i]] || "#0f172a";
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(p[0],p[1],5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111827"; ctx.font="11px system-ui"; ctx.textAlign="center"; ctx.fillText(String(values[i]||0)+'%', p[0], p[1]-8);
    }
    // Inline legend (right side)
    const lx = w - 130, ly = 18;
    ctx.font="12px system-ui"; ctx.textAlign="left";
    let y=ly; Object.keys(COLORS).forEach((k)=>{ ctx.fillStyle=COLORS[k]; ctx.beginPath(); ctx.arc(lx,y,5,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#0f172a"; ctx.fillText(k, lx+12, y+4); y+=18; });
  }
  function drawCompass(ctx, perc){
    const w=ctx.canvas.width, h=ctx.canvas.height, cx=w/2, cy=h/2;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle="#94a3b8"; ctx.beginPath(); ctx.moveTo(cx,10); ctx.lineTo(cx,h-10); ctx.moveTo(10,cy); ctx.lineTo(w-10,cy); ctx.stroke();
    ctx.fillStyle="#475569"; ctx.font="12px system-ui"; ctx.textAlign="center";
    ctx.fillText("Interne", cx, 22); ctx.fillText("Externe", cx, h-12); ctx.fillText("Seul", 30, cy-6); ctx.fillText("Groupe", w-40, cy-6);
    const V={Garant:{x:-0.2,y:-0.1},Conquérant:{x:0.35,y:0.25},Bienveillant:{x:0.30,y:-0.15},Fiable:{x:0.10,y:-0.30},Visionnaire:{x:-0.35,y:0.20},Spontané:{x:0.25,y:0.35}};
    let sx=0,sy=0,sw=0; Object.keys(perc).forEach(p=>{const v=(perc[p]||0)/100; sx+=V[p].x*v; sy+=V[p].y*v; sw+=v;});
    if(sw>0){sx/=sw; sy/=sw;}
    const px=cx+sx*(w*0.4), py=cy+sy*(h*0.4);
    ctx.fillStyle="#1e293b"; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
    // Small colored ticks
    const labels=["Garant","Conquérant","Bienveillant","Fiable","Visionnaire","Spontané"];
    labels.forEach((p,i)=>{
      const v=(perc[p]||0)/100; const x=cx + V[p].x*(w*0.42), y=cy + V[p].y*(h*0.42);
      ctx.globalAlpha=Math.max(0.18, v*0.85); ctx.fillStyle=COLORS[p]||"#0f172a"; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    });
  }
  function drawPyramid(ctx){
    const w=ctx.canvas.width, h=ctx.canvas.height; ctx.clearRect(0,0,w,h);
    const levels=[{name:"Confort",val:40},{name:"Défi",val:70},{name:"Tension",val:90}];
    const bw=(w-80)/levels.length, base=h-30; ctx.font="12px system-ui"; ctx.textAlign="center";
    levels.forEach((L,i)=>{ const x=40+i*bw+i*20, bh=(h-70)*(L.val/100);
      ctx.fillStyle="rgba(15,23,42,0.18)"; ctx.strokeStyle="#0f172a"; ctx.fillRect(x,base-bh,bw,bh); ctx.strokeRect(x,base-bh,bw,bh);
      ctx.fillStyle="#111827"; ctx.fillText(L.name+" ("+L.val+"%)", x+bw/2, base+14);
    });
    ctx.fillStyle="#475569"; ctx.fillText("Visez surtout « Défi » : assez dur pour progresser, sans fatigue inutile.", w/2, 18);
  }
  window.drawRadarStar = drawRadarStar;
  window.drawCompass = drawCompass;
  window.drawPyramid = drawPyramid;
})();