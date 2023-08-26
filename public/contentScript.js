
/* global chrome */
//Observacao sempre que for necessário responder uma mensagem que não seja assíncrona use o return true

//funcao que verifica conexao
const port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ data: "Mensagem do content script" });

port.onMessage.addListener(response => {
    console.log("Resposta do background script:", response.data);
});

let lastImagesCount = 0;

function mountLoadingDOM() {
  try {
      // Create and add the warning message container
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'phobia-container';
      loadingContainer.innerHTML = `
          <h1 class="phobia-title">Verificando imagens sensíveis..</h1>
      `;

      document.body.appendChild(loadingContainer);

      // Apply the background style
      const styleElement = document.createElement('style');
      styleElement.textContent = `
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
      `;
      document.head.appendChild(styleElement);

      // Apply the blur to the images
      const imgs = document.querySelectorAll('img');
      lastImagesCount = imgs.length;
      imgs.forEach(img => {
          img.style.filter = "blur(20px)";
      });
      setTimeout(()=> {
        document.body.removeChild(loadingContainer);
        addingObserver(document.body)
      }, 2000)
      // Return a function to remove the changes
      return true
  } catch (error) {
      console.error(error);
      return null;
  }
}

function addingObserver(htmlBodySelected){
  try {
    const observer = new MutationObserver((mutationsList, observer) => {
      const imgsObservedCount = document.querySelectorAll('img').length;
      if(lastImagesCount !== imgsObservedCount){
        console.log("Quantidade de fotos alterou");
        lastImagesCount = imgsObservedCount

        //adiciona verificao adicional
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'phobia-container';
        loadingContainer.innerHTML = `
            <h1 class="phobia-title">Dectectamos novas imagens não processadas..</h1>
        `;
  
        document.body.appendChild(loadingContainer);
        // Apply the blur to the images
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
            img.style.filter = "blur(20px)";
        });
        setTimeout(()=> {
          document.body.removeChild(loadingContainer);
        }, 2000)
      }
    });
  
    observer.observe(htmlBodySelected, { childList: true, subtree: true });
  } catch (error) {
    console.log(error);
  }
}

//funcao que ouve as mensagens e aplica a funcao de acordo com seus conteúdos
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "manipulateDOM":

      const rawImgs = document.querySelectorAll('img');
      rawImgs.forEach(img => {
        img.style.filter = "blur(20px)";
      });
      setTimeout(function() {
        sendResponse({status: true}); 
      }, 1);
      return true  

    case "mountLoadingDOM":
      if(mountLoadingDOM()){
        setTimeout(function() {
          sendResponse({status: true}); 
        }, 1);
      }else{
        setTimeout(function() {
          sendResponse({status: false});
        }, 1);
      }
      return true  
    
    // case "addingObserver":
    //   if(addingObserver()){
    //     setTimeout(function() {
    //       sendResponse({status: true}); 
    //     }, 1);
    //   }else{
    //     setTimeout(function() {
    //       sendResponse({status: false});
    //     }, 1);
    //   }
    //   return true
    default:
      return true
  }
});

