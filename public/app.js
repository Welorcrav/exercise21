function keyOf(w){return w.toLowerCase().replace(/’/g,"'").replace(/'s$/,"").replace(/'$/,"");}
function sug(k){return SUG[k]||EASY[k]||"";}

var vocab={}, answers={}, shown={}, curKey=null, curEl=null;
function say(m){document.getElementById("status").textContent=m;}
function trOf(k){return vocab[k]||sug(k)||"";}
function persistShown(){store.saveShown(Object.keys(shown));}
function showDb(){
  var el=document.getElementById("db"),m=store.mode();
  el.textContent=m==="firestore"?"Baza: Firebase Firestore":(m==="server"?"Baza: server (SQLite)":"Baza: yo'q (brauzerda saqlanadi)");
  el.className="db "+(m==="local"?"off":"on");
}

/* ---------- sahifani qurish ---------- */
var page=document.getElementById("page");
var bankEl=document.getElementById("bank");
HEADINGS.forEach(function(h){
  var li=document.createElement("li");li.dataset.l=h[0];
  li.innerHTML='<span class="L">'+h[0]+'</span><span class="name">'+h[1]+'<span class="tr">'+h[2]+'</span></span>';
  bankEl.appendChild(li);
});

var qsEl=document.getElementById("qs"),wi=0;
QS.forEach(function(item){
  var box=document.createElement("section");box.className="q";box.id=item.q;
  var head=document.createElement("div");head.className="qhead";
  var tag=document.createElement("span");tag.className="qtag";tag.textContent=item.q;
  var sel=document.createElement("select");sel.id="sel-"+item.q;sel.setAttribute("aria-label",item.q+" sarlavhasi");
  var o0=document.createElement("option");o0.value="";o0.textContent="Sarlavhani tanlang";sel.appendChild(o0);
  HEADINGS.forEach(function(h){var o=document.createElement("option");o.value=h[0];o.textContent=h[0]+") "+h[1];sel.appendChild(o);});
  sel.addEventListener("change",function(){answers[item.q]=sel.value;store.saveAnswers(answers);clearResult(box);syncSelects();});
  var res=document.createElement("div");res.className="res";res.hidden=true;
  head.appendChild(tag);head.appendChild(sel);head.appendChild(res);
  var p=document.createElement("p");p.className="passage";
  item.t.split(/([A-Za-z][A-Za-z'’-]*)/).forEach(function(part,i){
    if(i%2===0){if(part)p.appendChild(document.createTextNode(part));return;}
    var w=document.createElement("span");w.className="w";w.dataset.k=keyOf(part);w.dataset.raw=part;w.dataset.i=String(wi++);
    w.setAttribute("role","button");w.tabIndex=0;
    var t=document.createElement("span");t.className="t";
    var x=document.createElement("span");x.className="x";x.textContent=part;
    w.appendChild(t);w.appendChild(x);p.appendChild(w);
  });
  box.appendChild(head);box.appendChild(p);qsEl.appendChild(box);
});

function refreshWords(){
  document.querySelectorAll(".w").forEach(function(w){
    w.querySelector(".t").textContent=shown[w.dataset.i]?trOf(w.dataset.k):"";
  });
}
function syncSelects(){
  var used={};
  QS.forEach(function(it){var v=answers[it.q];if(v)used[v]=true;});
  QS.forEach(function(it){
    var sel=document.getElementById("sel-"+it.q);
    Array.prototype.forEach.call(sel.options,function(o){o.disabled=!!(o.value&&used[o.value]&&sel.value!==o.value);});
  });
  bankEl.querySelectorAll("li").forEach(function(li){li.classList.toggle("used",!!used[li.dataset.l]);});
}
function applyAnswers(){
  QS.forEach(function(it){document.getElementById("sel-"+it.q).value=answers[it.q]||"";});
  syncSelects();
}
function clearResult(box){box.classList.remove("ok","bad");var r=box.querySelector(".res");r.hidden=true;r.innerHTML="";}

/* ---------- lug'at ro'yxati ---------- */
function setWord(k,v){
  if(v)vocab[k]=v;else delete vocab[k];
  if(v)store.saveVocab(vocab,k,v);else store.deleteVocab(vocab,k);
}
function renderVocab(){
  var ul=document.getElementById("vl");ul.innerHTML="";
  var keys=Object.keys(vocab).sort();
  if(!keys.length){var li=document.createElement("li");li.className="empty";li.style.border="0";li.style.background="none";
    li.textContent="O'zingiz yozgan tarjima hali yo'q.";ul.appendChild(li);return;}
  keys.forEach(function(k){
    var li=document.createElement("li");
    var w=document.createElement("span");w.className="vw";w.textContent=k;
    var inp=document.createElement("input");inp.type="text";inp.value=vocab[k];inp.id="v-"+k;inp.setAttribute("aria-label",k+" tarjimasi");
    inp.addEventListener("change",function(){setWord(k,inp.value.trim());refreshWords();renderVocab();});
    var d=document.createElement("button");d.type="button";d.textContent="×";d.setAttribute("aria-label",k+" ni o'chirish");
    d.addEventListener("click",function(){setWord(k,"");refreshWords();renderVocab();});
    li.appendChild(w);li.appendChild(inp);li.appendChild(d);ul.appendChild(li);
  });
}

/* ---------- so'z oynasi ---------- */
var pop=document.getElementById("pop"),pin=document.getElementById("pin");
var phone=window.matchMedia("(max-width:640px)");
function placeSheet(){
  /* telefonda oyna klaviatura tepasida turadi */
  if(pop.hidden||!phone.matches||!window.visualViewport)return;
  var vv=window.visualViewport;
  var gap=window.innerHeight-vv.height-vv.offsetTop;
  pop.style.bottom=(Math.max(0,gap)+8)+"px";
}
if(window.visualViewport){
  visualViewport.addEventListener("resize",placeSheet);
  visualViewport.addEventListener("scroll",placeSheet);
}
function openPop(el){
  if(curEl)curEl.classList.remove("sel");
  curEl=el;curKey=el.dataset.k;el.classList.add("sel");
  var saved=vocab[curKey],s=sug(curKey);
  if(saved&&s===saved)saved=undefined;
  document.getElementById("pword").textContent=el.dataset.raw;
  document.getElementById("phint").textContent=saved?"saqlangan":(s?"tayyor taklif":"o'zingiz yozing");
  pin.value=saved||s||"";
  pop.hidden=false;
  if(phone.matches){pop.style.left="";pop.style.top="";placeSheet();}
  else{
    var r=el.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;
    var left=Math.max(8,Math.min(r.left,window.innerWidth-pw-8))+window.scrollX;
    var top=r.bottom+6;
    if(top+ph>window.innerHeight-8&&r.top-ph-6>8)top=r.top-ph-6;
    pop.style.left=left+"px";pop.style.top=(top+window.scrollY)+"px";
  }
  pin.focus();pin.select();
}
function closePop(){pop.hidden=true;if(curEl)curEl.classList.remove("sel");curEl=null;curKey=null;}
function commit(){
  if(!curKey)return;
  var v=pin.value.trim(),i=curEl?curEl.dataset.i:null;
  setWord(curKey,v);
  if(v&&i!==null)shown[i]=true;
  refreshWords();renderVocab();persistShown();closePop();
}
document.getElementById("psave").addEventListener("click",commit);
document.getElementById("pdel").addEventListener("click",function(){
  if(curKey){setWord(curKey,"");if(curEl)delete shown[curEl.dataset.i];refreshWords();renderVocab();persistShown();}
  closePop();
});
document.getElementById("pspeak").addEventListener("click",function(){
  try{var u=new SpeechSynthesisUtterance(curEl?curEl.dataset.raw:"");u.lang="en-US";speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
});
pin.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();commit();}else if(e.key==="Escape"){closePop();}});

function activate(w,editT){
  var k=w.dataset.k,i=w.dataset.i;
  if(editT||!trOf(k)){openPop(w);return;}
  closePop();
  if(shown[i])delete shown[i];else shown[i]=true;
  refreshWords();persistShown();
}
qsEl.addEventListener("click",function(e){
  var w=e.target.closest(".w");if(!w)return;e.stopPropagation();
  activate(w,!!e.target.closest(".t"));
});
qsEl.addEventListener("keydown",function(e){
  if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("w")){e.preventDefault();activate(e.target,false);}
});
document.addEventListener("click",function(e){if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest(".w"))closePop();});

/* ---------- tugmalar ---------- */
document.getElementById("showall").addEventListener("click",function(){
  document.querySelectorAll(".w").forEach(function(w){if(SUG[w.dataset.k]||vocab[w.dataset.k])shown[w.dataset.i]=true;});
  refreshWords();persistShown();say("Qiyin so'zlarning tarjimasi ko'rsatildi.");
});
document.getElementById("hideall").addEventListener("click",function(){shown={};refreshWords();persistShown();say("Hamma tarjima yashirildi.");});
document.getElementById("check").addEventListener("click",function(){
  var score=0;
  QS.forEach(function(it){
    var box=document.getElementById(it.q),r=box.querySelector(".res"),a=answers[it.q];
    var right=HEADINGS.filter(function(h){return h[0]===it.ans;})[0];
    box.classList.remove("ok","bad");r.hidden=false;
    if(a===it.ans){score++;box.classList.add("ok");r.innerHTML="To'g'ri"+'<span class="why">'+it.why+"</span>";}
    else{box.classList.add("bad");
      r.innerHTML=(a?"Noto'g'ri. ":"Javob tanlanmagan. ")+"To'g'ri javob: "+right[0]+") "+right[1]+'<span class="why">'+it.why+"</span>";}
  });
  say("Natija: "+score+" / "+QS.length+". G va H ishlatilmaydi.");
});
var rs=document.getElementById("reset"),rsArmed=false,rsTimer=null;
rs.addEventListener("click",function(){
  if(!rsArmed){rsArmed=true;rs.textContent="Aniq tozalansinmi?";rsTimer=setTimeout(function(){rsArmed=false;rs.textContent="Javoblarni tozalash";},3000);return;}
  clearTimeout(rsTimer);rsArmed=false;rs.textContent="Javoblarni tozalash";
  answers={};store.saveAnswers(answers);
  QS.forEach(function(it){clearResult(document.getElementById(it.q));});
  applyAnswers();say("Javoblar tozalandi. Tarjimalaringiz saqlanib qoldi.");
});

/* ---------- ishga tushirish va login ---------- */
var appEl=document.getElementById("app"),loginEl=document.getElementById("login"),userEl=document.getElementById("user");

function loadState(){
  store.load().then(function(s){
    vocab=s.vocab;answers=s.answers;shown={};
    (s.shown||[]).forEach(function(i){shown[i]=true;});
    QS.forEach(function(it){clearResult(document.getElementById(it.q));});
    applyAnswers();refreshWords();renderVocab();showDb();
    if(store.lastError()){
      say("Firestore ulanmadi ("+store.lastError()+"). Database yaratilganini va Rules to'g'riligini tekshiring.");
    }else if(store.mode()==="local"&&store.lastStatus()===401){
      say("Server tokenni qabul qilmadi. FIREBASE_PROJECT_ID to'g'ri berilganini tekshiring.");
    }
  });
}
function showLogin(msg){
  appEl.hidden=true;userEl.hidden=true;loginEl.hidden=false;
  document.getElementById("loginerr").textContent=msg||"";
}
function showApp(user){
  loginEl.hidden=true;appEl.hidden=false;
  if(user){
    userEl.hidden=false;
    document.getElementById("uname").textContent=user.displayName||user.email||"";
    var img=document.getElementById("uimg");
    if(user.photoURL){img.src=user.photoURL;img.hidden=false;}else{img.hidden=true;}
  }
}
function authReady(){
  var c=window.FIREBASE_CONFIG;
  return !!(c&&c.apiKey&&c.apiKey.indexOf("YOUR_")!==0&&window.firebase);
}

if(!authReady()){
  /* login sozlanmagan: sahifa loginsiz ishlaydi */
  showApp(null);loadState();
}else{
  firebase.initializeApp(window.FIREBASE_CONFIG);
  var auth=firebase.auth();
  if(firebase.firestore)store.useFirestore(firebase.firestore());
  store.setTokenProvider(function(){return auth.currentUser?auth.currentUser.getIdToken():null;});
  document.getElementById("signin").addEventListener("click",function(){
    var provider=new firebase.auth.GoogleAuthProvider();
    document.getElementById("loginerr").textContent="";
    auth.signInWithPopup(provider).catch(function(e){
      if(e&&(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment")){
        auth.signInWithRedirect(provider);
      }else if(e&&e.code!=="auth/popup-closed-by-user"&&e.code!=="auth/cancelled-popup-request"){
        document.getElementById("loginerr").textContent="Kirib bo'lmadi: "+(e.code||e.message);
      }
    });
  });
  document.getElementById("logout").addEventListener("click",function(){auth.signOut();});
  auth.getRedirectResult().catch(function(e){
    document.getElementById("loginerr").textContent="Kirib bo'lmadi: "+(e.code||e.message);
  });
  auth.onAuthStateChanged(function(user){
    if(user){store.setUser(user.uid);showApp(user);loadState();}
    else{store.setUser("local");closePop();vocab={};answers={};shown={};showLogin();}
  });
}