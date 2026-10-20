/*
  Ma'lumotlar ombori. Uch xil rejim, shu tartibda tanlanadi:
  1. firestore  - Google bilan kirilgan bo'lsa, Firebase Firestore (server kerak emas)
  2. server     - loginsiz ishlaganda, node server.js (SQLite)
  3. local      - hech biri bo'lmasa, brauzer xotirasi (localStorage)
  localStorage har doim zaxira nusxa sifatida yoziladi.
*/
var store=(function(){
  var mode="local", uid="local", tokenFn=null, lastStatus=0, lastError="", fsdb=null, srvAll={};
  function sfx(ex){return ex==="21"?"":"_"+ex;}          /* Firestore hujjat nomi: answers, answers_28 */
  function lk(name,ex){return "ex"+ex+"-"+name;}          /* localStorage kaliti: ex21-answers, ex28-answers */
  function pre(ex){return ex==="21"?"":ex+":";}            /* server kaliti: Q1 yoki 28:Q1 */
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
  function localState(ex){return {vocab:ls("ex21-vocab",{}),answers:ls(lk("answers",ex),{}),shown:ls(lk("shown",ex),[])};}
  return {
    mode:function(){return mode;},
    isOnline:function(){return mode!=="local";},
    lastStatus:function(){return lastStatus;},
    lastError:function(){return lastError;},
    setUser:function(id){uid=id||"local";},
    setTokenProvider:function(fn){tokenFn=fn;},
    useFirestore:function(db){fsdb=db;},
    load:function(ex){
      ex=String(ex||"21");lastError="";
      if(fsdb){
        return Promise.all([base().collection("vocab").get(),base().collection("meta").doc("answers"+sfx(ex)).get(),base().collection("meta").doc("shown"+sfx(ex)).get()]).then(function(r){
          var v={};r[0].forEach(function(d){v[d.id]=d.data().translation;});
          mode="firestore";
          var sh=r[2].exists&&Array.isArray(r[2].data().list)?r[2].data().list:[];
          return {vocab:v,answers:r[1].exists?r[1].data():{},shown:sh};
        }).catch(function(e){fail(e);return localState(ex);});
      }
      return api("GET","/api/state").then(function(s){
        mode="server";srvAll=s.answers||{};
        var p=pre(ex),mine={};
        Object.keys(srvAll).forEach(function(k){
          if(p){if(k.indexOf(p)===0)mine[k.slice(p.length)]=srvAll[k];}
          else if(/^Q\d+$/.test(k))mine[k]=srvAll[k];
        });
        return {vocab:s.vocab||{},answers:mine,shown:ls(lk("shown",ex),[])};
      }).catch(function(){mode="local";return localState(ex);});
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
    saveShown:function(ex,list){
      ex=String(ex);lsSet(lk("shown",ex),list);
      if(mode==="firestore")base().collection("meta").doc("shown"+sfx(ex)).set({list:list}).catch(fail);
    },
    saveAnswers:function(ex,all){
      ex=String(ex);lsSet(lk("answers",ex),all);
      if(mode==="firestore")base().collection("meta").doc("answers"+sfx(ex)).set(all).catch(fail);
      else if(mode==="server"){
        var p=pre(ex);
        Object.keys(srvAll).forEach(function(k){var mine=p?k.indexOf(p)===0:/^Q\d+$/.test(k);if(mine)delete srvAll[k];});
        Object.keys(all).forEach(function(q){if(all[q])srvAll[p+q]=all[q];});
        api("PUT","/api/answers",{answers:srvAll}).catch(fail);
      }
    }
  };
})();
