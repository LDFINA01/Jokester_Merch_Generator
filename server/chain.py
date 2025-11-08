from langchain_openai import ChatOpenAI 
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from moviepy import VideoFileClip
from PIL import Image, ImageDraw
import numpy as np
import json, io
import PIL.Image
import os
import tempfile, base64, random
from better_profanity import profanity

from openai import OpenAI

from dotenv import load_dotenv 
load_dotenv()


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

import re
def censor_text(text):
    # Strip special characters (keep letters, numbers, spaces)
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return profanity.censor(cleaned)

# function to generate an image from user questions list
def generate_image(transcript, frame_path, important_phrase):
    client = OpenAI()

    transcript = censor_text(transcript)
    important_phrase = censor_text(important_phrase)

    # Strong creative merch prompt
    prompt = (
        f"Radically redesign this frame into a vibrant, merch-worthy image inspired by this comedic transcript: {transcript}. "
        f"Feature the key phrase '{important_phrase}' prominently. "
        f"Make it colorful, bold, and artistic — suitable for stickers, t-shirts, or mugs. "
    )

    try:
        # Load and resize to 1024x1024
        base_image = Image.open(frame_path).convert("RGBA").resize((1024, 1024))

        # Create mostly-black mask (edit almost everything)
        mask = Image.new("L", base_image.size, 1)
        draw = ImageDraw.Draw(mask)

        # Add small gray blotches so the AI retains ~10% of structure
        for _ in range(15):
            x0, y0 = random.randint(0, 1024), random.randint(0, 1024)
            x1, y1 = x0 + random.randint(80, 250), y0 + random.randint(80, 250)
            draw.ellipse([x0, y0, x1, y1], fill=random.randint(60, 120))

        # Save temporary copies for API upload
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
            base_image.save(tmp_img, format="PNG")
            tmp_img_path = tmp_img.name
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_mask:
            mask.save(tmp_mask, format="PNG")
            tmp_mask_path = tmp_mask.name

    except Exception as e:
        return {"error": f"Image/mask creation failed: {e}"}

    try:
        # Generate the image
        result = client.images.edit(
            model="dall-e-2",
            image=open(tmp_img_path, "rb"),
            mask=open(tmp_mask_path, "rb"),
            prompt=prompt,
            size="1024x1024",
            n=1
        )

        # Return base64 image (no local file)
        return result.data[0].url
    except Exception as e:
        return {"error": f"Image generation failed: {e}"}
    finally:
        os.unlink(tmp_img_path)
        os.unlink(tmp_mask_path)

