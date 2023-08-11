/* global chrome */

let informationControlObject = {
  tabs: {},
  windows: [],
  urls: {}
}
//Listener que funciona quando atualizamos a tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log('Tab Id updated:', tabId);
  // console.log('ChangeInfo updated:', changeInfo,);
  // console.log('Tab updated:', tab);
  if (changeInfo.status === 'complete') {
    // Send a message to the content script to collect images
    console.log(changeInfo);
    
    chrome.tabs.sendMessage(tabId, { action: 'collectImages' });
  } 
  if (changeInfo.url) {
    console.log('URL changed:', changeInfo.url);
    if(!informationControlObject.urls.hasOwnProperty(changeInfo.url)){
      informationControlObject.urls[changeInfo.url] = {active:true, processed: false}
    }
  }
   
});

//Listener que funciona quando clicamos para abrir a tab
chrome.tabs.onActivated.addListener(
  ({tabId, windowId}) => {
    // console.log('Tab ID activated:', tabId);
    // console.log('Window ID activated:', windowId);
    // // chrome.tabs.sendMessage(tabId, { action: 'tabWasRemoved' });
    if(!informationControlObject.tabs.hasOwnProperty(tabId.toString())){
      chrome.tabs.get(tabId, tabInfo => {
          if(tabInfo.status === 'complete'){
            if(tabInfo.url.length){
              let url = tabInfo.url
              informationControlObject.tabs[tabId.toString()] = {active: true, windowId: windowId, url: url}
    
              if(!informationControlObject.windows.includes(windowId)){
                informationControlObject.windows.push(windowId)
              }
              if(!informationControlObject.urls.hasOwnProperty(url)){
                informationControlObject.urls[url] = {active:true, processed: false}
              }
             }
          }
          console.table(informationControlObject.tabs);
          console.table(informationControlObject.urls);
          console.log(informationControlObject.windows);
      })
    }else{

    }
  }
);

//Listener que funciona quando fechamos  a tab
chrome.tabs.onRemoved.addListener(
  (tabId, {isWindowClosing, windowId}) => {
    // console.log('Tab Id  removed:', tabId);
    // console.log('Window Id removed:', windowId);
    // console.log('Window is Closing removed:', isWindowClosing);
    // chrome.tabs.sendMessage(tabId, { action: 'tabWasRemoved' });
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
      console.table(informationControlObject.tabs);
      console.table(informationControlObject.urls);
      console.log(informationControlObject.windows);
    }else{

    }
  }
)


//Listener que funciona quando trocamos de janela
chrome.windows.onFocusChanged.addListener(
  (windowId) =>{
    chrome.tabs.query({windowId: windowId, active:true}, tabs =>{
      let tab = tabs[0]
      if(!informationControlObject.tabs.hasOwnProperty(tab.id.toString())){
            if(tab.status === 'complete'){
              if(tab.url.length){
                let url = tab.url
                informationControlObject.tabs[tab.id.toString()] = {active: true, windowId: windowId, url: url}
      
                if(!informationControlObject.windows.includes(windowId)){
                  informationControlObject.windows.push(windowId)
                }
                if(!informationControlObject.urls.hasOwnProperty(url)){
                  informationControlObject.urls[url] = {active:true, processed: false}
                }
               }
            }
            console.table(informationControlObject.tabs);
            console.table(informationControlObject.urls);
            console.log(informationControlObject.windows);

      }else{
  
      }
    })
  }
)

/* a fazer
1 - verificar a remocao de cada uma delas 
2 - fazer processo de borramento automatica
3 - comecar processo de animacao 
*/