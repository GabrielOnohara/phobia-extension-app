/* global chrome */

const port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ data: "Mensagem do content script" });

port.onMessage.addListener((response) => {
    console.log("Resposta do background script:", response.data);
});

let lastImagesCount = 0;

function mountLoadingDOM(phobias) {
    try {

        const loadingContainer = document.createElement("div");
        loadingContainer.className = "phobia-container";
        loadingContainer.innerHTML = `
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          <div class="inside-logo">😱</div>
      `;

        document.body.appendChild(loadingContainer);

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
            all: initial;
            position: fixed;
            font-size: 4.5vh;
            right: 4vh;
            bottom: 4.5vh;
          }
        .lds-ring {
            all: initial;
            display: inline-block;
            position: relative;
            width: 20vh;
            height: 20vh;
        }
        .lds-ring div {
            all: initial;
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
            all: initial;
            animation-delay: -0.45s;
        }
        .lds-ring div:nth-child(2) {
            all: initial;
            animation-delay: -0.3s;
        }
        .lds-ring div:nth-child(3) {
            all: initial;
            animation-delay: -0.15s;
        }
        @keyframes lds-ring {
        0% {
            all: initial;
            transform: rotate(0deg);
        }
        100% {
            all: initial;
            transform: rotate(360deg);
        }
        }
      `;
        document.head.appendChild(styleElement);

        const imgs = document.querySelectorAll("img");
        lastImagesCount = imgs.length;

        let imgsData = {
            uniqueImageUrls: [],
            phobias: phobias,
        };
        let imageUrls = [];
        imgs.forEach((img) => {
            img.style.filter = "blur(10px)";
            let src = img.src || img.currentSrc || img.dataset.src
            if (!imageUrls.includes(src)) {
                if (src.substring(0, 5) === "https" || src.substring(0, 5) === "http") {
                    imageUrls.push(src);
                }
            }
        });

        imgsData.uniqueImageUrls = [...new Set(imageUrls)];

        var imgBatches = createImageBatches(imgsData);
        console.log(imgBatches);

        const promises = [];
        imgBatches.forEach((imgBatch) => {
            const promise = postImgs("http://localhost:8080/detect_phobias", imgBatch)
                .then((data) => {
                    let imgsScoresKey = data;

                    if (Array.isArray(imgsScoresKey) && imgsScoresKey.length > 0) {
                        imgsScoresKey.forEach((item) => {

                            var desborrar = true;
                            if (item?.score.aranha >= 0.75 && imgsData.phobias.aracnofobia) {
                                desborrar = false;
                            }
                            if (item?.score.cobra >= 0.55 && imgsData.phobias.ofidiofobia) {
                                desborrar = false;
                            }

                            if (desborrar === true) {
                                imgs.forEach((img) => {
                                    let src = img.src || img.currentSrc || img.dataset.src;
                                    if (src === item?.url) {
                                        console.log("Entrou filtro");
                                        img.style.filter = "initial";
                                    }
                                });
                            }
                        });
                    } else {
                        console.error("Invalid or empty data received");
                    }

                })
                .catch((error) => {
                    console.log("CHAMOU PARA O BATCH: ");
                    console.log(imgBatch);
                    console.log(error);

                });

            promises.push(promise);
        });

        Promise.all(promises)
            .then(() => {
                document.body.removeChild(loadingContainer);
                addingObserver(document.body);
            })
            .catch((error) => {
                console.error("Erro ao aguardar todas as iterações:", error);
                document.body.removeChild(loadingContainer);
                addingObserver(document.body);
            });

        return true;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function addingObserver(htmlBodySelected) {
    try {
        const observer = new MutationObserver((mutationsList, observer) => {
            const imgsObservedCount = document.querySelectorAll("img").length;
            if (lastImagesCount < imgsObservedCount) {
                console.log("Quantidade de fotos alterou");

                //adiciona verificao adicional
                const loadingContainer = document.createElement("div");
                loadingContainer.className = "phobia-container";
                loadingContainer.innerHTML = `
                  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                  <div class="inside-logo">😱</div>
                `;

                document.body.appendChild(loadingContainer);

                const allImgs = document.querySelectorAll("img");
                const imgArray = Array.from(allImgs);
                let newImgs = imgArray.slice(lastImagesCount);
                lastImagesCount = imgsObservedCount;
                let phobias = {
                    aracnofobia: true,
                    ofidiofobia: true,
                };
                chrome.runtime.sendMessage({ verifyPhobiasOnContent: true }, (response) => {
                    if (response.phobias) {
                        phobias = response.phobias;
                    }

                    let imgsData = {
                        uniqueImageUrls: [],
                        phobias: phobias,
                    };
                    let imageUrls = [];
                    newImgs.forEach((img) => {
                        img.style.filter = "blur(10px)";

                        let src = img.src || img.currentSrc || img.dataset.src;
                        if (!imageUrls.includes(src)) {
                            if (src.substring(0, 5) === "https" || src.substring(0, 4) === "http") {
                                imageUrls.push(src);
                            }
                        }
                    });

                    let uniqueImageUrls = [...new Set(imageUrls)];
                    imgsData.uniqueImageUrls = uniqueImageUrls;

                    var imgBatches = createImageBatches(imgsData);

                    const promises = [];
                    imgBatches.forEach((imgBatch) => {
                        const promise = postImgs("http://localhost:8080/detect_phobias", imgBatch)
                            .then((data) => {
                                let imgsScoresKey = data;
                                console.log(imgsScoresKey);
                                if (Array.isArray(imgsScoresKey) && imgsScoresKey.length > 0) {
                                    imgsScoresKey.forEach((item) => {

                                        var desborrar = true;
                                        if (
                                            item?.score.aranha >= 0.75 &&
                                            imgsData.phobias.aracnofobia
                                        ) {
                                            desborrar = false;
                                        }
                                        if (
                                            item?.score.cobra >= 0.55 &&
                                            imgsData.phobias.ofidiofobia
                                        ) {
                                            desborrar = false;
                                        }

                                        if (desborrar === true) {
                                            newImgs.forEach((img) => {
                                                let src =
                                                    img.src || img.currentSrc || img.dataset.src;
                                                if (src === item?.url) {
                                                    console.log("Entrou filtro");
                                                    img.style.filter = "initial";
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    console.error("Invalid or empty data received");
                                }

                            })
                            .catch((error) => {
                                console.log("CHAMOU PARA O BATCH: ");
                                console.log(imgBatch);
                                console.log(error);
                                document.body.removeChild(loadingContainer);
                            });
                        promises.push(promise);
                    });

                    Promise.all(promises)
                        .then(() => {
                            document.body.removeChild(loadingContainer);
                        })
                        .catch((error) => {

                            console.error("Erro ao aguardar todas as iterações:", error);
                            document.body.removeChild(loadingContainer);
                        });
                });
            }
        });
        observer.observe(htmlBodySelected, { childList: true, subtree: true });
    } catch (error) {
        console.log(error);
    }
}

function createImageBatches(data = {}) {
    var imgCounter = 0;
    var batchCounter = 0;
    var imgBatches = [];
    data.uniqueImageUrls.forEach((imageUrl) => {
        if (imgBatches[batchCounter] === undefined) {
            imgBatches.push({ uniqueImageUrls: [], phobias: data.phobias });
        }
        imgBatches[batchCounter]["uniqueImageUrls"].push(imageUrl);

        imgCounter++;
        if (imgCounter >= 10) {
            imgCounter = 0;
            batchCounter++;
        }
    });

    return imgBatches;
}

async function postImgs(url = "", data = {}) {
    // Default options are marked with *
    console.log("Dados no post: ");
    console.log(data);
    try {
        const response = await fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            // credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "text/plain",
                'Access-Control-Allow-Origin': '*'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: "follow", // manual, *follow, error
            // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.log(error);
    } finally {
    }
}

function applyNoFilter() {
    const imgs = document.querySelectorAll("img");
    imgs.forEach((img) => {
        img.style.filter = "initial";
    });
    return true;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "mountLoadingDOM":
            if (message.phobias) {
                if (message.phobias.aracnofobia || message.phobias.ofidiofobia) {
                    if (mountLoadingDOM(message.phobias)) {
                        setTimeout(function () {
                            sendResponse({ status: true });
                        }, 1);
                    } else {
                        setTimeout(function () {
                            sendResponse({ status: false });
                        }, 1);
                    }
                } else {
                    setTimeout(function () {
                        sendResponse({ status: true });
                    }, 1);
                }
            }
            return true;
        case "noFilter":
            if (applyNoFilter()) {
                setTimeout(function () {
                    sendResponse({ status: true });
                }, 1);
            } else {
                setTimeout(function () {
                    sendResponse({ status: false });
                }, 1);
            }
            return true;

        default:
            return true;
    }
});
