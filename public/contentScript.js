
/* global chrome */
// chrome.runtime.sendMessage({ action: 'collectImages' }, response => {
  
//   const images = document.querySelectorAll('img');
//   const imageUrls = Array.from(images).map(img => img.src);

//   chrome.runtime.sendMessage({ imageUrls });
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "manipulateDOM":
      // Perform DOM manipulation on the active tab's content
      // For example, change the background color of all paragraphs
      const imgs = document.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.filter = "blur(20px)";
      });
      sendResponse({ success: true });
      break;

    case "mountLoadingDOM":
      let loadingInnerHTML = `
        <div class= "phobia-container">
          <h1 class= "phobia-title">Verificando imagens sensíveis..</h1>
        </div>
        <style>
          .phobia-container {
            min-height: 100vh; 
            min-width: 100vw;
            background: #6C7A89;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            font-family: Arial, Helvetica, sans-serif;
            font-style: normal;
            z-index: 999999999999999999999999;
            position: fixed;
            top: 0;
            left: 0;
          }
          .phobia-title {
            font-size: 32px;
            color: #fff;
            text-align: center
          }
        </style>
      ` 
      // let rawContentBody = document.body.innerHTML;
      // let imgs  = document.body.querySelectorAll('img')
      
      //zera o dom
      console.log("zerando dom");
      let body =  document.body
      if(body){
        console.log("Encontrou body");
      }
      body.innerHTML = loadingInnerHTML
      // const body = document.querySelector('body');
      // body.insertAdjacentHTML('afterbegin', loadingInnerHTML);    
      // body.append('afterbegin', loadingInnerHTML);   
      // Insira o conteúdo no início do <body>
      // body.insertAdjacentHTML('afterbegin', loadingInnerHTML);
      sendResponse({ success: true });
      break;
  
    default:
      break;
  }
});

