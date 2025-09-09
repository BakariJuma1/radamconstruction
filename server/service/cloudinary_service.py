import cloudinary
from cloudinary.uploader import upload
import os
import logging
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

logger = logging.getLogger(__name__)

def upload_files_to_cloudinary(files, folder="radam-construction"):
 
    if not isinstance(files, list):
        files = [files]  # normalize to list

    uploaded_results = []

    for file in files:
        try:
            result = upload(
                file,
                folder=folder,
                resource_type="image",
                overwrite=True,
                transformation=[
                    {"quality": "auto", "fetch_format": "auto", "width": 1200, "crop": "limit"}
                ]
            )

            uploaded_results.append({
                "secure_url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height")
            })

        except Exception as e:
            logger.error("Cloudinary upload failed for %s: %s", file.filename, e)
            raise RuntimeError(f"Failed to upload {file.filename} to Cloudinary")

    return uploaded_results
