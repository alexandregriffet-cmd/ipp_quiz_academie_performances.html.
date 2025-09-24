const QUESTIONS=[{prompt:"1. Exemple question ?",options:[
{label:"Réponse A",profil:"Garant"},
{label:"Réponse B",profil:"Conquérant"},
{label:"Réponse C",profil:"Bienveillant"},
{label:"Réponse D",profil:"Fiable"},
{label:"Réponse E",profil:"Visionnaire"},
{label:"Réponse F",profil:"Spontané"}]}];
let cur=0,answers=[[]];
document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("startBtn").onclick=()=>renderQ();
});
function renderQ(){
  const q=QUESTIONS[cur]; const quiz=document.getElementById("quiz");
  quiz.innerHTML="<h3>"+q.prompt+"</h3>"+q.options.map((o,i)=>`<div class='option' data-i='${i}'>${o.label}</div>`).join("");
  document.querySelectorAll(".option").forEach(el=>el.onclick=()=>{el.classList.toggle("selected");});
}
