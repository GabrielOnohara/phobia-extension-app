from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2 as cv
from flask_cors import CORS
import json
from PIL import Image
import requests

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
            for url in urls:
                print("VERIFICANDO " + url)
                # max, pois o maior que importa
                score = detect(url)
                if len(score) == 0:
                    score.append(0.0)
                result.append({"url": url, "score": max(score)})
            print("-----RESPOSTA-----")
            print(result)
            print("-----FIM RESPOSTA-----")
            return jsonify(result)
        except Exception as e:
            # Lidar com erros de análise JSON ou outros erros
            return jsonify({"error": str(e)}), 400


@app.route("/test", methods=['POST'])
def test():
    if request.headers['Content-Type'] == 'text/plain':
        try:
            return jsonify({'responde': 'test'})
        except Exception as e:
            # Lidar com erros de análise JSON ou outros erros
            return jsonify({"error": str(e)}), 400
