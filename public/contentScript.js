
/* global chrome */
// chrome.runtime.sendMessage({ action: 'collectImages' }, response => {
  
//   const images = document.querySelectorAll('img');
//   const imageUrls = Array.from(images).map(img => img.src);

//   chrome.runtime.sendMessage({ imageUrls });
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'manipulateDOM') {
    // Perform DOM manipulation on the active tab's content
    // For example, change the background color of all paragraphs
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.filter = "blur(20px)";
    });

    // Send a response back to the React app
    sendResponse({ success: true });
  }
});

