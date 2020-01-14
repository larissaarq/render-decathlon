// Habilite essa função se você estiver em modo de produção dessa loja
var devMode = false;

if(!devMode){

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("/files/service-worker.js", { "scope": "/" }).then(function() {   

            console.log("Service Worker registered successfully.");

        }).catch(function(error) { 

            console.error("Service Worker registration failed:", error);  

        });    

    }

 }