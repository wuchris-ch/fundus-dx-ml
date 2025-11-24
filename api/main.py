from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import uvicorn

app = FastAPI(title="Fundus Classification API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Setup
class_names = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
device = torch.device("cuda:0" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")

def load_model():
    model = models.resnet18(weights=None) # Weights loaded from file
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))
    
    # Load trained weights
    # Assuming best_model.pth is in the parent directory relative to this script execution context
    # or we can specify absolute path. Let's assume it's in the project root.
    model_path = "best_model.pth" 
    try:
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
    except FileNotFoundError:
        print(f"Warning: {model_path} not found. Model will use random weights.")
    
    model = model.to(device)
    model.eval()
    return model

model = load_model()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.get("/")
async def root():
    return {"message": "Fundus Classification API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            top_prob, top_catid = torch.topk(probabilities, 1)
            
            confidence = top_prob.item()
            predicted_class = class_names[top_catid.item()]
            
            # Get all probabilities for visualization
            all_probs = {class_names[i]: probabilities[0][i].item() for i in range(len(class_names))}
            
        return {
            "prediction": predicted_class,
            "confidence": confidence,
            "probabilities": all_probs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
