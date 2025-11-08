from moviepy import VideoFileClip
from openai import OpenAI
from dotenv import load_dotenv
from chain import identify_important_word

load_dotenv()

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
    transcript, word_timestamps = transcribe_with_timestamps(audio_file_path="videoplayback3.mp4")
    frame = identify_important_word(transcript=transcript, word_timestamps=word_timestamps)
    print(frame)
