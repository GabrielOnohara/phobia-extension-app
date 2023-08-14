/* global chrome */

//variavel de controle de informacao
let informationControlObject = {
  tabs: {},
  windows: [],
  urls: {},
  contentScriptWasSetted: false,
}

//funcao que atualiza as tabs assim que a extensão for instalada
function reloadAllTabs() {
  chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
          chrome.tabs.reload(tab.id);
      });
  });
}

// Chamando a função ao instalar a extensão
chrome.runtime.onInstalled.addListener(function() {
  reloadAllTabs();
});

//funcao que verifica conexao com content script
chrome.runtime.onConnect.addListener(port => {
  if (port.name === "contentScript") {
      port.onMessage.addListener(message => {
          console.log("Mensagem do content script:", message.data);
          port.postMessage({ data: "Resposta do background script" });
      });
      informationControlObject.contentScriptWasSetted = true
  }
});


//Listener que funciona quando atualizamos a tab
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
  console.log("OnUpdated");
  // console.log('Tab Id updated:', tabId);
  // console.log('ChangeInfo updated:', changeInfo,);
  // console.log('Tab updated:', tab);
  
  //verificado mudanca de status da pagina quando ela esta carregando
  if (changeInfo.status === 'loading') {
    console.log("laoding updated status");
    console.log(tab);
    console.log(changeInfo);
    //verifica se o dado de url ja esta presente na variavel de tab
    if(tab.url?.length){
      //verifica se a tab eh nova
      if(!informationControlObject.tabs.hasOwnProperty(tabId.toString())){
        informationControlObject.tabs[tabId.toString()] = {windowId: tab.windowId, url: tab.url, processed: false}
        if(!informationControlObject.windows.includes(tab.windowId)){
          informationControlObject.windows.push(tab.windowId)
        }
        if(!informationControlObject.urls.hasOwnProperty(tab.url)){
          informationControlObject.urls[tab.url] = {active:true, processed: false}
        }
      }   

      //adiciona uma nova url na variavel de controle
      if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
        informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
      }
      //atualiza url da tab
      informationControlObject.tabs[tabId.toString()].url = tab.url
      //sempre que uma tela for atualizada seu status sera reiniciada devido ha uma atualizacao de conteuda da propria tela
      informationControlObject.tabs[tabId.toString()].processed = false
    }

  } else if(changeInfo.status === 'complete') {
    console.log("complete updated status");
    console.log(changeInfo);
    console.log(tab);

    //verifica se o dado de url ja esta presente na variavel de tab
    if(tab.url?.length){
      //adiciona uma nova url na variavel de controle
      if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
        informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
      }
      //atualiza url da tab
      informationControlObject.tabs[tabId.toString()].url = tab.url

      //verifica se a url ja foi processada
      if(informationControlObject.tabs[tabId.toString()]?.url !== undefined && !informationControlObject.tabs[tabId.toString()].processed){
        console.log("tab will be processed")
        //verifica conexao com content script
        if(informationControlObject.contentScriptWasSetted){
          chrome.tabs.sendMessage(tabId, { action: 'mountLoadingDOM' }, response => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }else{
              if (response?.status) {
                console.log('mountLoadingDOM successful');
                informationControlObject.tabs[tabId.toString()].processed = true
              }
            }
          });
        } else {
          console.log('Conexão ainda não foi estabelecida');
        }
        
      }   
    }
  }
  
  if (changeInfo.url) {
    console.log('URL changed:', changeInfo);
    console.log(changeInfo);
    console.log(tab);

    //atualiza url da tab
    informationControlObject.tabs[tabId.toString()].url = changeInfo.url

    //adiciona uma nova url
    if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
      informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
    }
  }
   
    // console.table(informationControlObject.tabs);
    // console.table(informationControlObject.urls);
    // console.log(informationControlObject.windows);
});

// Listener que funciona quando clicamos para abrir a tab
chrome.tabs.onActivated.addListener(
({tabId, windowId})  =>  {
  console.log("OnActivated");
  // console.log('Tab ID activated:', tabId);
  // console.log('Window ID activated:', windowId);

  //procura pela tab por id na atraves da funcao get
  chrome.tabs.get(tabId,  (tabInfo) => {
    //verifica se a tab esta carregada completamente
    if(tabInfo.status === 'complete'){
      //verifica se ha uma url valida
      if(tabInfo.url.length){
        //verifica se a tab eh nova
        if(!informationControlObject.tabs.hasOwnProperty(tabId.toString())){
          let url = tabInfo.url ?? ""
          informationControlObject.tabs[tabId.toString()] = {windowId: windowId, url: url, processed: false}
          if(!informationControlObject.windows.includes(windowId)){
            informationControlObject.windows.push(windowId)
          }
          if(!informationControlObject.urls.hasOwnProperty(url)){
            informationControlObject.urls[url] = {active:true, processed: false}
          }
        }     
        //verifica se a url ja foi processada
        if(informationControlObject.tabs[tabId.toString()]?.url !== undefined && !informationControlObject.tabs[tabId.toString()].processed){
          console.log("tab will be processed")
          //verifica conexao com content script
          if(informationControlObject.contentScriptWasSetted){
            chrome.tabs.sendMessage(tabId, { action: 'mountLoadingDOM' }, response => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
              }else{
                if (response?.status) {
                  console.log('mountLoadingDOM successful');
                  informationControlObject.tabs[tabId.toString()].processed = true
                }
              }
            });
          } else {
            console.log('Conexão ainda não foi estabelecida');
          }
          
        }   
      }
    }
  })  
  
  console.table(informationControlObject.tabs);
  console.table(informationControlObject.urls);
  console.log(informationControlObject.windows);
});

//Listener que funciona quando fechamos  a tab
chrome.tabs.onRemoved.addListener(
  (tabId, {isWindowClosing, windowId}) => {
    console.log("OnRemoved");
    // console.log('Tab Id  removed:', tabId);
    // console.log('Window Id removed:', windowId);
    // console.log('Window is Closing removed:', isWindowClosing);

    if(informationControlObject.tabs.hasOwnProperty(tabId.toString())){

      delete informationControlObject.tabs[tabId.toString()]

      if(isWindowClosing){
        //remove todas as tabs que foram fechadas
        let allTabKeys = Object.keys(informationControlObject.tabs)
        allTabKeys.forEach(tab =>{
          if(tab.windowId === windowId){
            delete informationControlObject.tabs[tabId.toString()]
          }
        })
        const index = informationControlObject.windows.indexOf(windowId)
        informationControlObject.windows.splice(index, 1)
      }

    }else{

    }
    console.table(informationControlObject.tabs);
    console.table(informationControlObject.urls);
    console.log(informationControlObject.windows);
  }
)


// //Listener que funciona quando trocamos de janela
// chrome.windows.onFocusChanged.addListener(
//   (windowId) =>{
//     console.log("Windows Focus Change");
//     chrome.tabs.query({windowId: windowId, active:true}, tabs =>{
//       let tab = tabs[0]
//       console.log("Windows Focus Change Tab");
//       console.log(tab);
//       if(!informationControlObject.tabs.hasOwnProperty(tab.id.toString())){
//             if(tab.status === 'complete'){
//               if(tab.url.length){ 
//                 let url = tab.url
//                 informationControlObject.tabs[tab.id.toString()] = {windowId: windowId, url: url}
      
//                 if(!informationControlObject.windows.includes(windowId)){
//                   informationControlObject.windows.push(windowId)
//                 }
//                 if(!informationControlObject.urls.hasOwnProperty(url)){
//                   informationControlObject.urls[url] = {active:true, processed: false}
//                 }
//                }
//             }


//       }else{
  
//       }

//     })
//     //chrome.windows nao consegue acessar variavel informationControlObject
//     // console.table(informationControlObject.tabs);
//     // console.table(informationControlObject.urls);
//     // console.log(informationControlObject.windows);
//   }
// )

/* a fazer
1 - verificar a remocao de cada uma delas 
2 - fazer processo de borramento automatica
3 - comecar processo de animacao 
*/
