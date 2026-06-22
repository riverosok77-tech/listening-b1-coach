const lessons = [
  {day:"Lunes", title:"An Interview About Listening Skills", url:"https://learnenglish.britishcouncil.org/free-resources/listening/b1/interview-about-listening-skills", keys:["listening","skills","interview","understand"]},
  {day:"Martes", title:"Chatting About a Series", url:"https://learnenglish.britishcouncil.org/free-resources/listening/b1/chatting-about-series", keys:["series","watch","episode","character"]},
  {day:"Miércoles", title:"A Phone Call from a Customer", url:"https://learnenglish.britishcouncil.org/free-resources/listening/b1/a-phone-call-from-a-customer", keys:["customer","phone","order","problem"]},
  {day:"Jueves", title:"Organising Your Time", url:"https://learnenglishteens.britishcouncil.org/skills/listening/b1-listening/organising-your-time", keys:["time","organise","schedule","plan"]},
  {day:"Viernes", title:"Difficult Situations", url:"https://learnenglishteens.britishcouncil.org/skills/listening/b1-listening/difficult-situations", keys:["situation","problem","advice","difficult"]},
  {day:"Sábado", title:"Biblioteca completa B1", url:"https://learnenglish.britishcouncil.org/free-resources/listening/b1", keys:["listening","practice","b1","audio"]}
];

let state = JSON.parse(localStorage.getItem("lb1_state") || '{"completed":{},"dictations":[],"selected":0,"dark":true}');
if(state.dark) document.body.classList.add("dark");

const save = () => localStorage.setItem("lb1_state", JSON.stringify(state));

function renderLessons(){
  const list = document.getElementById("lessonList");
  list.innerHTML = "";
  lessons.forEach((l,i)=>{
    const done = state.completed[i] ? "Completada ✅" : "Pendiente";
    const card = document.createElement("div");
    card.className = "lesson-card";
    card.innerHTML = `<h3>${l.day}: ${l.title}</h3>
      <p>${done} · Audio oficial British Council</p>
      <div class="actions">
        <button onclick="selectLesson(${i})">Practicar</button>
        <a class="primary" href="${l.url}" target="_blank" rel="noopener">Abrir audio</a>
      </div>`;
    list.appendChild(card);
  });
}

function selectLesson(i){
  state.selected = i; save();
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
  document.querySelector('[data-view="practice"]').classList.add("active");
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  document.getElementById("practice").classList.add("active-view");
  loadPractice();
}

function loadPractice(){
  const l = lessons[state.selected] || lessons[0];
  document.getElementById("practiceTitle").textContent = `${l.day}: ${l.title}`;
  document.getElementById("practiceDesc").textContent = "Abre el audio oficial, completa los pasos y registra tu dictado.";
  document.getElementById("audioLink").href = l.url;
}

function renderProgress(){
  const done = Object.keys(state.completed).length;
  const pct = Math.round((done / lessons.length) * 100);
  document.getElementById("progressPercent").textContent = pct + "%";
  document.querySelector(".ring").style.setProperty("--pct", pct + "%");
  document.getElementById("progressText").textContent = `${done} de ${lessons.length} lecciones completadas`;
  document.getElementById("streakDays").textContent = done;
  const hist = document.getElementById("historyList");
  hist.innerHTML = "";
  (state.dictations || []).slice().reverse().forEach(d=>{
    const li = document.createElement("li");
    li.textContent = `${d.date}: ${d.text}`;
    hist.appendChild(li);
  });
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
    document.getElementById(btn.dataset.view).classList.add("active-view");
    renderProgress();
  });
});

document.getElementById("completeBtn").addEventListener("click",()=>{
  state.completed[state.selected] = true;
  save(); renderLessons(); renderProgress();
  alert("Lección completada. ¡Muy bien!");
});

document.getElementById("saveDictation").addEventListener("click",()=>{
  const text = document.getElementById("dictation").value.trim();
  if(!text){ alert("Escribe primero tu dictado."); return; }
  const l = lessons[state.selected] || lessons[0];
  const lower = text.toLowerCase();
  const hits = l.keys.filter(k=>lower.includes(k)).length;
  state.dictations = state.dictations || [];
  state.dictations.push({date:new Date().toLocaleDateString(), text});
  save();
  document.getElementById("dictationFeedback").textContent =
    `Guardado. Palabras clave detectadas: ${hits}/${l.keys.length}. No busques perfección: repite el audio y mejora una frase.`;
  renderProgress();
});

document.getElementById("clearDictation").addEventListener("click",()=>{
  document.getElementById("dictation").value = "";
  document.getElementById("dictationFeedback").textContent = "";
});

document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("¿Reiniciar todo el progreso?")){
    state.completed = {}; state.dictations = []; save(); renderLessons(); renderProgress();
  }
});

document.getElementById("themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  state.dark = document.body.classList.contains("dark");
  document.getElementById("themeBtn").textContent = state.dark ? "🌙" : "☀️";
  save();
});

let recognition;
document.getElementById("startMic").addEventListener("click",()=>{
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ document.getElementById("speechResult").textContent = "Tu navegador no permite reconocimiento de voz. Prueba con Chrome."; return; }
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.onresult = e => {
    let txt = "";
    for(let i=0;i<e.results.length;i++) txt += e.results[i][0].transcript + " ";
    document.getElementById("speechResult").textContent = txt;
  };
  recognition.onerror = () => document.getElementById("speechResult").textContent = "No se pudo usar el micrófono. Revisa permisos.";
  recognition.start();
});
document.getElementById("stopMic").addEventListener("click",()=>{ if(recognition) recognition.stop(); });

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
renderLessons(); loadPractice(); renderProgress();
