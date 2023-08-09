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
    // You can call manipulateDOM() here or perform other actions
  }
   
});

//Listener que funciona quando clicamos para abrir a tab
chrome.tabs.onActivated.addListener(
  ({tabId, windowId}) => {
    // console.log('Tab ID activated:', tabId);
    // console.log('Window ID activated:', windowId);
    // // chrome.tabs.sendMessage(tabId, { action: 'tabWasRemoved' });
    if(!informationControlObject.tabs.hasOwnProperty(tabId.toString())){
      informationControlObject.tabs[tabId.toString()] = {active: true}
      if(!informationControlObject.windows.includes(windowId)){
        informationControlObject.windows.push(windowId)
      }
      console.table(informationControlObject.tabs);
      console.table(informationControlObject.urls);
      console.log(informationControlObject.windows);
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