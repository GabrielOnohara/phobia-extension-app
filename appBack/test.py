from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2 as cv
from flask_cors import CORS
import json
from PIL import Image
import requests
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

model_path = './last3.pt'
# Load a model
model = YOLO(model_path)  # load a custom model


def detect(src):
    response = requests.get(src, stream=True)
    print(response.status_code)
    if (response.status_code == 200):  # 200 status OK
        try:
            print("---IMAGEM---")
            im = Image.open(response.raw)  # to work with every image format
            print("---FIM IMAGEM---")

            print("---YOLO---")
            results = model(im)[0]
            print("---FIM YOLO---")

            scoreList = []
            for result in results.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = result
                scoreList.append(score)
            return scoreList
        except:
            return [-2.0]
    else:  # caso falhe
        return [-1.0]


'''def getImages(urls):
    finalImageList = []
    for url in urls:
        response = requests.get(url, stream=True)
        print(response.status_code)
        if (response.status_code == 200):  # 200 status OK
            try:
                print("---IMAGEM---")
                # to work with every image format
                im = Image.open(response.raw)
                print("---FIM IMAGEM---")

                finalImageList.append(im)
            except:
                print("An exception occurred")
        else:  # caso falhe
            print("Response status error: " + response.status_code)
    print(finalImageList)
    return finalImageList'''


def download_image(url):
    response = requests.get(url, stream=True)
    print(response.status_code)
    if response.status_code == 200:
        try:
            print("---IMAGEM---")
            im = Image.open(response.raw)
            print("---FIM IMAGEM---")
            return im
        except Exception as e:
            print("An exception occurred:", e)
            response = requests.get(
                "https://img.freepik.com/free-photo/abstract-surface-textures-white-concrete-stone-wall_74190-8189.jpg?size=626&ext=jpg&ga=GA1.1.2116175301.1701302400&semt=ais", stream=True)
            return Image.open(response.raw)
    else:
        print("Response status error:", response.status_code)
    response = requests.get(
        "https://img.freepik.com/free-photo/abstract-surface-textures-white-concrete-stone-wall_74190-8189.jpg?size=626&ext=jpg&ga=GA1.1.2116175301.1701302400&semt=ais", stream=True)
    return Image.open(response.raw)


def getImages(urls):
    finalImageList = []
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(download_image, url) for url in urls]

        for url, future in zip(urls, futures):
            result = future.result()
            if result:
                finalImageList.append(
                    {"url": url, "image_data": result, "score": 0.0})
                print(finalImageList)

    print(finalImageList)
    return finalImageList


@app.route("/detect_spider", methods=['POST'])
def hello_world():
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

            result = []

            imagesBatch = getImages(urls)
            image_data_array = [entry["image_data"] for entry in imagesBatch]

            print("VERIFICANDO")
            # max, pois o maior que importa
            results = model(image_data_array)
            # print(results.boxes.data.tolist())

            '''scoreList = []
            for result in results.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = result
                scoreList.append(score)
                print(score)
            print(scoreList)'''

            i = 0
            for det in results:
                # print(det.boxes.data.tolist())
                print("---- NOVA IMAGEM ----")
                score_list = []
                for det in det.boxes.data.tolist():
                    x1, y1, x2, y2, score, class_id = det
                    score_list.append(score)
                print(max(score_list, default=0.0))
                imagesBatch[i].update({"score": max(score_list, default=0.0)})
                i += 1

            print(imagesBatch)
            '''
            for score in scores:
                if len(score) == 0:
                    score = [0.0]
                result.append({"url": "url", "score": max(score)})

            print("-----RESPOSTA-----")
            print(result)
            print("-----FIM RESPOSTA-----")
            return jsonify(result)'''
            for items in imagesBatch:
                del items["image_data"]

            return jsonify(imagesBatch)
        except Exception as e:
            # Lidar com erros de análise JSON ou outros erros
            return jsonify({"error": str(e)}), 400
