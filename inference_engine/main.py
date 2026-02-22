from fastapi import FastAPI, File, UploadFile
import uvicorn
import base64
import numpy as np
import cv2
import io
from PIL import Image

app = FastAPI(title="Defect Segmentation API")

# TODO: Load your MAPTNet model here globally
# model = load_maptnet_model('weights.pth')
# model.eval()

@app.post("/predict")
async def predict_defect(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_array = np.array(image)
    
    # --- MOCK INFERENCE (Simulating a defect on the image) ---
    mask = np.zeros((img_array.shape[0], img_array.shape[1]), dtype=np.uint8)
    cv2.circle(mask, (150, 150), 50, 255, -1) # Draw a simulated defect
    
    confidence_score = 0.94
    has_defect = True
    # ---------------------------------------------------------

    # Convert mask to Base64 for web transmission
    _, buffer = cv2.imencode('.png', mask)
    mask_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "filename": file.filename,
        "has_defect": has_defect,
        "confidence": confidence_score,
        "mask_base64": mask_base64,
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)