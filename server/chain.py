from langchain_openai import ChatOpenAI, OpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate, PromptTemplate
import json

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
