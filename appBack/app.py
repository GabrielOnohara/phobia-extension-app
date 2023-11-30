from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from PIL import Image
from ultralytics import YOLO
import requests

app = Flask(__name__)
CORS(app)

model_path = './last3.pt'
model = YOLO(model_path)

def detect(src):
    response = requests.get(src, stream=True)
    print(response.status_code)
    if response.status_code == 200:
        try:
            print("---IMAGEM---")
            im = Image.open(response.raw)
            print("---FIM IMAGEM---")

            print("---YOLO---")
            results = model(im)[0]
            print("---FIM YOLO---")

            scoreList = [result[4] for result in results.boxes.data.tolist()] or [0.0]
            return max(scoreList)
        except Exception as e:
            print("Error processing image:", e)
            return 0.0
    else:
        return 0.0

@app.route("/detect_spider", methods=['POST'])
def detect_spider():
    if request.headers['Content-Type'] == 'text/plain':
        try:
            data = json.loads(request.get_data().decode('utf8').strip('\''))
            print("-----REQUISICAO-----")
            print(data)
            print("-----FIM REQUISICAO-----")

            urls = data.get('uniqueImageUrls', [])

            result = []
            with ThreadPoolExecutor() as executor:
                futures = [executor.submit(detect, url) for url in urls]

                for future, url in zip(futures, urls):
                    try:
                        score = future.result()
                        result.append({"url": url, "score": score})
                    except Exception as e:
                        result.append({"url": url, "error": str(e)})

            print("-----RESPOSTA-----")
            print(result)
            print("-----FIM RESPOSTA-----")
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
