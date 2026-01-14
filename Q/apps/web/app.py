from flask import Flask, render_template, request, jsonify
from helmet_detection import detect_helmet
import os

app = Flask(__name__)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/detect", methods=["POST"])
def detect():
    file = request.files["image"]
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    result = detect_helmet(path)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
