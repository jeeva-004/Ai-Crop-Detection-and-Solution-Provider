from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import torch
from torchvision import transforms, models   # ✅ fixed import

app = FastAPI()

# ✅ Classes (MUST match training order)
CLASS_NAMES = [
    "Bacterial_Leaf_Blight",
    "Brown_Spot",
    "Healthy_Rice_Leaf",
    "Leaf_Blast",
    "Leaf_scald",
    "Sheath_Blight"
]

# ✅ Load model (UPDATED: no deprecated argument)
model = models.mobilenet_v2(weights=None)   # ✅ FIXED
model.classifier[1] = torch.nn.Linear(
    model.last_channel, len(CLASS_NAMES)
)

model.load_state_dict(
    torch.load("models/rice_mobilenet.pth", map_location="cpu")
)

model.eval()

# ✅ Image transforms (same as training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    image_bytes = await image.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probs, 1)

    return {
        "disease": CLASS_NAMES[predicted.item()],
        "confidence": round(confidence.item(), 4)
    }
