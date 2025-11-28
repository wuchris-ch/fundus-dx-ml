import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os
from sklearn.metrics import classification_report
import numpy as np

def evaluate_model(data_dir, model_path):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data transforms (same as validation transforms in train.py)
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load validation dataset
    val_dir = os.path.join(data_dir, 'val')
    if not os.path.exists(val_dir):
        print(f"Error: Validation directory not found at {val_dir}")
        return

    image_dataset = datasets.ImageFolder(val_dir, data_transforms)
    dataloader = DataLoader(image_dataset, batch_size=32, shuffle=False, num_workers=4)
    class_names = image_dataset.classes
    print(f"Classes: {class_names}")

    # Load model
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))
    
    try:
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        print(f"Loaded model from {model_path}")
    except FileNotFoundError:
        print(f"Error: Model file not found at {model_path}")
        return

    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    print("Evaluating model...")
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=class_names))

if __name__ == "__main__":
    evaluate_model(data_dir="data/processed", model_path="best_model.pth")
