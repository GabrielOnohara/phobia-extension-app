from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2 as cv
from flask_cors import CORS
import json
from PIL import Image
import requests
from concurrent.futures import ThreadPoolExecutor
from fake_useragent import UserAgent

app = Flask(__name__)
CORS(app)

model_path = './last3.pt'
# Load a model
model = YOLO(model_path)  # load a custom model

ua = UserAgent()


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


def download_image(url):
    headers = {
        'User-Agent': ua.random}
    try:
        response = requests.get(url, headers=headers, stream=True)
        print("--URL: ", url, " | STATUSCODE: ", response.status_code, "--")
        if response.status_code == 200:
            try:
                im = Image.open(response.raw)
                print("-- 0")
                print("Sucesso")
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
        print("Error:", response.status_code)
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
                    {"url": url, "image_data": result, "score": 0.0})
                # print(finalImageList)

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
            if (len(urls) == 0):
                return jsonify({"error": "lista vazia"}), 200

            imagesBatch = getImages(urls)
            image_data_array = [entry["image_data"] for entry in imagesBatch]

            print("VERIFICANDO")
            # max, pois o maior que importa
            results = model(image_data_array)

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
            for items in imagesBatch:
                del items["image_data"]

            return jsonify(imagesBatch)
        except Exception as e:
            # Lidar com erros de análise JSON ou outros erros
            return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    from waitress import serve
    serve(app, host='0.0.0.0', port=8080)
