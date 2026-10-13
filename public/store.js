/*
  Ma'lumotlar ombori. Uch xil rejim, shu tartibda tanlanadi:
  1. firestore  - Google bilan kirilgan bo'lsa, Firebase Firestore (server kerak emas)
  2. server     - loginsiz ishlaganda, node server.js (SQLite)
  3. local      - hech biri bo'lmasa, brauzer xotirasi (localStorage)
  localStorage har doim zaxira nusxa sifatida yoziladi.
*/
var store=(function(){
  var mode="local", uid="local", tokenFn=null, lastStatus=0, lastError="", fsdb=null;
  function ls(key,def){try{return JSON.parse(localStorage.getItem(key+"-"+uid)||"null")||def;}catch(e){return def;}}
  function lsSet(key,val){try{localStorage.setItem(key+"-"+uid,JSON.stringify(val));}catch(e){}}
  function base(){return fsdb.collection("users").doc(uid);}
  function api(method,url,body){
    return Promise.resolve(tokenFn?tokenFn():null).then(function(token){
      var h={"Content-Type":"application/json"};
      if(token)h.Authorization="Bearer "+token;
      return fetch(url,{method:method,headers:h,body:body?JSON.stringify(body):undefined});
    }).then(function(r){
      lastStatus=r.status;
      if(!r.ok)throw new Error(String(r.status));
      return r.json();
    });
  }
  function fail(e){lastError=(e&&e.code)||(e&&e.message)||"xato";mode="local";}
  function localState(){return {vocab:ls("ex21-vocab",{}),answers:ls("ex21-answers",{})};}
  return {
    mode:function(){return mode;},
    isOnline:function(){return mode!=="local";},
    lastStatus:function(){return lastStatus;},
    lastError:function(){return lastError;},
    setUser:function(id){uid=id||"local";},
    setTokenProvider:function(fn){tokenFn=fn;},
    useFirestore:function(db){fsdb=db;},
    load:function(){
      lastError="";
      if(fsdb){
        return Promise.all([base().collection("vocab").get(),base().collection("meta").doc("answers").get()]).then(function(r){
          var v={};r[0].forEach(function(d){v[d.id]=d.data().translation;});
          mode="firestore";
          return {vocab:v,answers:r[1].exists?r[1].data():{}};
        }).catch(function(e){fail(e);return localState();});
      }
      return api("GET","/api/state").then(function(s){
        mode="server";return {vocab:s.vocab||{},answers:s.answers||{}};
      }).catch(function(){mode="local";return localState();});
    },
    saveVocab:function(all,word,tr){
      lsSet("ex21-vocab",all);
      if(mode==="firestore")base().collection("vocab").doc(word).set({translation:tr}).catch(fail);
      else if(mode==="server")api("PUT","/api/vocab",{word:word,translation:tr}).catch(fail);
    },
    deleteVocab:function(all,word){
      lsSet("ex21-vocab",all);
      if(mode==="firestore")base().collection("vocab").doc(word).delete().catch(fail);
      else if(mode==="server")api("DELETE","/api/vocab/"+encodeURIComponent(word)).catch(fail);
    },
    saveAnswers:function(all){
      lsSet("ex21-answers",all);
      if(mode==="firestore")base().collection("meta").doc("answers").set(all).catch(fail);
      else if(mode==="server")api("PUT","/api/answers",{answers:all}).catch(fail);
    }
  };
})();