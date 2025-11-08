import requests
import os
from dotenv import load_dotenv

def upload_to_vercel_blob(file_path, blob_name):
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    store_id = os.getenv("BLOB_STORE_ID")  # e.g., 'your-store-id'
    
    url = f"https://{store_id}.public.blob.vercel-storage.com/{blob_name}"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/octet-stream",  # Adjust based on file type
    }
    
    with open(file_path, "rb") as f:
        response = requests.put(url, headers=headers, data=f)
    
    if response.status_code == 200:
        return response.json().get("url")  # Assuming the response includes the URL
    else:
        raise Exception(f"Upload failed: {response.text}")
