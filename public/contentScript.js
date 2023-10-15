/* global chrome */
//Observacao sempre que for necessário responder uma mensagem que não seja assíncrona use o return true

//funcao que verifica conexao
const port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ data: "Mensagem do content script" });

port.onMessage.addListener((response) => {
    console.log("Resposta do background script:", response.data);
});

let lastImagesCount = 0;
let lastImagesCountUnique = 0;
let phobias = {
    aracnofobia: true,
    tripofobia: true,
    coulrofobia: true,
};

function mountLoadingDOM() {
    try {
        // Create and add the warning message container
        const loadingContainer = document.createElement("div");
        loadingContainer.className = "phobia-container";
        loadingContainer.innerHTML = `
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          <div class="inside-logo">😱</div>
      `;

        document.body.appendChild(loadingContainer);

        // Apply the background style
        const styleElement = document.createElement("style");
        styleElement.textContent = `
        .phobia-container {
          min-height: 20vh; 
          min-width: 20vh;
          /* background: #6C7A89; */
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          font-family: Arial, Helvetica, sans-serif;
          font-style: normal;
          z-index: 999999999999999999999999;
          position: fixed;
          right: 0;
          bottom: 0;
        }
        .phobia-title {
          font-size: 32px;
          color: #fff;
          text-align: center
        }
        .inside-logo {
          position: fixed;
          font-size: 4.5vh;
          right: 4vh;
          bottom: 4.5vh;
        }
        .lds-ring {
          display: inline-block;
          position: relative;
          width: 20vh;
          height: 20vh;
        }
        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 10vh;
          height: 10vh;
          margin: 8vh;
          border: 8px solid #e09c2a;
          border-radius: 50%;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #e09c2a transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0.45s;
        }
        .lds-ring div:nth-child(2) {
          animation-delay: -0.3s;
        }
        .lds-ring div:nth-child(3) {
          animation-delay: -0.15s;
        }
        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `;
        document.head.appendChild(styleElement);

        // Apply the blur to the images
        const imgs = document.querySelectorAll("img");
        lastImagesCount = imgs.length;

        let imgsData = {
            uniqueImageUrls: [],
        };
        let imageUrls = [];
        imgs.forEach((img) => {
            // img.style.filter = "blur(20px)";
            // if(!imageUrls.includes(img.src)){

            // }
            if (!imageUrls.includes(img.src)) {
                if (
                    img.src.substring(0, 5) === "https" ||
                    img.src.substring(0, 5) === "http"
                ) {
                    imageUrls.push(img.src);
                }
            }
        });

        imgsData.uniqueImageUrls = [...new Set(imageUrls)];
        lastImagesCountUnique = imgsData.uniqueImageUrls.length;
        postImgs("http://localhost:5000/detect_spider", imgsData)
            .then((data) => {
                let imgsScoresKey = data; // JSON data parsed by `data.json()` call
                imgsScoresKey.forEach((item) => {
                    console.log(item.score);
                    console.log(item.url);
                    if (item?.score >= 0.7) {
                        console.log("Bateu score fst");
                        document.querySelectorAll("img").forEach((img) => {
                            if (img.src === item?.url) {
                                console.log("Entrou filtro");
                                img.style.filter = "blur(6px)";
                            }
                        });
                    }
                });
                // setTimeout(() => {
                //     document.body.removeChild(loadingContainer);
                //     addingObserver(document.body);
                // }, 2000);
                document.body.removeChild(loadingContainer);
                addingObserver(document.body);
            })
            .catch(() => {
                document.body.removeChild(loadingContainer);
                addingObserver(document.body);
            });

        // setTimeout(() => {
        //     document.body.removeChild(loadingContainer);
        //     addingObserver(document.body);
        // }, 2000);
        // Return a function to remove the changes
        return true;
    } catch (error) {
        console.error(error);
        return null;
    }
}

//funcao que adiciona observer
function addingObserver(htmlBodySelected) {
    try {
        const observer = new MutationObserver((mutationsList, observer) => {
            const imgsObservedCount = document.querySelectorAll("img").length;
            if (lastImagesCount < imgsObservedCount) {
                console.log("Quantidade de fotos alterou");
                lastImagesCount = imgsObservedCount;

                //adiciona verificao adicional
                const loadingContainer = document.createElement("div");
                loadingContainer.className = "phobia-container";
                loadingContainer.innerHTML = `
                  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                  <div class="inside-logo">😱</div>
                `;

                document.body.appendChild(loadingContainer);
                // Apply the blur to the images
                const imgs = document.querySelectorAll("img");

                let imgsData = {
                    uniqueImageUrls: [],
                };
                let imageUrls = [];
                imgs.forEach((img) => {
                    // img.style.filter = "blur(20px)";
                    if (!imageUrls.includes(img.src)) {
                        if (
                            img.src.substring(0, 5) === "https" ||
                            img.src.substring(0, 5) === "http"
                        ) {
                            imageUrls.push(img.src);
                        }
                    }
                });

                let uniqueImageUrls = [...new Set(imageUrls)];
                imgsData.uniqueImageUrls = uniqueImageUrls.slice(
                    lastImagesCountUnique
                );
                lastImagesCountUnique = imgsData.uniqueImageUrls.length;
                postImgs("http://localhost:5000/detect_spider", imgsData)
                    .then((data) => {
                        let imgsScoresKey = data; // JSON data parsed by `data.json()` call
                        imgsScoresKey.forEach((item) => {
                            console.log(item.score);
                            console.log(item.url);
                            if (item?.score >= 0.7) {
                                console.log("Bateu score obs");
                                document
                                    .querySelectorAll("img")
                                    .forEach((img) => {
                                        if (img.src === item?.url) {
                                            console.log("Entrou filtro");
                                            img.style.filter = "blur(6px)";
                                        }
                                    });
                            }
                        });
                        // setTimeout(() => {
                        //   document.body.removeChild(loadingContainer);
                        // }, 2000);
                        document.body.removeChild(loadingContainer);
                    })
                    .catch(() => {
                        document.body.removeChild(loadingContainer);
                    });
            }
        });

        observer.observe(htmlBodySelected, { childList: true, subtree: true });
    } catch (error) {
        console.log(error);
    }
}

async function postImgs(url = "", data = {}) {
    console.log("Fazendo requisicao");
    console.log(data);
    console.log(lastImagesCount);

    // Default options are marked with *
    try {
        const response = await fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            // credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "text/plain",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: "follow", // manual, *follow, error
            // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        const json = await response.json();
        console.log(json);
        return json;
    } catch (error) {
        console.log(error);
    } finally {
    }
    /* const json = await response.json();
    console.log(json);
    return json; // parses JSON response into native JavaScript objects */
}

//funcao que ouve as mensagens e aplica a funcao de acordo com seus conteúdos
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "manipulateDOM":
            const rawImgs = document.querySelectorAll("img");
            rawImgs.forEach((img) => {
                img.style.filter = "blur(20px)";
            });
            setTimeout(function () {
                sendResponse({ status: true });
            }, 1);
            return true;

        case "mountLoadingDOM":
            if (mountLoadingDOM()) {
                setTimeout(function () {
                    sendResponse({ status: true });
                }, 1);
            } else {
                setTimeout(function () {
                    sendResponse({ status: false });
                }, 1);
            }
            return true;

        case "phobiaOptionsChanged":
            try {
                phobias = message.phobias;
                setTimeout(function () {
                    sendResponse({ status: true });
                }, 1);
            } catch (error) {
                setTimeout(function () {
                    sendResponse({ status: false });
                }, 1);
            }
            return true;
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
            return true;
    }
});
