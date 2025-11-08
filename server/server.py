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
        print(f"Received data: {data}")  # Debug logging
        video_url = data.get('video_url')
        theme = data.get('theme', 'colorful, high-energy, artistic')  # Default theme
        
        if not video_url:
            print("Error: Missing video_url in request")
            return jsonify({"error": "Missing video_url"}), 400
        
        print(f"Processing video from URL: {video_url}")
        print(f"Using theme: {theme}")

        # Download the video from the URL
        timestamp = int(time.time())
        video_path = f"/tmp/{timestamp}.mp4"  # Temporary local path
        print(f"Downloading video to: {video_path}")
        response = requests.get(video_url)
        if response.status_code != 200:
            print(f"Failed to download video: Status {response.status_code}")
            return jsonify({"error": f"Failed to download video: Status {response.status_code}"}), 500
        with open(video_path, 'wb') as f:
            f.write(response.content)
        print(f"Video downloaded successfully, size: {os.path.getsize(video_path)} bytes")
        
        # Process the video: transcribe, identify important word, extract/generate image
        print("Starting transcription...")
        transcript_data, word_timestamps = transcribe_with_timestamps(video_path)
        print(f"Transcription complete: {len(word_timestamps)} words")
        
        print("Identifying important moment...")
        important_word_data = identify_important_word(transcript_data, word_timestamps)
        if "error" in important_word_data:
            print(f"Error identifying important word: {important_word_data['error']}")
            return jsonify({"error": important_word_data["error"]}), 500
        print(f"Important moment identified: {important_word_data.get('phrase')} at {important_word_data.get('start')}s")
        
        # Use temp files for images
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_extracted:
            extracted_frame_path = temp_extracted.name
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_generated:
            generated_image_path = temp_generated.name
        
        print("Extracting frame from video...")
        extract_result = extract_image(important_word_data, video_path, extracted_frame_path)
        if "error" in extract_result:
            print(f"Error extracting frame: {extract_result['error']}")
            return jsonify({"error": extract_result["error"]}), 500
        print(f"Frame extracted successfully")
        
        print("Generating stylized image with DALL-E...")
        generated_image_path = generate_image(transcript_data, extracted_frame_path, important_word_data["phrase"], theme)
        if not generated_image_path:
            print("Image generation failed - no path returned")
            return jsonify({"error": "Image generation failed"}), 500
        print(f"Image generated: {generated_image_path}")
        
        # Upload the generated image to Vercel Blob
        print("Uploading generated image to Vercel Blob...")
        blob_url = upload_to_vercel_blob(generated_image_path, f"{timestamp}_generated.png")
        print(f"Upload successful: {blob_url}")
        
        # Clean up temporary files
        print("Cleaning up temporary files...")
        os.remove(video_path)
        os.remove(extracted_frame_path)
        os.remove(generated_image_path)
        
        print("Processing complete!")
        return jsonify({"image_url": blob_url, "phrase": important_word_data["phrase"]})
    
    except Exception as error:
        print(f"EXCEPTION in process(): {error}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error: {str(error)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
