# Standard library imports
import base64
import io
import json
import os
import random
import re
import tempfile

# Third-party imports
from better_profanity import profanity
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from moviepy import VideoFileClip
from openai import OpenAI
from PIL import Image, ImageEnhance, ImageDraw, ImageFont
import numpy as np

load_dotenv()

client = OpenAI()

def identify_important_word(transcript, word_timestamps):
    # Validate input
    if not word_timestamps or not isinstance(word_timestamps, list):
       return {"error": "Invalid or empty word_timestamps"}

    # output json format 
    format = "{\"phrase\": \"<word_or_phrase>\", \"start\": \"<start_timestamp_as_float>\"}"

    # Create the prompt
    prompt = ChatPromptTemplate.from_messages([
       ("system", "You are an AI expert in comedy analysis for merchandise creation. Given a transcript and word-level timestamps, identify the single most important word or short phrase (e.g., punchline or key delivery moment. usually towards the end of the transcript). Respond ONLY with a JSON object in this exact format: {format}. Do not include any other text, explanations, or markdown."),
       ("user", "{transcript}\n\n{word_timestamps}")
    ])

    # Specify the model
    llm = ChatOpenAI(model_name="gpt-4-turbo", max_tokens=100)

    # Chain
    chain = prompt | llm | StrOutputParser()

    # Invoke and parse
    try:
        result = chain.invoke({"format": format, "transcript": str(word_timestamps), "word_timestamps": str(word_timestamps)})
        data = json.loads(result.strip())
        return data  # Return the JSON dict directly
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        return {"error": f"LLM parsing failed: {e}"}

    return frame

def extract_image(json_data, video_path, output_path="extracted_frame.png"):
    if not json_data or "start" not in json_data:
        return {"error": "Invalid json_data or missing 'start' key"}
    
    start_time = json_data["start"]
    if not isinstance(start_time, (int, float)):
        return {"error": "'start' must be a number"}
    
    try:
        clip = VideoFileClip(video_path)
        frame = clip.get_frame(start_time)  
        clip.close()
    except Exception as e:
        return {"error": f"Video processing failed: {e}"}
    
    try:
        image = Image.fromarray(frame.astype(np.uint8))
        image = image.convert("RGBA")  # Always convert to RGBA
        image.save(output_path)
        return {"image_path": output_path}
    except Exception as e:
        return {"error": f"Image saving failed: {e}"}

def censor_text(text):
    # Strip special characters (keep letters, numbers, spaces)
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return profanity.censor(cleaned)

def generate_image(transcript, frame_path, important_phrase):
    transcript = censor_text(transcript)
    important_phrase = censor_text(important_phrase)

    
    prompt = (
        f"Transform this frame into a vibrant, merch-worthy logo inspired by the comedic transcript: {transcript}. "
        f"If a comedian appears in the frame, include and stylize them as a central, recognizable character — expressive, confident, and part of the design. "
        f"Feature the key phrase '{important_phrase}' prominently in a creative, bold typography style that complements the art. "
        f"Use a colorful, high-energy, artistic style that would look great on stickers, t-shirts, or mugs. "
        f"Maintain the humor and personality of the moment."
    )


    try:
        with open(frame_path, "rb") as img_file:
            result = client.images.edit(
                model="gpt-image-1",
                image=img_file,
                prompt=prompt,
                size="1024x1024",
                n=1
            )

        # Decode Base64 → bytes
        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        # Save to local file
        output_path = os.path.join(os.getcwd(), "output.png")
        with open(output_path, "wb") as f:
            f.write(image_bytes)

        print(f"✅ Image saved as: {output_path}")
        return output_path
    except Exception as error:
        print("Unable to generate image.")

# Function to transcribe with timestamps
def transcribe_with_timestamps(audio_file_path, model="whisper-1"):
    client = OpenAI()
    with open(audio_file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model=model,
            file=audio_file,
            response_format="verbose_json",  # Includes timestamps
            timestamp_granularities=["word"]  # Word-level timestamps
        )
    
     # Extract word timestamps directly from response.words
    word_timestamps = []
    if hasattr(response, "words") and response.words:
        for word in response.words:  # response.words is the list of TranscriptionWord objects
            word_timestamps.append({
                "word": word.word,
                "start": word.start,
                "end": word.end
            })
    else:
        print("No words found in response.")

    # extract complete text and return 
    transcript = getattr(response, 'text', '')
    return transcript, word_timestamps

if __name__ == "__main__":
    video_file_path="videoplayback3.mp4"
    extracted_frame_path="extracted_frame.png"
    output_image_path="output.png"

    transcript, word_timestamps = transcribe_with_timestamps(audio_file_path=video_file_path)
    frame_json = identify_important_word(transcript=transcript, word_timestamps=word_timestamps)
    print(frame_json)

    extract_image(frame_json, video_path=video_file_path, output_path=extracted_frame_path)
    
    generate_image(transcript, extracted_frame_path, frame_json["phrase"])
