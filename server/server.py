from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
import time
import requests

from transcript_gen import identify_important_word, extract_image, transcribe_with_timestamps, generate_image
from database_ops import upload_to_vercel_blob 

app = Flask(__name__)
load_dotenv()

@app.route("/")
def home():
    return "Welcome to the server, nerd"

@app.route("/process", methods=["POST"])
def process():
    try:
        # Get the video URL from the request
        data = request.get_json()
        video_url = data.get('video_url')
        theme = data.get('theme')
        if not video_url:
            return jsonify({"error": "Missing video_url"}), 400

        # Download the video from the URL
        timestamp = int(time.time())
        video_path = f"/tmp/{timestamp}.mp4"  # Temporary local path
        response = requests.get(video_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to download video"}), 500
        with open(video_path, 'wb') as f:
            f.write(response.content)
        
        # Process the video: transcribe, identify important word, extract/generate image
        transcript_data, word_timestamps = transcribe_with_timestamps(video_path)
        important_word_data = identify_important_word(transcript_data, word_timestamps)
        if "error" in important_word_data:
            return jsonify({"error": important_word_data["error"]}), 500
        
        # Use temp files for images
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_extracted:
            extracted_frame_path = temp_extracted.name
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_generated:
            generated_image_path = temp_generated.name
        
        extract_result = extract_image(important_word_data, video_path, extracted_frame_path)
        if "error" in extract_result:
            return jsonify({"error": extract_result["error"]}), 500
        
        generated_image_path = generate_image(transcript_data, extracted_frame_path, important_word_data["phrase"], theme)
        if not generated_image_path:
            return jsonify({"error": "Image generation failed"}), 500
        
        # Upload the generated image to Vercel Blob
        blob_url = upload_to_vercel_blob(generated_image_path, f"{timestamp}_generated.png")
        
        # Clean up temporary files
        os.remove(video_path)
        os.remove(extracted_frame_path)
        os.remove(generated_image_path)
        
        return jsonify({"image_url": blob_url})
    
    except Exception as error:
        return jsonify({"error": f"Error: {error}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
