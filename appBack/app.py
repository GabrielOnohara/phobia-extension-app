from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2 as cv
from flask_cors import CORS
import json
from PIL import Image
import requests
from concurrent.futures import ThreadPoolExecutor
from fake_useragent import UserAgent
import torch

app = Flask(__name__)
CORS(app)


# model_path = './spider.pt'
# Load a model
# model = YOLO(model_path)  # load a custom model
# model = YOLO()

# model = torch.load('./spider.pt', './snake.pt')
model1 = YOLO('./spider.pt')
model2 = YOLO('./snake.pt')

ua = UserAgent()


def download_image(url):
    headers = {
        'User-Agent': ua.random}
    try:
        response = requests.get(url, headers=headers, stream=True)
        print("--URL: ", url, " | STATUSCODE: ", response.status_code, "--")
        if response.status_code == 200:
            try:
                im = Image.open(response.raw).convert('RGB')
                print("-- 0")
                print("Sucesso para ", url)
                print("--")
                return im
            except Exception as e:
                print("-- 1")
                print("Error:", e)
                print("Imagem em Branco no lugar de ", url, "--")
                print("--")
                return Image.open("./blank_image.png")
        else:
            print("-- 2")
            print("Response status error:", response.status_code)
            print("Imagem em Branco no lugar de ", url, "--")
            print("--")
            return Image.open("./blank_image.png")
    except Exception as e:
        print("-- 3")
        print("Error:", e)
        print("Imagem em Branco no lugar de ", url, "--")
        print("--")
        return Image.open("./blank_image.png")


def getImages(urls):
    finalImageList = []
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(download_image, url) for url in urls]

        for url, future in zip(urls, futures):
            result = future.result()
            if result:
                finalImageList.append(
                    {"url": url, "image_data": result, "score": {"aranha": 0.0, "cobra": 0.0}})
                # print(finalImageList)

    print(finalImageList)
    return finalImageList


def getMaxScore(det_list, imgs_batch, phobia):
    for i in range(len(det_list)):
        det = det_list[i]
        # print(det.boxes.data.tolist())
        print("---- NOVA IMAGEM ----")
        score_list = []
        if det.boxes.data.tolist():
            for box in det.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = box
                score_list.append(score)
            print(max(score_list, default=0.0))
            imgs_batch[i]["score"].update(
                {phobia: max(score_list, default=0.0)})
        else:
            imgs_batch[i]["score"].update(
                {phobia: -1.0})
            print("Detecção de caixas vazias para a imagem", i)

    return imgs_batch


@app.route("/detect_phobias", methods=['POST'])
def detect_phobias():
    if request.headers['Content-Type'] == 'text/plain':
        try:
            # Obter os dados JSON do corpo da solicitação
            # Converts bytes to json
            data = request.get_data()
            data = data.decode('utf8').strip('\'')
            data = json.loads(data)
            print("-----REQUISICAO-----")
            print(data)
            print("-----FIM REQUISICAO-----")

            # Acessar a lista de URLs
            urls = data.get('uniqueImageUrls', [])
            if (len(urls) == 0):
                return jsonify({"error": "lista vazia"}), 200

            result = []

            imagesBatch = getImages(urls)
            image_data_array = [entry["image_data"] for entry in imagesBatch]

            print("VERIFICANDO")
            # max, pois o maior que importa
            if data["phobias"]["aracnofobia"] == True:
                results = model1(image_data_array)

                imagesBatch = getMaxScore(results, imagesBatch, "aranha")

            if data["phobias"]["ofidiofobia"] == True:
                results2 = model2(image_data_array)

                imagesBatch = getMaxScore(results2, imagesBatch, "cobra")

            """ for i in range(len(results)):
                det = results[i]
                # print(det.boxes.data.tolist())
                print("---- NOVA IMAGEM ----")
                score_list = []
                if det.boxes.data.tolist():
                    for box in det.boxes.data.tolist():
                        x1, y1, x2, y2, score, class_id = box
                        score_list.append(score)
                    print(max(score_list, default=0.0))
                    imagesBatch[i].update(
                        {"score": max(score_list, default=0.0)})
                else:
                    imagesBatch[i].update(
                        {"score": -1.0})
                    print("Detecção de caixas vazias para a imagem", i) """

            print(imagesBatch)
            for items in imagesBatch:
                del items["image_data"]

            return jsonify(imagesBatch)
        except Exception as e:
            # Lidar com erros de análise JSON ou outros erros
            print("------ERRO EX------")
            print(imagesBatch)
            print(str(e))
            return jsonify({"error3": str(e)}), 400


if __name__ == "__main__":
    from waitress import serve
    serve(app, host='0.0.0.0', port=8080)
