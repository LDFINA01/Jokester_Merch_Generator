import requests
import os
from dotenv import load_dotenv

def upload_to_vercel_blob(file_path, blob_name):
    """Upload a file to Vercel Blob Storage using the proper API"""
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    
    if not token:
        raise Exception("BLOB_READ_WRITE_TOKEN not set")
    
    # Vercel Blob API endpoint
    url = f"https://blob.vercel-storage.com/{blob_name}"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "x-vercel-blob-add": "true",  # Required header for adding blobs
    }
    
    with open(file_path, "rb") as f:
        file_content = f.read()
        response = requests.put(url, headers=headers, data=file_content)
    
    print(f"Blob upload response status: {response.status_code}")
    print(f"Blob upload response: {response.text}")
    
    if response.status_code in [200, 201]:
        response_data = response.json()
        # The response should contain a 'url' field
        blob_url = response_data.get("url")
        if blob_url:
            return blob_url
        else:
            raise Exception(f"No URL in response: {response_data}")
    else:
        raise Exception(f"Upload failed (status {response.status_code}): {response.text}")
