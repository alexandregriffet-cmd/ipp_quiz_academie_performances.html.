
document.addEventListener("DOMContentLoaded", ()=>{
  const start = document.getElementById("startBtn");
  if(start){
    start.addEventListener("click", async (e)=>{
      e.preventDefault();
      try{
        await loadQuestions();
        startQuiz();
      }catch(err){
        console.warn(err);
        // fallback minimal
        startQuiz();
      }
    });
  }else{
    // fallback: attach on any .cta button
    document.querySelectorAll(".cta button").forEach(btn=>btn.addEventListener("click", async()=>{
      await loadQuestions(); startQuiz();
    }));
  }
});

/* IPP – Jeunes (12–25), CTA unique. Robust loader + fallback + caps vécus + PDF cover */
window.addEventListener('error', e=>{ console.warn(e); });

const COLORS = {Garant:"#1f77b4",Conquérant:"#d62728",Bienveillant:"#2ca02c",Fiable:"#800080",Visionnaire:"#87CEEB",Spontané:"#FFA500"};
let QUESTIONS=[], answers=[], current=0;

const Q_FALLBACK = [{"prompt": "Dans un devoir maison à rendre demain, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un exposé à faire en binôme, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une matière que vous n’aimez pas, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un prof exigeant, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une dispute dans le groupe d’amis, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un entraînement sportif important, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une semaine d’exams blancs, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un oral à préparer, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un emploi du temps chargé, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une rumeur sur les réseaux, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un projet de classe à organiser, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une remarque injuste d’un adulte, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une opportunité de concours, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une mauvaise note inattendue, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un retard accumulé, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un voyage scolaire, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un choix d’orientation, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une activité bénévole à lancer, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un rendez-vous chez le CPE, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans le stress avant un contrôle, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans la révision d’un chapitre difficile, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une présentation devant la classe, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un changement d’équipe au sport, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un conflit dans le club, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un manque d’envie de travailler, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une nouvelle appli qui distrait, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une demande d’aide d’un ami, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un défi scolaire intéressant, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans la gestion du temps le soir, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans l’organisation du cartable, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans des notifications qui interrompent, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un prof absent remplaçant inconnu, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans la préparation du bac blanc, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un stage à trouver, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un triplé DS dans la semaine, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un parent qui met la pression, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une opportunité de concours d’éloquence, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un projet créatif perso, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un redoublement à éviter, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un changement d’option, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une idée d’association lycéenne, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un oubli de devoir, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un retard le matin, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un contrôle surprise, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une note injuste selon vous, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un pote mis à l’écart, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un message blessant reçu, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une compétition le week-end, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une audition musicale, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un entretien d’orientation, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une panne de motivation, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un groupe de travail chaotique, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un exercice trop facile, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un partiel blanc, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une nouvelle matière, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une contrainte familiale, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans un manque de sommeil, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans une surcharge d’activités, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}, {"prompt": "Dans le choix Parcoursup, vous faites quoi en premier ?", "weight": 1, "options": [{"label": "Je fais un plan simple et je m’y tiens", "profil": "Garant"}, {"label": "Je me lance vite pour avancer", "profil": "Conquérant"}, {"label": "Je demande un avis et j’apaise l’ambiance", "profil": "Bienveillant"}, {"label": "Je vérifie que ça respecte mes principes", "profil": "Fiable"}, {"label": "Je cherche une autre manière d’y arriver", "profil": "Visionnaire"}, {"label": "Je rends ça plus fun pour me motiver", "profil": "Spontané"}]}];

document.querySelectorAll(".cta button").forEach(btn=>btn.addEventListener("click", async()=>{
  await loadQuestions(); startQuiz();
}));

async function loadQuestions() {
  try{
    const res = await fetch("data/questions_ados.json", {cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    QUESTIONS = await res.json();
  }catch(err){
    console.warn("Chargement via fetch impossible. Fallback intégré utilisé.", err);
    QUESTIONS = Q_FALLBACK;
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
  // ensure answers[current] is an array of ranked indices
  if(!Array.isArray(answers[current])) answers[current] = [];
  const ranked = answers[current]; // e.g., [2,0,5] where index 0 is highest priority? We'll store in order of click: first = priorité 1.
  const rankOf = (idx)=>{
    const pos = ranked.indexOf(idx);
    return pos===-1 ? null : (pos+1);
  };
  qContainer.innerHTML=`
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
      <div class="rank-legend">Cliquez pour classer vos réponses par ordre de priorité (1 = priorité maximale). Cliquez à nouveau pour retirer. Sélection : minimum 3, maximum 6.</div>
      <button class="reset-q">Réinitialiser cette question</button>
    </div>
  `;

  // interactions
  qContainer.querySelectorAll(".answers .option").forEach(optEl=>{
    optEl.addEventListener("click", ()=>{
      const idx = +optEl.dataset.i;
      const pos = ranked.indexOf(idx);
      if(pos===-1){
        if(ranked.length<6){
          ranked.push(idx);
        }
      }else{
        ranked.splice(pos,1);
      }
      renderQuestion();
    });
  });
  qContainer.querySelector(".reset-q").addEventListener("click", ()=>{
    answers[current] = [];
    renderQuestion();
  });

  el("#prev").disabled = current===0;
  el("#next").classList.toggle("hidden", current===QUESTIONS.length-1);
  el("#finish").classList.toggle("hidden", current!==QUESTIONS.length-1);
  // disable next/finish if no selection
  const hasSel = (answers[current] && answers[current].length>=3);
  el("#next").disabled = !hasSel;
  el("#finish").disabled = !hasSel;
  el("#progress").textContent = `Progression : ${current+1}/${QUESTIONS.length} — choix : ${answers[current].length}`;
}

    </div></div>`;
  qContainer.querySelectorAll(".answers button").forEach(b=>b.addEventListener("click",()=>{answers[current]=+b.dataset.i;renderQuestion();}));
  el("#prev").disabled = current===0;
  el("#next").classList.toggle("hidden",current===QUESTIONS.length-1);
  el("#finish").classList.toggle("hidden",current!==QUESTIONS.length-1);
  el("#progress").textContent=`Progression : ${current+1}/${QUESTIONS.length}`;
}


async function finish(){
  const scores={Garant:0,Conquérant:0,Bienveillant:0,Fiable:0,Visionnaire:0,Spontané:0};
  // pondération par rang : 1er=6, 2e=5, 3e=4, 4e=3, 5e=2, 6e=1
  const RANK_WEIGHTS = [6,5,4,3,2,1];
  QUESTIONS.forEach((q,i)=>{
    const ranked = Array.isArray(answers[i]) ? answers[i] : [];
    ranked.forEach((optIndex, rpos)=>{
      const prof = q.options[optIndex].profil;
      const w = RANK_WEIGHTS[rpos] || 0;
      scores[prof] += (q.weight||1) * w;
    });
  });
  const total=Object.values(scores).reduce((a,b)=>a+b,0)||1;
  const perc={}; Object.keys(scores).forEach(k=>perc[k]=Math.round(scores[k]/total*100));
  const sorted=Object.entries(perc).sort((a,b)=>b[1]-a[1]);
  const ADN=sorted[0][0], CAP=sorted[1][0], capsVecus=sorted.slice(2,4).map(x=>x[0]);
  const percVisu={...perc}; percVisu[ADN]=100;

  el("#questionnaire").classList.add("hidden"); el("#rapport").classList.remove("hidden");
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
  el("#summary").innerHTML=`<div class="badge">${dot(COLORS[ADN])} <strong>ADN</strong> : ${ADN} ❤️</div>
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
  el("#synthese").innerHTML=`<h3>Synthèse chifrée</h3><table><thead><tr><th>Profil</th><th>Énergie</th><th>Repère</th></tr></thead><tbody>${rows}</tbody></table>`;
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
  const container=el("#rapport-texte");
  let html=`<h3>Message de bienvenue</h3><p>${R.bienvenue}</p>`;
  R.sections.forEach(s=>{ html+=`<h3>${s.titre}</h3>`; if(Array.isArray(s.points)){html+="<ul>"+s.points.map(p=>`<li>${p}</li>`).join("")+"</ul>";} else if(s.texte){html+=`<p>${s.texte}</p>`;} });
  container.innerHTML=html;

  // Build PDF doc (cover + pages) and hook export
  await buildPremiumPdfDoc(ADN,CAP,{},R);
  el("#downloadPdf").onclick = exportPremiumPDF;
  el("#restart").onclick = ()=>location.reload();
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
