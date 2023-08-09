/* global chrome */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
console.log("Rodando3")
    if (changeInfo.status === 'complete') {
      // Send a message to the content script to collect images
      chrome.tabs.sendMessage(tabId, { action: 'collectImages' });
    }
});


console.log("Rodando4")