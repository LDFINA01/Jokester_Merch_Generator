from flask import Flask, jsonify, request
from dotenv import load_dotenv

import speech_recognition as sr 
from moviepy import VideoFileClip

app = Flask(__name__)
load_dotenv()


@app.route("/")
def home():
    return "Welcome to the server, nerd"

@app.route("/process", methods=["POST"])
def process():
    try:
        

    except Exception as error:
        return jsonify({"error": f"Error: {error}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
