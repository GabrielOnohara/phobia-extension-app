/* global chrome */

let informationControlObject = {
  tabs: {},
  windows: [],
  urls: {},
  contentScriptWasSetted: false,
}

let phobias = {
  aracnofobia: true,
  ofidiofobia: true,
};


function reloadAllTabs() {
  chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
          chrome.tabs.reload(tab.id);
      });
  });
}


chrome.runtime.onInstalled.addListener(function() {
  reloadAllTabs();
});

chrome.runtime.onConnect.addListener(port => {
  if (port.name === "contentScript") {
      port.onMessage.addListener(message => {
          console.log("Mensagem do content script:", message.data);
          port.postMessage({ data: "Resposta do background script" });
      });
      informationControlObject.contentScriptWasSetted = true
  }
  if(informationControlObject.contentScriptWasSetted){
    chrome.storage.local.get(['phobias'], function(result) {
      if(result.phobias){
        let chromeStorePhobias = JSON.parse(result.phobias);
        phobias =  chromeStorePhobias
        console.log('Chrome Store Phobias Storage Getted1');
      }else {
        chrome.storage.local.set({ phobias: JSON.stringify(phobias) }, function() {
          console.log('Chrome Store Phobias Storage Setted1');
        });
      }
  
    });
  }
});



chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {

  if (changeInfo.status === 'loading') {

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

      if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
        informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
      }

      informationControlObject.tabs[tabId.toString()].url = tab.url

      informationControlObject.tabs[tabId.toString()].processed = false
    }

  } else if(changeInfo.status === 'complete') {

    if(tab.url?.length){

      if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
        informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
      }

      informationControlObject.tabs[tabId.toString()].url = tab.url

      if(informationControlObject.tabs[tabId.toString()]?.url !== undefined && !informationControlObject.tabs[tabId.toString()].processed){

        if(informationControlObject.contentScriptWasSetted){
          chrome.tabs.sendMessage(tabId, { action: 'mountLoadingDOM', phobias: phobias }, response => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }else{
              if (response?.status) {
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
    informationControlObject.tabs[tabId.toString()].url = changeInfo.url

    if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
      informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
    }
  }
});

chrome.tabs.onActivated.addListener(
({tabId, windowId})  =>  {

  chrome.tabs.get(tabId,  (tabInfo) => {

    if(tabInfo.status === 'complete'){

      if(tabInfo.url.length){

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

        if(informationControlObject.tabs[tabId.toString()]?.url !== undefined && !informationControlObject.tabs[tabId.toString()].processed){

          if(informationControlObject.contentScriptWasSetted){
            chrome.tabs.sendMessage(tabId, { action: 'mountLoadingDOM', phobias: phobias }, response => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
              }else{
                if (response?.status) {
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


chrome.tabs.onRemoved.addListener(
  (tabId, {isWindowClosing, windowId}) => {

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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  if(message.popupOpen) {
    chrome.storage.local.get(['phobias'], function(result) {
      if(result.phobias){
        let chromeStorePhobias = JSON.parse(result.phobias);
        phobias =  chromeStorePhobias
        console.log('Chrome Store Phobias storage Getted2');
        sendResponse({ status: true, phobias: phobias});
      }else {
        chrome.storage.local.set({ phobias: JSON.stringify(phobias) }, function() {
          console.log('Chrome Store Phobias Setted2');
          sendResponse({ status: true, phobias: phobias});
        });
      }
    });

  }
  if(message.verifyPhobiasOnContent){
    sendResponse({ status: true, phobias: phobias});
  }
  if(message.phobiasChange){
    console.log("phobiasChange B");
    try {
      if(message.phobias){
        phobias.aracnofobia = message.phobias.aracnofobia;
        phobias.ofidiofobia = message.phobias.ofidiofobia;
        chrome.storage.local.set({ phobias: JSON.stringify(phobias) }, function() {
          console.log('Chrome Store Phobias Setted3');
        });
        sendResponse({ status: true });
      }
    } catch (error) {
      sendResponse({ status: false });
    }
  }
  return true
});
