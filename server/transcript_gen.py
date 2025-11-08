import speech_recognition as sr 
from moviepy import VideoFileClip

def create_transcript(video_file_path, audio_output_path="result_audio.wav"):
    clip = VideoFileClip(video_file_path)
    audio = clip.audio 
    audio.write_audiofile(audio_output_path, codec="pcm_s16le")
    clip.close()

    # instantiate recognizer and transcribe the audio 
    recognizer = sr.Recognizer() 

    with sr.AudioFile(audio_output_path) as source:
        audio_data = recognizer.record(source)
        print("got audio data.")

    #try: 
        transcript = recognizer.recognize_google(audio_data)
        print(f"Transcript: {transcript}")
    #except Exception as error:
    #    print(f"Unable to transcribe: {error}")

if __name__ == "__main__":
    create_transcript("videoplayback3.mp4")
