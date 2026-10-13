/*
  Ma'lumotlar ombori.
  Server (SQLite) bilan gaplashadi. Login yoqilgan bo'lsa, har so'rovga Firebase tokenini qo'shadi.
  Server javob bermasa, brauzer xotirasiga (localStorage) yozadi. Xotira kaliti foydalanuvchiga bog'liq.
*/
var store=(function(){
  var online=false, uid="local", tokenFn=null, lastStatus=0;
  function ls(key,def){try{return JSON.parse(localStorage.getItem(key+"-"+uid)||"null")||def;}catch(e){return def;}}
  function lsSet(key,val){try{localStorage.setItem(key+"-"+uid,JSON.stringify(val));}catch(e){}}
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
  function fail(){online=false;}
  return {
    isOnline:function(){return online;},
    lastStatus:function(){return lastStatus;},
    setUser:function(id){uid=id||"local";},
    setTokenProvider:function(fn){tokenFn=fn;},
    load:function(){
      return api("GET","/api/state").then(function(s){
        online=true;return {vocab:s.vocab||{},answers:s.answers||{}};
      }).catch(function(){
        online=false;return {vocab:ls("ex21-vocab",{}),answers:ls("ex21-answers",{})};
      });
    },
    saveVocab:function(all,word,tr){
      lsSet("ex21-vocab",all);
      if(online)api("PUT","/api/vocab",{word:word,translation:tr}).catch(fail);
    },
    deleteVocab:function(all,word){
      lsSet("ex21-vocab",all);
      if(online)api("DELETE","/api/vocab/"+encodeURIComponent(word)).catch(fail);
    },
    saveAnswers:function(all){
      lsSet("ex21-answers",all);
      if(online)api("PUT","/api/answers",{answers:all}).catch(fail);
    }
  };
})();
