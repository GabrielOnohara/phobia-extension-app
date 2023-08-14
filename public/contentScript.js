
/* global chrome */
// chrome.runtime.sendMessage({ action: 'collectImages' }, response => {
  
//   const images = document.querySelectorAll('img');
//   const imageUrls = Array.from(images).map(img => img.src);

//   chrome.runtime.sendMessage({ imageUrls });
// });
let rawContentBody 

//funcao que verifica conexao
const port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ data: "Mensagem do content script" });

port.onMessage.addListener(response => {
    console.log("Resposta do background script:", response.data);
});

//funcao que ouve as mensagens e aplica a funcao de acordo com seus conteúdos
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "manipulateDOM":

      const rawImgs = document.querySelectorAll('img');
      rawImgs.forEach(img => {
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
      
      //zera o dom e salva dom antigo
      console.log("zerando dom");
      rawContentBody =  document.body.innerHTML
      document.body.innerHTML = loadingInnerHTML

      const imgs = rawContentBody.querySelectorAll('img')
      imgs.forEach(img => {
        img.style.filter = "blur(20px)";
      });
      
      document.body.innerHTML = rawContentBody
      
      sendResponse({ success: true });

      // const body = document.querySelector('body');
      // body.insertAdjacentHTML('afterbegin', loadingInnerHTML);    
      // body.append('afterbegin', loadingInnerHTML);   
      // Insira o conteúdo no início do <body>
      // body.insertAdjacentHTML('afterbegin', loadingInnerHTML);

      break;
  
    default:
      break;
  }
});

